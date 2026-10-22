const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");
const Ajv = require("ajv");
const engine = require("./flow-engine.js");
const folder = __dirname;
const data = JSON.parse(
  fs.readFileSync(path.join(folder, "flow.json"), "utf8"),
);

async function harness(options = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => errors.push(error.message));
  const dom = new JSDOM(
    fs.readFileSync(path.join(folder, "index.html"), "utf8"),
    {
      runScripts: "outside-only",
      url: "http://localhost:4173/",
      pretendToBeVisual: true,
      virtualConsole,
    },
  );
  dom.window.matchMedia = () => ({ matches: true });
  const scrollCalls = [];
  dom.window.scrollTo = (options) => scrollCalls.push(options);
  const requests = [];
  dom.window.fetch = async (url, init) => {
    requests.push({ url, init });
    const body =
      url === "/api/editor"
        ? {
            editor: "KWrite",
            defaultId: "auto",
            token: "local-token",
            available: [
              { id: "zed", label: "Zed" },
              { id: "kwrite", label: "KWrite" },
            ],
          }
        : url === "/api/open-source"
          ? {
              editor: "Zed",
              lineSupported: true,
            }
          : structuredClone(data);
    return { ok: true, json: async () => body };
  };
  if (options.blockStorage) {
    Object.defineProperty(dom.window, "localStorage", {
      get() {
        throw new Error("Storage bloqueado");
      },
    });
  }
  dom.window.eval(fs.readFileSync(path.join(folder, "flow-engine.js"), "utf8"));
  dom.window.eval(
    fs.readFileSync(path.join(folder, "floating-panels.js"), "utf8"),
  );
  dom.window.eval(
    fs.readFileSync(path.join(folder, "workspace-layout.js"), "utf8"),
  );
  dom.window.eval(fs.readFileSync(path.join(folder, "study-mode.js"), "utf8"));
  dom.window.eval(fs.readFileSync(path.join(folder, "app.js"), "utf8"));
  await new Promise((resolve) => setTimeout(resolve, 15));
  return {
    dom,
    window: dom.window,
    document: dom.window.document,
    errors,
    requests,
    scrollCalls,
  };
}

function fullscreenApi(h, { reject = false, pending = false } = {}) {
  const api = { element: null, requests: 0, exits: 0 };
  const change = () =>
    h.document.dispatchEvent(new h.window.Event("fullscreenchange"));
  Object.defineProperty(h.document, "fullscreenElement", {
    get: () => api.element,
    configurable: true,
  });
  h.document.documentElement.requestFullscreen = () => {
    api.requests++;
    if (reject) return Promise.reject(new Error("Tela cheia indisponível"));
    return new Promise((resolve) => {
      api.complete = () => {
        api.element = h.document.documentElement;
        change();
        resolve();
      };
      if (!pending) api.complete();
    });
  };
  api.leave = () => {
    api.element = null;
    change();
  };
  h.document.exitFullscreen = async () => {
    api.exits++;
    api.leave();
  };
  return api;
}

test("o contrato e as referências preservam as relações do exemplo empacotado", () => {
  const schema = JSON.parse(
    fs.readFileSync(path.join(folder, "flow.schema.json"), "utf8"),
  );
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  assert.ok(validate(data), JSON.stringify(validate.errors));
  engine.validate(data);
  assert.equal(data.frames["rxjs-type"].kind, "declaration");
  assert.equal(data.frames["rxjs-body"].line, 204);
  const request = data.traces.load.frameIds;
  assert.ok(
    request.indexOf("service-entry") < request.indexOf("service-return"),
  );
  assert.ok(
    request.indexOf("load-callback-context") < request.indexOf("rxjs-body"),
  );
  assert.ok(
    request.indexOf("interceptor-next") < request.indexOf("rxjs-return"),
  );
});

test("os trechos correspondem ao projeto original quando sua raiz é informada", {
  skip: process.env.FLOW_LAB_SOURCE_ROOT ? false : "Defina FLOW_LAB_SOURCE_ROOT para conferir os fontes externos",
}, () => {
  const root = path.resolve(process.env.FLOW_LAB_SOURCE_ROOT);
  for (const source of Object.values(data.sources)) {
    const real = fs
      .readFileSync(path.join(root, source.path), "utf8")
      .split("\n");
    for (const row of engine.sourceLines(source))
      assert.equal(
        row.text,
        real[row.number - 1],
        source.path + ":" + row.number,
      );
  }
});

test("JSON inválido falha antes de renderizar referências quebradas", () => {
  const bad = structuredClone(data);
  bad.frames["load-call"].target.line = 999999;
  assert.throws(() => engine.validate(bad), /destino inexistente/);
  const unknown = structuredClone(data);
  unknown.graph.nodes[0].traceId = "não-existe";
  assert.throws(() => engine.validate(unknown), /sem etapa, trilha/);
  const wrongPrimary = structuredClone(data);
  wrongPrimary.steps[0].primaryNodeId = "card";
  assert.throws(() => engine.validate(wrongPrimary), /primaryNodeId inválido/);
  const noTrace = structuredClone(data);
  noTrace.graph.nodes = noTrace.graph.nodes.filter((node) => node.step !== 9);
  noTrace.steps[9].activeNodes = [];
  delete noTrace.steps[9].primaryNodeId;
  assert.throws(() => engine.validate(noTrace), /etapa sem trilha/);
});

test("primeira etapa já selecionada; clique e navegação de linhas mantêm fonte e painel", async () => {
  const h = await harness();
  try {
    const d = h.document;
    assert.equal(d.querySelector("#lineInspector").hidden, false);
    assert.equal(h.window.FlowLab.getState().nodeId, "html");
    assert.equal(h.window.FlowLab.getState().frame, 0);
    assert.match(d.querySelector("#sourcePath").textContent, /index.html:6$/);
    d.querySelector('[data-node-id="load"]').click();
    assert.equal(d.querySelector("#lineInspector").hidden, false);
    assert.equal(h.window.FlowLab.getState().step, 7);
    assert.match(
      d.querySelector("#sourcePath").textContent,
      /catalog.component.ts:107$/,
    );
    d.querySelector("#lineNext").click();
    assert.match(d.querySelector("#sourcePath").textContent, /:108$/);
    assert.equal(h.window.FlowLab.getState().step, 7);
    h.window.FlowLab.moveFrame(3);
    assert.match(
      d.querySelector("#sourcePath").textContent,
      /product.service.ts:53$/,
    );
    assert.ok(d.querySelectorAll(".source-tab").length >= 4);
    d.querySelector("#lineInspector [data-detach]").click();
    const sourceCode = d.querySelector("#sourceCode");
    sourceCode.scrollTop = 35;
    sourceCode.scrollLeft = 25;
    d.querySelector("#lineInspector [data-dock]").click();
    assert.equal(sourceCode.scrollTop, 35);
    assert.equal(sourceCode.scrollLeft, 25);
    assert.equal(d.querySelector("#lineInspector").hidden, false);
    assert.equal(h.window.FlowLab.getState().nodeId, "load");
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("todos os percursos e cenários são navegáveis; erro, vazio e sucesso têm quadros distintos", async () => {
  const h = await harness();
  try {
    for (const scenario of data.scenarios) {
      h.window.FlowLab.setScenario(scenario.id);
      for (const node of data.graph.nodes.filter(
        (n) => !n.scenarios || n.scenarios.includes(scenario.id),
      )) {
        h.window.FlowLab.openNode(node.id);
        const count = engine.traceFrames(
          data,
          node.traceId,
          scenario.id,
        ).length;
        for (let i = 1; i < count; i++)
          h.document.querySelector("#lineNext").click();
        assert.equal(h.window.FlowLab.getState().frame, count - 1);
        assert.equal(
          h.document.querySelector("#lineNext").disabled,
          node.step === data.steps.length - 1,
        );
        assert.ok(h.document.querySelector(".code-line.is-current"));
      }
    }
    h.window.FlowLab.openNode("error");
    assert.equal(h.window.FlowLab.getState().scenario, "error");
    assert.match(
      h.document.querySelector("#frameTitle").textContent,
      /error chega/,
    );
    h.window.FlowLab.openNode("empty");
    assert.equal(h.window.FlowLab.getState().scenario, "empty");
    h.window.FlowLab.setScenario("success");
    h.window.FlowLab.selectStep(11);
    assert.match(
      h.document.querySelector("#stepTitle").textContent,
      /ProductCard/,
    );
    h.window.FlowLab.openNode("reentry");
    assert.equal(
      engine
        .traceFrames(data, "reentry", "success")
        .some((f) => f.id === "page-event"),
      false,
    );
    h.document.querySelectorAll("#branchPanel button")[1].click();
    assert.equal(h.window.FlowLab.getState().frame, 0);
    h.document.querySelector("#lineNext").click();
    assert.match(h.document.querySelector("#sourcePath").textContent, /:130$/);
    h.document.querySelector("#lineBack").click();
    assert.match(
      h.document.querySelector("#frameTitle").textContent,
      /origem do evento/,
    );
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("janelas internas preservam conteúdo, eventos e encaixe original", async () => {
  const h = await harness();
  try {
    for (const id of [
      "lessonPanel",
      "lineInspector",
      "runtimePanel",
      "glossary",
    ]) {
      const panel = h.document.getElementById(id),
        parent = panel.parentElement;
      panel.querySelector("[data-detach]").click();
      assert.equal(panel.parentElement.id, "floatingLayer");
      assert.equal(panel.classList.contains("is-detached"), true);
      assert.equal(parent.querySelectorAll(".floating-placeholder").length, 1);
      assert.equal(
        parent.querySelector(".floating-placeholder").dataset.panelSlot,
        panel.dataset.panelSlot,
      );
      assert.equal(panel.querySelector("[data-dock]").hidden, false);
      assert.equal(h.document.querySelectorAll("#" + id).length, 1);
      panel.querySelector("[data-dock]").click();
      assert.equal(panel.parentElement, parent);
      assert.equal(panel.style.width, "");
      assert.equal(parent.querySelectorAll(".floating-placeholder").length, 0);
    }
    h.window.FlowLab.floatingPanels.detach("lessonPanel");
    h.window.FlowLab.selectStep(4);
    assert.match(h.document.querySelector("#stepTitle").textContent, /Router/);
    h.window.FlowLab.floatingPanels.detach("glossary");
    const search = h.document.querySelector("#termSearch");
    search.value = "Observable";
    search.dispatchEvent(new h.window.Event("input"));
    assert.match(
      h.document.querySelector("#termList").textContent,
      /Observable/,
    );
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("layout tem quatro painéis diretos, configurações agrupadas e nenhum rodapé de etapas", async () => {
  const h = await harness();
  try {
    const d = h.document;
    assert.deepEqual(
      [...d.querySelectorAll("#workspace > [data-panel-slot]")].map(
        (p) => p.id,
      ),
      ["lessonPanel", "lineInspector", "runtimePanel", "glossary"],
    );
    assert.equal(d.querySelector(".control-dock"), null);
    assert.equal(d.querySelector("#nextButton"), null);
    assert.equal(d.querySelector("#backButton"), null);
    assert.equal(d.querySelector(".line-controls"), null);
    assert.deepEqual(
      [...d.querySelector(".control-buttons").children].map(
        (button) => button.id,
      ),
      ["lineBack", "openSource", "lineNext"],
    );
    assert.ok(
      d.querySelector(".code-progress").contains(d.querySelector("#traceRail")),
    );
    assert.ok(
      d.querySelector(".code-progress").contains(d.querySelector("#frameKind")),
    );
    for (const id of ["flowImport", "soundToggle", "editorSelect"])
      assert.ok(
        d.querySelector("#settingsMenu").contains(d.getElementById(id)),
      );
    const settings = d.querySelector("#settingsMenu");
    settings.querySelector("summary").click();
    assert.equal(settings.open, true);
    d.querySelector("#soundToggle").click();
    assert.match(d.querySelector("#soundLabel").textContent, /OFF/);
    d.querySelector("#stepTitle").dispatchEvent(
      new h.window.Event("pointerdown", { bubbles: true }),
    );
    assert.equal(settings.open, false);
    settings.open = true;
    d.querySelector("#editorSelect").dispatchEvent(
      new h.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    assert.equal(settings.open, false);
    assert.equal(h.window.FlowLab.getState().nodeId, "html");
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("divisórias ajustam painéis vizinhos sem navegar, respeitam mínimos e o reencaixe", async () => {
  const h = await harness();
  try {
    const workspace = h.document.querySelector("#workspace");
    const slots = ["lesson", "inspector", "runtime"];
    const initial = [400, 400, 720];
    for (const [index, slot] of slots.entries()) {
      const rect = () => ({
        width:
          parseFloat(
            workspace.style.getPropertyValue("--" + slot + "-width"),
          ) || initial[index],
      });
      h.document.querySelector(
        '[data-panel-slot="' + slot + '"]',
      ).getBoundingClientRect = rect;
    }
    const layout = h.window.FlowLab.workspaceLayout;
    layout.refresh();
    const [first, second] = workspace.querySelectorAll('[role="separator"]');
    const before = h.window.FlowLab.getState();
    const pointer = (target, type, x, pointerId = 1) => {
      const event = new h.window.MouseEvent(type, {
        button: 0,
        clientX: x,
        bubbles: true,
      });
      Object.defineProperty(event, "pointerId", { value: pointerId });
      target.dispatchEvent(event);
    };
    pointer(first, "pointerdown", 400);
    pointer(h.document, "pointermove", 460, 2); // Outro ponteiro não interfere.
    assert.equal(workspace.style.getPropertyValue("--lesson-width"), "");
    pointer(h.document, "pointermove", 460);
    assert.equal(workspace.style.getPropertyValue("--lesson-width"), "460fr");
    assert.equal(
      workspace.style.getPropertyValue("--inspector-width"),
      "340fr",
    );
    assert.equal(workspace.style.getPropertyValue("--runtime-width"), "720fr");
    pointer(h.document, "pointercancel", 460);
    assert.equal(layout.drag, null);
    assert.equal(workspace.classList.contains("is-resizing"), false);
    first.dispatchEvent(
      new h.window.KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    assert.equal(workspace.style.getPropertyValue("--lesson-width"), "540fr");
    assert.equal(
      workspace.style.getPropertyValue("--inspector-width"),
      "260fr",
    );
    second.dispatchEvent(
      new h.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
      }),
    );
    assert.equal(
      workspace.style.getPropertyValue("--inspector-width"),
      "284fr",
    );
    assert.equal(workspace.style.getPropertyValue("--runtime-width"), "696fr");
    assert.deepEqual(h.window.FlowLab.getState(), before);
    h.window.FlowLab.floatingPanels.detach("lineInspector");
    await Promise.resolve();
    for (const handle of [first, second]) {
      assert.equal(handle.getAttribute("aria-disabled"), "true");
      assert.equal(handle.tabIndex, -1);
    }
    first.dispatchEvent(
      new h.window.KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    assert.equal(workspace.style.getPropertyValue("--lesson-width"), "540fr");
    h.window.FlowLab.floatingPanels.dock("lineInspector");
    await Promise.resolve();
    assert.equal(first.getAttribute("aria-disabled"), "false");
    assert.equal(first.tabIndex, 0);
    assert.equal(
      workspace.style.getPropertyValue("--inspector-width"),
      "284fr",
    );
    Object.defineProperty(h.window, "innerWidth", {
      value: 390,
      configurable: true,
    });
    h.window.dispatchEvent(new h.window.Event("resize"));
    assert.equal(first.getAttribute("aria-disabled"), "true");
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("guias imediatos acompanham as explicações e suas fontes não alteram o percurso", async () => {
  const h = await harness();
  try {
    const d = h.document;
    assert.equal(
      d.querySelector("#stepSummary").nextElementSibling.id,
      "stepTerms",
    );
    assert.equal(
      d
        .querySelector(".frame-explanation")
        .nextElementSibling.querySelector("#frameTerms").id,
      "frameTerms",
    );
    h.window.FlowLab.openNode("catalog");
    const before = h.window.FlowLab.getState();
    const guide = d.querySelector("#frameTerms .term-card");
    assert.equal(guide.open, true);
    guide.querySelector(".source-link").click();
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.equal(d.querySelector("#returnToTrace").hidden, false);
    d.querySelector("#returnToTrace").click();
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.equal(d.querySelector(".control-grip").textContent.trim(), "");
    assert.ok(d.querySelector(".control-grip").getAttribute("aria-label"));
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("botões e setas percorrem a mesma linha, incluindo bordas entre etapas", async () => {
  const h = await harness();
  const key = (name, target = h.document.body, altKey = false) =>
    target.dispatchEvent(
      new h.window.KeyboardEvent("keydown", {
        key: name,
        altKey,
        bubbles: true,
      }),
    );
  try {
    key("ArrowRight");
    assert.equal(h.window.FlowLab.getState().frame, 1);
    assert.equal(h.window.FlowLab.getState().step, 0);
    h.document.querySelector("#lineNext").click();
    assert.equal(h.window.FlowLab.getState().frame, 2);
    assert.equal(h.window.FlowLab.getState().step, 0);
    key("ArrowRight");
    assert.equal(h.window.FlowLab.getState().nodeId, "bootstrap");
    assert.equal(h.window.FlowLab.getState().frame, 0);
    h.document.querySelector("#lineBack").click();
    assert.equal(h.window.FlowLab.getState().nodeId, "html");
    assert.equal(h.window.FlowLab.getState().frame, 2);
    key("ArrowLeft");
    assert.equal(h.window.FlowLab.getState().frame, 1);
    key("ArrowRight", h.document.querySelector("#termSearch"));
    key("ArrowRight", h.document.querySelector("#soundToggle"));
    assert.equal(h.window.FlowLab.getState().frame, 1);
    h.window.FlowLab.floatingPanels.detach("lineInspector");
    const handle = h.document.querySelector("#lineInspector .panel-toolbar");
    key("ArrowRight", handle);
    assert.equal(h.window.FlowLab.getState().frame, 2);
    key("ArrowRight", handle, true);
    assert.equal(h.window.FlowLab.getState().frame, 2);
    key("Escape", handle);
    assert.equal(
      h.window.FlowLab.floatingPanels.isDetached("lineInspector"),
      false,
    );
    h.document.querySelector("#restartButton").click();
    key("ArrowLeft");
    assert.equal(h.window.FlowLab.getState().frame, 0);
    assert.equal(h.window.FlowLab.getState().step, 0);
    assert.equal(h.document.querySelector("#lineBack").disabled, true);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("tela cheia preserva janelas, larguras e navegação; cenário acompanha o runtime", async () => {
  const h = await harness();
  try {
    const d = h.document;
    const trigger = d.getElementById("studyModeToggle");
    const before = h.window.FlowLab.getState();
    const workspace = d.getElementById("workspace");
    workspace.style.setProperty("--lesson-width", "300fr");
    const widths = workspace.getAttribute("style");
    h.window.FlowLab.floatingPanels.detach("lineInspector");
    h.window.FlowLab.floatingPanels.detach("glossary");
    d.getElementById("settingsMenu").open = true;
    trigger.click();
    assert.equal(h.window.FlowLab.studyMode.active, true);
    assert.equal(d.body.classList.contains("is-study-mode"), true);
    assert.equal(trigger.getAttribute("aria-pressed"), "true");
    assert.equal(d.getElementById("settingsMenu").open, false);
    assert.equal(d.activeElement, d.querySelector(".study-mode-exit"));
    assert.equal(
      h.window.FlowLab.floatingPanels.isDetached("lineInspector"),
      true,
    );
    assert.equal(h.window.FlowLab.floatingPanels.isDetached("glossary"), true);
    assert.equal(workspace.getAttribute("style"), widths);
    assert.deepEqual(h.window.FlowLab.getState(), before);
    const runtime = d.getElementById("runtimePanel");
    assert.ok(runtime.contains(d.getElementById("scenarioControls")));
    assert.equal(d.querySelectorAll("#scenarioControls").length, 1);
    h.window.FlowLab.floatingPanels.detach("runtimePanel");
    assert.ok(runtime.contains(d.getElementById("scenarioControls")));
    runtime.querySelector('[data-scenario="error"]').click();
    assert.equal(h.window.FlowLab.getState().scenario, "error");
    d.getElementById("lineNext").click();
    assert.equal(h.window.FlowLab.getState().frame, before.frame + 1);
    const position = h.window.FlowLab.getState();
    h.window.FlowLab.load(structuredClone(data));
    assert.equal(h.window.FlowLab.studyMode.active, true);
    assert.equal(d.querySelectorAll("#scenarioControls").length, 1);
    d.querySelector(".study-mode-exit").click();
    assert.equal(h.window.FlowLab.studyMode.active, false);
    assert.equal(d.body.classList.contains("is-study-mode"), false);
    assert.equal(trigger.getAttribute("aria-pressed"), "false");
    assert.equal(d.querySelector(".study-mode-exit").hidden, true);
    assert.equal(d.activeElement, trigger);
    assert.equal(workspace.getAttribute("style"), widths);
    assert.equal(d.querySelectorAll("#lineInspector").length, 1);
    assert.ok(position.frame > 0);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("Fullscreen API entra e Esc sai sem reencaixar a janela nem perder o quadro", async () => {
  const h = await harness();
  try {
    const api = fullscreenApi(h);
    h.window.FlowLab.openNode("load");
    h.window.FlowLab.moveFrame(1);
    h.window.FlowLab.floatingPanels.detach("lineInspector");
    const before = h.window.FlowLab.getState();
    await h.window.FlowLab.studyMode.enter(
      h.document.getElementById("studyModeToggle"),
    );
    assert.equal(api.requests, 1);
    assert.equal(api.element, h.document.documentElement);
    h.document
      .querySelector("#lineInspector .panel-toolbar")
      .dispatchEvent(
        new h.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    await Promise.resolve();
    assert.equal(api.exits, 1);
    assert.equal(api.element, null);
    assert.equal(h.window.FlowLab.studyMode.active, false);
    assert.equal(
      h.window.FlowLab.floatingPanels.isDetached("lineInspector"),
      true,
    );
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.equal(h.scrollCalls.at(-1).top, 0);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("saída nativa do navegador sincroniza a interface sem reiniciar o estudo", async () => {
  const h = await harness();
  try {
    const api = fullscreenApi(h);
    await h.window.FlowLab.studyMode.enter(
      h.document.getElementById("studyModeToggle"),
    );
    h.window.FlowLab.moveFrame(1);
    const before = h.window.FlowLab.getState();
    api.leave();
    assert.equal(h.window.FlowLab.studyMode.active, false);
    assert.equal(h.document.body.classList.contains("is-study-mode"), false);
    assert.equal(h.document.activeElement.id, "studyModeToggle");
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("recusa da Fullscreen API mantém o modo de estudo utilizável na janela", async () => {
  const h = await harness();
  try {
    const api = fullscreenApi(h, { reject: true });
    await h.window.FlowLab.studyMode.enter(
      h.document.getElementById("studyModeToggle"),
    );
    assert.equal(api.requests, 1);
    assert.equal(h.window.FlowLab.studyMode.active, true);
    assert.equal(h.document.body.classList.contains("is-study-mode"), true);
    assert.equal(h.window.FlowLab.studyMode.native, false);
    await h.window.FlowLab.studyMode.exit();
    assert.equal(api.exits, 0);
    assert.equal(h.window.FlowLab.studyMode.active, false);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("sair durante a solicitação pendente não deixa o navegador preso em tela cheia", async () => {
  const h = await harness();
  try {
    const api = fullscreenApi(h, { pending: true });
    const request = h.window.FlowLab.studyMode.enter(
      h.document.getElementById("studyModeToggle"),
    );
    assert.equal(h.window.FlowLab.studyMode.active, true);
    await h.window.FlowLab.studyMode.exit();
    assert.equal(h.window.FlowLab.studyMode.active, false);
    api.complete();
    await request;
    assert.equal(api.exits, 1);
    assert.equal(api.element, null);
    assert.equal(h.window.FlowLab.studyMode.active, false);
    assert.equal(h.document.body.classList.contains("is-study-mode"), false);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("chegar à última linha não dispara temporizador; só o próximo avanço atravessa a etapa", async () => {
  const h = await harness(),
    callbacks = [];
  h.window.setTimeout = (callback) => {
    callbacks.push(callback);
    return callbacks.length;
  };
  try {
    h.window.FlowLab.moveFrame(999);
    assert.equal(h.window.FlowLab.getState().step, 0);
    assert.equal(h.document.querySelector("#autoAdvanceStatus"), null);
    assert.equal(callbacks.length, 0);
    h.document.querySelector("#lineNext").click();
    assert.equal(h.window.FlowLab.getState().step, 1);
    assert.equal(h.window.FlowLab.getState().frame, 0);
    h.document.querySelector("#lineBack").click();
    assert.equal(h.window.FlowLab.getState().step, 0);
    assert.equal(h.window.FlowLab.getState().frame, 2);
    assert.equal(callbacks.length, 0);
    h.window.FlowLab.openNode("http");
    h.window.FlowLab.setScenario("error");
    h.window.FlowLab.moveFrame(999);
    h.window.FlowLab.moveFrame(1);
    assert.equal(h.window.FlowLab.getState().nodeId, "error");
    h.window.FlowLab.moveFrame(999);
    h.window.FlowLab.moveFrame(1);
    assert.equal(h.window.FlowLab.getState().nodeId, "view");
    assert.equal(h.window.FlowLab.getState().scenario, "error");
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("progresso e linhas do código não são atalhos; consulta a arquivo não altera o percurso", async () => {
  const h = await harness();
  try {
    h.window.FlowLab.openNode("load");
    const before = h.window.FlowLab.getState();
    assert.equal(h.document.querySelectorAll("#traceRail button").length, 0);
    assert.equal(h.document.querySelectorAll("#sourceCode button").length, 0);
    h.document.querySelectorAll("#traceRail .trace-dot")[5].click();
    h.document.querySelectorAll("#sourceCode .code-line")[3].click();
    assert.deepEqual(h.window.FlowLab.getState(), before);
    h.document.querySelectorAll("#sourceTabs .source-tab")[1].click();
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.equal(h.document.querySelector("#returnToTrace").hidden, false);
    h.document.querySelector("#returnToTrace").click();
    assert.match(
      h.document.querySelector("#sourcePath").textContent,
      /catalog.component.ts:107$/,
    );
    assert.equal(h.document.querySelector("#returnToTrace").hidden, true);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("retorno pela fronteira preserva o ramo realmente visitado", async () => {
  const h = await harness();
  try {
    h.window.FlowLab.openNode("cart");
    h.window.FlowLab.moveFrame(999);
    const previous = h.window.FlowLab.getState();
    h.window.FlowLab.moveFrame(1);
    assert.equal(h.window.FlowLab.getState().nodeId, "router");
    h.window.FlowLab.moveFrame(-1);
    assert.deepEqual(h.window.FlowLab.getState(), previous);
    h.window.FlowLab.moveFrame(1);
    assert.equal(h.window.FlowLab.getState().nodeId, "router");
    assert.equal(h.window.FlowLab.getState().frame, 0);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("barra permanece móvel e seu movimento por Alt+seta não avança o código", async () => {
  const h = await harness();
  try {
    const grip = h.document.querySelector(".control-grip"),
      dock = h.document.querySelector("#flowControls");
    const before = h.window.FlowLab.getState();
    grip.dispatchEvent(
      new h.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        altKey: true,
        bubbles: true,
      }),
    );
    assert.deepEqual(h.window.FlowLab.getState(), before);
    assert.equal(h.window.FlowLab.controlsDock.anchored, false);
    assert.equal(dock.style.transform, "none");
    assert.ok(parseFloat(dock.style.left) >= 8);
    assert.equal(h.document.querySelectorAll("#flowControls").length, 1);
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("abertura no editor envia fonte e linha atuais, com preferência mesmo sem storage", async () => {
  for (const blockStorage of [false, true]) {
    const h = await harness({ blockStorage });
    try {
      h.window.FlowLab.openNode("load");
      h.window.FlowLab.moveFrame(1);
      const select = h.document.querySelector("#editorSelect");
      select.value = "zed";
      select.dispatchEvent(new h.window.Event("change"));
      await h.window.FlowLab.openSourceInEditor();
      const request = h.requests.find(
        (item) => item.url === "/api/open-source",
      );
      assert.equal(request.init.headers["X-Flow-Lab-Token"], "local-token");
      assert.deepEqual(JSON.parse(request.init.body), {
        path: data.sources.catalog.path,
        line: 108,
        editor: "zed",
      });
      assert.equal(select.value, "zed");
      assert.equal(h.document.querySelector("#openSource").disabled, false);
      assert.match(
        h.document.querySelector("#editorStatus").textContent,
        /Zed.*:108/,
      );
      assert.deepEqual(h.errors, []);
    } finally {
      h.window.close();
    }
  }
});

test("avanço entre etapas cobre toda a cadeia nos três cenários sem perder o painel", async () => {
  const h = await harness();
  try {
    for (const scenario of data.scenarios) {
      h.window.FlowLab.setScenario(scenario.id);
      h.window.FlowLab.openNode("html");
      const visited = [];
      for (let step = 0; step < data.steps.length - 1; step++) {
        assert.equal(h.window.FlowLab.getState().step, step);
        assert.ok(h.window.FlowLab.getState().nodeId);
        assert.equal(h.document.querySelector("#lineInspector").hidden, false);
        h.window.FlowLab.moveFrame(999);
        visited.push(h.window.FlowLab.getState());
        h.window.FlowLab.moveFrame(1);
      }
      assert.equal(h.window.FlowLab.getState().step, data.steps.length - 1);
      assert.equal(h.window.FlowLab.getState().scenario, scenario.id);
      assert.equal(h.window.FlowLab.getState().nodeId, "reentry");
      h.window.FlowLab.moveFrame(999);
      visited.push(h.window.FlowLab.getState());
      for (let step = data.steps.length - 1; step >= 0; step--) {
        assert.deepEqual(h.window.FlowLab.getState(), visited[step]);
        for (let frame = visited[step].frame; frame > 0; frame--) {
          h.document.querySelector("#lineBack").click();
          assert.equal(h.window.FlowLab.getState().frame, frame - 1);
        }
        if (step > 0) h.document.querySelector("#lineBack").click();
      }
      assert.equal(h.window.FlowLab.getState().step, 0);
      assert.equal(h.window.FlowLab.getState().frame, 0);
      assert.equal(h.document.querySelector("#lineBack").disabled, true);
    }
    assert.deepEqual(h.errors, []);
  } finally {
    h.window.close();
  }
});

test("o visualizador aceita outro JSON sem editar o JavaScript e protege texto recebido", async () => {
  const h = await harness();
  try {
    const other = structuredClone(data);
    other.meta.title = "Fila de tarefas";
    other.scenarios = [{ id: "normal", label: "Normal", color: "#00ff38" }];
    other.steps = [
      {
        id: "task",
        title: "<img src=x onerror=alert(1)>",
        summary: "Processar uma tarefa",
        actor: "Worker",
        termIds: [],
      },
    ];
    other.graph.nodes = [
      { id: "worker", step: 0, x: 25, y: 45, title: "Worker", traceId: "task" },
    ];
    other.graph.edges = [];
    other.traces = { task: { label: "Fila", frameIds: ["task"] } };
    other.frames = {
      task: {
        sourceId: "main",
        line: 5,
        label: "Entrar no worker",
        explanation: "Exemplo de outro fluxo",
        kind: "call",
        termIds: [],
      },
    };
    h.window.FlowLab.load(other);
    assert.equal(
      h.document.querySelector("#missionTitle").textContent,
      "Fila de tarefas",
    );
    assert.equal(h.document.querySelector("#stepTitle img"), null);
    assert.equal(h.document.querySelectorAll(".flow-node").length, 1);
    assert.equal(h.window.FlowLab.getState().nodeId, "worker");
    assert.equal(h.document.querySelector("#lineInspector").hidden, false);
    h.window.FlowLab.openNode("worker");
    assert.match(h.document.querySelector("#frameTitle").textContent, /worker/);
    const invalid = structuredClone(other);
    invalid.schemaVersion = "999";
    assert.throws(() => h.window.FlowLab.load(invalid), /schemaVersion/);
    assert.equal(
      h.document.querySelector("#missionTitle").textContent,
      "Fila de tarefas",
    );
  } finally {
    h.window.close();
  }
});
