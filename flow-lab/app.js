"use strict";

// Este arquivo só conhece o contrato JSON: conteúdo técnico e trechos ficam em flow.json.
const E = window.FlowEngine;
const state = {
  data: null,
  step: 0,
  scenario: null,
  nodeId: null,
  frame: 0,
  reference: null,
  branches: {},
  zoom: 1,
  sound: true,
  audio: null,
  stageVisits: {},
  bridge: null,
  editorPreference: "auto",
};
const floatingPanels = new window.FloatingPanels(
  document.getElementById("floatingLayer"),
);
for (const id of ["lessonPanel", "lineInspector", "runtimePanel", "glossary"])
  floatingPanels.register(document.getElementById(id));
const $ = (id) => document.getElementById(id);
const workspaceLayout = new window.WorkspaceLayout($("workspace"));
const controlsDock = new window.MovableDock($("flowControls"));
const studyMode = new window.StudyMode({
  onChange: () => {
    workspaceLayout.release();
    workspaceLayout.refresh();
    floatingPanels.fitAll();
    controlsDock.fit();
    requestAnimationFrame(resizeMap);
  },
});
const el = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
const kinds = {
  execute: "EXECUÇÃO",
  declaration: "DECLARAÇÃO",
  call: "CHAMADA",
  return: "RETORNO",
  register: "REGISTRO",
  async: "ESPERA ASYNC",
  parallel: "RAMO PARALELO",
  condition: "CONDIÇÃO",
  callback: "CALLBACK",
  reactive: "NOTIFICAÇÃO",
  render: "TEMPLATE / VIEW",
  future: "EVENTO FUTURO",
};
const match = (item) =>
  !item.scenarios || item.scenarios.includes(state.scenario);
const node = () =>
  state.data.graph.nodes.find((item) => item.id === state.nodeId);
const frames = () =>
  state.nodeId
    ? E.traceFrames(
        state.data,
        node().traceId,
        state.scenario,
        state.branches[node().traceId] || {},
      )
    : [];
const view = () => E.stepView(state.data, state.step, state.scenario);
function primaryNodeForStep() {
  const candidates = state.data.graph.nodes.filter(
    (item) => item.step === state.step && match(item),
  );
  return (
    candidates.find((item) => item.id === view().primaryNodeId)?.id ||
    candidates[0]?.id ||
    null
  );
}
const sourceLabel = (sourceId, line) =>
  state.data.sources[sourceId].path + ":" + line;
const button = (text, handler, className = "mini-button") => {
  const b = el("button", className, text);
  b.type = "button";
  b.addEventListener("click", handler);
  return b;
};

function loadFlow(data) {
  E.validate(data); // Valida tudo antes de substituir o fluxo que o usuário está estudando.
  state.stageVisits = {};
  state.data = data;
  state.step = 0;
  state.scenario = data.scenarios[0].id;
  state.nodeId = primaryNodeForStep();
  state.frame = 0;
  state.reference = null;
  state.branches = {};
  state.zoom = 1;
  $("loadError").hidden = true;
  $("missionTitle").textContent = data.meta.title;
  $("flowSubtitle").textContent = data.meta.subtitle || data.meta.id;
  $("flowDescription").textContent = data.meta.description;
  document.title = "Flow Lab — " + data.meta.title;
  renderScenarios();
  render();
  renderGlossary();
  controlsDock.fit();
  $("studyModeToggle").disabled = false;
}

function renderScenarios() {
  $("scenarioControls").replaceChildren(
    ...state.data.scenarios.map((scenario) => {
      const b = button(
        scenario.label,
        () => setScenario(scenario.id),
        "scenario-option",
      );
      b.dataset.scenario = scenario.id;
      const dot = el("i", "dot");
      dot.style.backgroundColor = scenario.color || "#91a08d";
      b.prepend(dot);
      b.classList.toggle("is-selected", scenario.id === state.scenario);
      b.setAttribute("aria-pressed", String(scenario.id === state.scenario));
      return b;
    }),
  );
}

function renderLesson() {
  const step = view();
  for (const [id, value] of Object.entries({
    stepNumber: String(state.step + 1).padStart(2, "0"),
    stepKind: step.kindLabel || step.kind,
    stepTiming: step.timing || "",
    stepKicker: step.kicker || "",
    stepTitle: step.title,
    stepSummary: step.summary,
    stepActor: step.actor || "",
    stepEffect: step.effect || "",
    stepInsight: step.insight || "",
    stepNext: step.next || "",
  }))
    $(id).textContent = value;
  $("stepKind").dataset.kind = step.kind;
  $("stepTerms").replaceChildren(
    ...(step.termIds || []).map((id) => termCard(id, false)),
  );
  $("asyncBadge").hidden = step.kind !== "async";
}

function renderProgress() {
  const total = state.data.steps.length,
    current = state.step + 1;
  const percent = Math.round((current / total) * 100);
  $("progressLabel").textContent =
    "ETAPA " + String(current).padStart(2, "0") + " / " + total;
  $("progressPercent").textContent = percent + "%";
  $("progressFill").style.width = percent + "%";
  $("progressTrack").setAttribute("aria-valuenow", String(percent));
  $("progressTrack").setAttribute(
    "aria-valuetext",
    "Etapa " + current + " de " + total,
  );
}

function svg(tag, attributes) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attributes || {}))
    s.setAttribute(key, String(value));
  return s;
}

function edgePath(edge) {
  const from = state.data.graph.nodes.find((n) => n.id === edge.from);
  const to = state.data.graph.nodes.find((n) => n.id === edge.to);
  const a = { x: from.x + 80, y: from.y + 34 },
    b = { x: to.x + 80, y: to.y + 34 };
  if (edge.loop)
    return (
      "M " +
      a.x +
      " " +
      a.y +
      " C " +
      (a.x + 120) +
      " " +
      (a.y + 90) +
      ", " +
      (b.x - 115) +
      " " +
      (b.y + 115) +
      ", " +
      b.x +
      " " +
      b.y
    );
  if (b.x < a.x && b.y !== a.y)
    return (
      "M " +
      a.x +
      " " +
      a.y +
      " C " +
      a.x +
      " " +
      (a.y + 65) +
      ", " +
      b.x +
      " " +
      (b.y - 65) +
      ", " +
      b.x +
      " " +
      b.y
    );
  const mid = (a.x + b.x) / 2;
  return (
    "M " +
    a.x +
    " " +
    a.y +
    " C " +
    mid +
    " " +
    a.y +
    ", " +
    mid +
    " " +
    b.y +
    ", " +
    b.x +
    " " +
    b.y
  );
}

function renderGraph() {
  const graph = state.data.graph;
  const layer = $("edgeLayer");
  layer.setAttribute("viewBox", "0 0 " + graph.width + " " + graph.height);
  layer.replaceChildren();
  const defs = svg("defs");
  for (const [id, color] of [
    ["base", "#344333"],
    ["green", "#00ff38"],
    ["purple", "#b000ff"],
    ["red", "#ff5268"],
  ]) {
    const marker = svg("marker", {
      id: "arrow-" + id,
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 5,
      markerHeight: 5,
      orient: "auto",
    });
    marker.append(svg("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color }));
    defs.append(marker);
  }
  layer.append(defs);
  const active = view().activeNodes || [];
  graph.edges.forEach((edge) => {
    const relevant = match(edge),
      isActive = relevant && edge.step === state.step;
    const path = svg("path", {
      d: edgePath(edge),
      class: "flow-edge",
      "data-type": edge.type || "sync",
    });
    path.classList.toggle("is-active", isActive);
    path.classList.toggle("is-complete", relevant && edge.step < state.step);
    path.classList.toggle("is-muted", !relevant);
    let color = relevant && edge.step <= state.step ? "green" : "base";
    if (color !== "base" && edge.type === "parallel") color = "purple";
    if (color !== "base" && edge.type === "error") color = "red";
    path.setAttribute("marker-end", "url(#arrow-" + color + ")");
    layer.append(path);
  });
  $("nodeLayer").replaceChildren(
    ...graph.nodes.map((item) => {
      const b = button("", () => openNode(item.id), "flow-node");
      b.dataset.nodeId = item.id;
      b.dataset.type = item.type || "sync";
      b.style.left = item.x + "px";
      b.style.top = item.y + "px";
      b.setAttribute(
        "aria-label",
        item.title + ": abrir percurso de linhas da etapa " + (item.step + 1),
      );
      b.setAttribute("aria-pressed", String(item.id === state.nodeId));
      b.classList.toggle("is-active", match(item) && active.includes(item.id));
      b.classList.toggle("is-complete", match(item) && item.step < state.step);
      b.classList.toggle("is-muted", !match(item));
      b.classList.toggle("is-inspected", item.id === state.nodeId);
      const copy = el("span", "flow-node-copy");
      copy.append(
        el("strong", "", item.title),
        el("small", "", item.subtitle || ""),
      );
      b.append(
        el("span", "node-index", "S" + String(item.step + 1).padStart(2, "0")),
        copy,
      );
      return b;
    }),
  );
  resizeMap();
}

function resizeMap() {
  if (!state.data) return;
  const graph = state.data.graph,
    available = $("mapViewport").clientWidth || graph.width;
  const fit = Math.min(1.15, Math.max(0.6, available / graph.width));
  const scale = fit * state.zoom;
  $("flowMap").style.width = graph.width + "px";
  $("flowMap").style.height = graph.height + "px";
  $("flowMap").style.transform = "scale(" + scale + ")";
  $("mapSizer").style.width = graph.width * scale + "px";
  $("mapSizer").style.height = graph.height * scale + "px";
  $("mapStatus").textContent =
    "Clique no mapa · " +
    Math.round(scale * 100) +
    "% · nós alternativos mudam o cenário";
}

function renderConsole() {
  $("consoleList").replaceChildren(
    ...state.data.steps
      .slice(0, state.step + 1)
      .map((_, index) =>
        el(
          "li",
          "",
          E.stepView(state.data, index, state.scenario).log ||
            E.stepView(state.data, index, state.scenario).title,
        ),
      ),
  );
  $("consoleList").scrollTop = $("consoleList").scrollHeight;
}

function render() {
  if (!state.data) return;
  renderLesson();
  renderProgress();
  renderGraph();
  renderConsole();
  $("lineInspector").hidden = !state.nodeId;
  $("flowControls").hidden = !state.nodeId;
  if (state.nodeId) renderInspector();
  requestAnimationFrame(resizeMap);
}

function announce(text) {
  $("announcer").textContent = text;
}
function animate() {
  if (floatingPanels.isDetached("lessonPanel")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  $("lessonPanel").classList.remove("is-changing");
  void $("lessonPanel").offsetWidth;
  $("lessonPanel").classList.add("is-changing");
}
function rememberStage() {
  if (!state.data || !state.nodeId) return;
  state.stageVisits[state.scenario + ":" + state.step] = {
    nodeId: state.nodeId,
    branches: { ...(state.branches[node().traceId] || {}) },
  };
}
function selectStep(index, options = {}) {
  rememberStage();
  const data = state.data;
  state.step = Math.max(0, Math.min(data.steps.length - 1, index));
  state.frame = 0;
  state.reference = null;
  state.nodeId = primaryNodeForStep();
  const visited =
    options.visited && state.stageVisits[state.scenario + ":" + state.step];
  const previousNode =
    visited &&
    data.graph.nodes.find(
      (item) =>
        item.id === visited.nodeId && item.step === state.step && match(item),
    );
  if (previousNode) {
    state.nodeId = previousNode.id;
    state.branches[previousNode.traceId] = { ...visited.branches };
  }
  if (options.edge === "last" && state.nodeId)
    state.frame = frames().length - 1;
  render();
  animate();
  announce("Etapa " + (state.step + 1) + ": " + view().title);
}
function setScenario(id) {
  if (!state.data.scenarios.some((s) => s.id === id)) return;
  rememberStage();
  state.scenario = id;
  state.reference = null;
  if (state.nodeId && !match(node())) {
    state.nodeId = primaryNodeForStep();
    state.frame = 0;
  }
  if (state.nodeId) state.frame = Math.min(state.frame, frames().length - 1);
  renderScenarios();
  render();
  sound("select");
  announce("Cenário: " + state.data.scenarios.find((s) => s.id === id).label);
}
function openNode(id) {
  const item = state.data.graph.nodes.find((n) => n.id === id);
  if (!item) return;
  rememberStage();
  if (!match(item)) state.scenario = item.scenarios[0];
  state.step = item.step;
  state.nodeId = id;
  state.frame = 0;
  state.reference = null;
  rememberStage();
  renderScenarios();
  render();
  sound("select");
  animate();
  $("inspectorTitle").focus({ preventScroll: true });
  if (window.innerWidth < 1000 && !floatingPanels.isDetached("lineInspector"))
    $("lineInspector").scrollIntoView?.({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  announce("Painel de linhas aberto: " + state.data.traces[item.traceId].label);
}
function moveFrame(offset) {
  if (!state.nodeId) return;
  const all = frames();
  if (offset > 0 && state.frame === all.length - 1) {
    if (state.step < state.data.steps.length - 1) {
      selectStep(state.step + 1, { visited: true });
      sound("advance");
    }
    return;
  }
  if (offset < 0 && state.frame === 0) {
    if (state.step > 0) {
      selectStep(state.step - 1, { visited: true, edge: "last" });
      sound("back");
    }
    return;
  }
  state.frame = Math.max(0, Math.min(all.length - 1, state.frame + offset));
  state.reference = null;
  renderInspector();
  sound(offset > 0 ? "advance" : "back");
  announce("Quadro " + (state.frame + 1) + ": " + all[state.frame].label);
  if (
    offset > 0 &&
    state.step === state.data.steps.length - 1 &&
    state.frame === all.length - 1
  ) {
    sound("complete");
    celebrate();
  }
}
function showReference(sourceId, line) {
  state.reference = { sourceId, line };
  renderInspector();
}
function referenceButton(sourceId, line) {
  return button(
    "↗ " + sourceLabel(sourceId, line),
    () => {
      if (!state.nodeId) {
        const related = state.data.graph.nodes.find(
          (n) =>
            match(n) &&
            E.traceFrames(state.data, n.traceId, state.scenario).some(
              (f) => f.sourceId === sourceId,
            ),
        );
        if (related) openNode(related.id);
        else return;
      }
      showReference(sourceId, line);
    },
    "source-link",
  );
}

function renderInspector() {
  const all = frames();
  if (!all.length) return;
  state.frame = Math.max(0, Math.min(state.frame, all.length - 1));
  const frame = all[state.frame],
    location = state.reference || frame;
  $("traceName").textContent = state.data.traces[node().traceId].label;
  $("lineCounter").textContent =
    "PASSO " + (state.frame + 1) + " DE " + all.length;
  $("frameKind").textContent = state.reference
    ? "REFERÊNCIA"
    : kinds[frame.kind];
  $("frameKind").dataset.kind = state.reference ? "reference" : frame.kind;
  $("flowControls").hidden = false;
  $("lineBack").disabled = state.step === 0 && state.frame === 0;
  const last = state.frame === all.length - 1;
  const finished = state.step === state.data.steps.length - 1;
  $("lineNext").disabled = last && finished;
  $("lineNext").title =
    last && finished
      ? "Fluxo concluído"
      : "Avançar uma linha; no fim da etapa, continuar na próxima";
  $("returnToTrace").hidden = !state.reference;
  $("traceRail").replaceChildren(
    ...all.map((f, i) => {
      const b = el(
        "span",
        "trace-dot " +
          (i < state.frame
            ? "is-complete"
            : i === state.frame
              ? "is-current"
              : ""),
      );
      b.title = i + 1 + ". " + f.label;
      b.dataset.kind = f.kind;
      b.setAttribute("aria-label", b.title);
      b.setAttribute("role", "listitem");
      if (i === state.frame) b.setAttribute("aria-current", "step");
      return b;
    }),
  );
  const sourceIds = [...new Set(all.map((f) => f.sourceId))];
  if (!sourceIds.includes(location.sourceId)) sourceIds.push(location.sourceId);
  $("sourceTabs").replaceChildren(
    ...sourceIds.map((id) => {
      const path = state.data.sources[id].path;
      const b = button(
        path.split("/").pop(),
        () => {
          if (id === frame.sourceId) {
            state.reference = null;
            renderInspector();
          } else
            showReference(id, E.sourceLines(state.data.sources[id])[0].number);
        },
        "source-tab " + (id === location.sourceId ? "is-selected" : ""),
      );
      b.title = path;
      b.setAttribute("aria-pressed", String(id === location.sourceId));
      return b;
    }),
  );
  const source = state.data.sources[location.sourceId];
  $("sourcePath").textContent = source.path + ":" + location.line;
  $("sourceOrigin").textContent =
    source.origin === "dependency"
      ? (source.package || "Biblioteca") + " " + (source.version || "")
      : "CÓDIGO DO PROJETO";
  $("sourceOrigin").dataset.origin = source.origin;
  if (state.reference)
    $("sourceOrigin").textContent =
      "REFERÊNCIA CONSULTADA · " + $("sourceOrigin").textContent;
  renderSource(location, all);
  $("frameTitle").textContent = state.reference
    ? "Consulta de referência"
    : frame.label;
  $("frameText").textContent = state.reference
    ? "Você está consultando " +
      sourceLabel(location.sourceId, location.line) +
      ". O percurso continua no passo " +
      (state.frame + 1) +
      ": " +
      frame.label +
      ". Use Voltar à linha atual para retomar essa visualização; a consulta não executa nem pula passos."
    : frame.explanation;
  $("frameTerms").replaceChildren(
    ...(frame.termIds || []).map((id) => termCard(id, true)),
  );
  $("symbolTitle").hidden = !frame.termIds?.length;
  renderTarget(frame);
  renderBranches(frame);
  renderVariables(frame);
  $("stackList").replaceChildren(
    ...(
      frame.stack || [view().actor || "Runtime", node().title, frame.label]
    ).map((name) => el("li", "", name)),
  );
  $("sourceNote").replaceChildren();
  if (state.reference) {
    $("sourceNote").append(
      el(
        "span",
        "",
        "Referência consultada; o quadro atual continua em " +
          sourceLabel(frame.sourceId, frame.line) +
          ". ",
      ),
      button(
        "Voltar ao quadro",
        () => {
          state.reference = null;
          renderInspector();
        },
        "source-link",
      ),
    );
  } else if (source.runtimeSourceId) {
    $("sourceNote").append(
      el(
        "span",
        "",
        "Fonte TypeScript de estudo. A versão JavaScript distribuída está em ",
      ),
      referenceButton(source.runtimeSourceId, 20),
      el("span", "", ". O bundle pode reorganizar estas linhas."),
    );
  } else if (source.origin === "dependency") {
    $("sourceNote").textContent =
      "Trecho da versão instalada. O bundler inclui/reorganiza o código; não é um arquivo carregado diretamente do node_modules pelo browser.";
  } else {
    $("sourceNote").textContent =
      frame.kind === "declaration"
        ? "Este quadro contextualiza uma declaração. Não a confunda com uma nova instrução executada neste instante."
        : "Linhas verificadas no fonte local. A posição é didática, sem conexão a um debugger real.";
  }
}

function renderSource(location, all) {
  const source = state.data.sources[location.sourceId],
    fragment = document.createDocumentFragment();
  let previous = 0;
  for (const row of E.sourceLines(source)) {
    if (previous && row.number !== previous + 1)
      fragment.append(el("div", "source-gap", "··· trecho omitido ···"));
    const index = all.findIndex(
      (frame) =>
        frame.sourceId === location.sourceId && frame.line === row.number,
    );
    const line = el("div", "code-line");
    if (index >= 0)
      line.setAttribute(
        "aria-label",
        "Quadro da linha " + row.number + ": " + all[index].label,
      );
    line.classList.toggle("is-current", row.number === location.line);
    line.append(
      el("span", "line-pointer", row.number === location.line ? "▶" : ""),
      el("span", "line-number", String(row.number)),
      el("code", "", row.text || " "),
    );
    fragment.append(line);
    previous = row.number;
  }
  $("sourceCode").replaceChildren(fragment);
  const current = $("sourceCode").querySelector(".is-current");
  if (current) $("sourceCode").scrollTop = Math.max(0, current.offsetTop - 80);
}
function renderTarget(frame) {
  const panel = $("callTarget");
  panel.replaceChildren();
  panel.hidden = !frame.target;
  if (frame.target)
    panel.append(
      el(
        "strong",
        "",
        frame.kind === "declaration"
          ? "IMPLEMENTAÇÃO / REFERÊNCIA"
          : "DESTINO OU CONEXÃO",
      ),
      referenceButton(frame.target.sourceId, frame.target.line),
    );
}
function renderBranches(frame) {
  const panel = $("branchPanel");
  panel.replaceChildren();
  panel.hidden = !frame.choices?.length;
  if (!frame.choices?.length) return;
  panel.append(
    el(
      "h3",
      "",
      frame.kind === "parallel"
        ? "↳ RAMOS INDEPENDENTES"
        : "⑂ CAMINHOS POSSÍVEIS",
    ),
  );
  for (const choice of frame.choices) {
    const canSelect =
      choice.scenario || choice.frameId || choice.nodeId || choice.branch;
    const content = canSelect
      ? button(
          "",
          () => {
            if (choice.scenario) setScenario(choice.scenario);
            if (choice.nodeId) openNode(choice.nodeId);
            if (choice.branch) {
              const id = node().traceId;
              state.branches[id] = {
                ...(state.branches[id] || {}),
                [choice.branch]: choice.value,
              };
              state.frame = 0;
              renderInspector();
            }
            if (choice.frameId) {
              // A escolha define o ramo; o próximo quadro só aparece ao avançar.
              if (!choice.branch) {
                const reference = state.data.frames[choice.frameId];
                showReference(reference.sourceId, reference.line);
              }
              rememberStage();
            }
          },
          "branch-choice",
        )
      : el("div", "branch-choice");
    const chosenBranch =
      choice.branch &&
      (state.branches[node().traceId]?.[choice.branch] ||
        state.data.traces[node().traceId].branches?.[choice.branch]) ===
        choice.value;
    content.classList.toggle(
      "is-chosen",
      (!!choice.scenario && state.scenario === choice.scenario) ||
        !!chosenBranch,
    );
    content.append(
      el("strong", "", choice.label),
      el("small", "", choice.description || ""),
    );
    if (choice.scenario)
      content.setAttribute(
        "aria-pressed",
        String(state.scenario === choice.scenario),
      );
    panel.append(content);
  }
}
function renderVariables(frame) {
  const panel = $("variablesPanel");
  panel.replaceChildren();
  panel.hidden = !frame.variables?.length;
  if (!frame.variables?.length) return;
  panel.append(el("h3", "", "ESTADO / ARGUMENTOS"));
  for (const variable of frame.variables) {
    const item = el("div", "variable");
    item.append(
      el("code", "", variable.name),
      el("span", "", variable.values?.[state.scenario] || variable.value || ""),
    );
    panel.append(item);
  }
}
function termCard(id, open) {
  const term = state.data.terms[id],
    details = el("details", "term-card");
  details.open = open;
  const summary = el("summary");
  summary.append(
    el("strong", "", term.label),
    el("span", "", term.category || ""),
  );
  details.append(summary, el("p", "", term.definition));
  if (term.usage) details.append(el("p", "term-usage", term.usage));
  if (term.sourceId) details.append(referenceButton(term.sourceId, term.line));
  return details;
}
function renderGlossary() {
  if (!state.data) return;
  const query = $("termSearch").value.trim().toLocaleLowerCase("pt-BR");
  const ids = Object.keys(state.data.terms).filter((id) => {
    const term = state.data.terms[id];
    return (
      !query ||
      [term.label, term.category, term.definition, term.usage]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query)
    );
  });
  $("termList").replaceChildren(...ids.map((id) => termCard(id, false)));
  if (!ids.length)
    $("termList").append(el("p", "empty-search", "Nenhum termo encontrado."));
}
function sound(name) {
  if (!state.sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!state.audio) state.audio = new Audio();
    if (state.audio.state === "suspended") state.audio.resume().catch(() => {});
    const notes = {
      advance: [460, 690],
      back: [320, 240],
      select: [540, 760],
      complete: [440, 660, 880],
    }[name] || [500];
    notes.forEach((frequency, index) => {
      const oscillator = state.audio.createOscillator(),
        gain = state.audio.createGain();
      const start = state.audio.currentTime + index * 0.055;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.04, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.095);
      oscillator.connect(gain);
      gain.connect(state.audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.1);
    });
  } catch {
    /* Áudio opcional: uma política do browser nunca impede navegação. */
  }
}
function toggleSound() {
  state.sound = !state.sound;
  $("soundLabel").textContent = state.sound ? "SOM ON" : "SOM OFF";
  $("soundToggle").setAttribute("aria-pressed", String(state.sound));
  $("soundToggle").setAttribute(
    "aria-label",
    state.sound ? "Desativar sons de interação" : "Ativar sons de interação",
  );
  if (state.sound) sound("select");
}
function celebrate() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  $("completionBurst").replaceChildren(
    ...Array.from({ length: 20 }, (_, index) => {
      const particle = el("span", "completion-particle");
      particle.style.left = index * 5 + 1 + "%";
      particle.style.setProperty("--drift", Math.random() * 140 - 70 + "px");
      return particle;
    }),
  );
  setTimeout(() => $("completionBurst").replaceChildren(), 1500);
}
function showError(error) {
  $("loadError").hidden = false;
  $("loadError").textContent = error.message;
}
async function start() {
  try {
    const url =
      new URL(window.location.href).searchParams.get("flow") || "flow.json";
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        "Não foi possível carregar " + url + " (HTTP " + response.status + ").",
      );
    loadFlow(await response.json());
  } catch (error) {
    showError(
      new Error(
        error.message +
          " Você também pode usar Abrir JSON e selecionar flow.json. Em file:// o navegador pode impedir fetch; sirva a pasta por HTTP local.",
      ),
    );
    $("missionTitle").textContent = "Escolha o JSON do fluxo";
  }
}
$("restartButton").addEventListener("click", () => {
  if (state.data) {
    selectStep(0);
    sound("select");
  }
});
$("soundToggle").addEventListener("click", toggleSound);
$("returnToTrace").addEventListener("click", () => {
  state.reference = null;
  renderInspector();
});
$("lineBack").addEventListener("click", () => moveFrame(-1));
$("lineNext").addEventListener("click", () => moveFrame(1));
$("termSearch").addEventListener("input", renderGlossary);
$("zoomIn").addEventListener("click", () => {
  state.zoom = Math.min(2, state.zoom + 0.2);
  resizeMap();
  sound("select");
});
$("zoomOut").addEventListener("click", () => {
  state.zoom = Math.max(0.7, state.zoom - 0.2);
  resizeMap();
  sound("select");
});
$("zoomFit").addEventListener("click", () => {
  state.zoom = 1;
  resizeMap();
});
$("flowImport").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    loadFlow(JSON.parse(await file.text()));
    $("settingsMenu").open = false;
    sound("select");
  } catch (error) {
    showError(error);
  }
  event.target.value = "";
});
async function loadEditorBridge() {
  const response = await fetch("/api/editor", { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "Para abrir na IDE, pare o servidor simples e execute python3 serve.py.",
    );
  const bridge = await response.json();
  if (!bridge.token || !Array.isArray(bridge.available))
    throw new Error("Execute o laboratório com python3 serve.py.");
  let preference = state.bridge
    ? state.editorPreference
    : bridge.defaultId || "auto";
  state.bridge = bridge;
  try {
    preference = localStorage.getItem("flow-lab.editor") || preference;
  } catch {
    /* Preferência opcional. */
  }
  const choices = [
    { id: "auto", label: "Automático · padrão do sistema" },
    ...bridge.available,
  ];
  if (!choices.some((choice) => choice.id === preference)) preference = "auto";
  $("editorSelect").replaceChildren(
    ...choices.map((choice) => {
      const option = el("option", "", choice.label);
      option.value = choice.id;
      return option;
    }),
  );
  state.editorPreference = preference;
  $("editorSelect").value = preference;
  $("editorStatus").textContent =
    preference === "auto"
      ? "Padrão detectado: " + bridge.editor
      : "Preferência local: " +
        choices.find((choice) => choice.id === preference).label;
  return bridge;
}
async function openSourceInEditor() {
  if (!state.nodeId) return;
  const location = state.reference || frames()[state.frame];
  const path = state.data.sources[location.sourceId].path;
  $("openSource").disabled = true;
  $("sourceOpenStatus").textContent = "Abrindo arquivo e linha…";
  try {
    const bridge = await loadEditorBridge();
    const response = await fetch("/api/open-source", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Flow-Lab-Token": bridge.token,
      },
      body: JSON.stringify({
        path,
        line: location.line,
        editor: state.editorPreference,
      }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Não foi possível abrir o editor.");
    $("editorStatus").textContent =
      result.editor +
      " · " +
      (result.lineSupported ? path + ":" + location.line : result.message);
    $("sourceOpenStatus").textContent = $("editorStatus").textContent;
    sound("select");
  } catch (error) {
    $("editorStatus").textContent = error.message;
    $("sourceOpenStatus").textContent = error.message;
  } finally {
    $("openSource").disabled = false;
  }
}
$("openSource").addEventListener("click", openSourceInEditor);
$("editorSelect").addEventListener("change", (event) => {
  state.editorPreference = event.target.value;
  try {
    localStorage.setItem("flow-lab.editor", state.editorPreference);
  } catch {
    /* Sem persistência: continua na sessão. */
  }
  $("editorStatus").textContent = "Preferência desta máquina salva.";
});
document.addEventListener("pointerdown", (event) => {
  if ($("settingsMenu").open && !$("settingsMenu").contains(event.target))
    $("settingsMenu").open = false;
});
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (event.key === "Escape") {
    if (studyMode.active) {
      event.preventDefault();
      studyMode.exit();
    } else if ($("settingsMenu").open) {
      event.preventDefault();
      $("settingsMenu").open = false;
      $("settingsMenu").querySelector("summary").focus();
    } else {
      const floating = event.target.closest?.(".is-detached");
      if (floating) {
        event.preventDefault();
        floatingPanels.dock(floating.id);
      }
    }
    return;
  }
  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) ||
    event.target.isContentEditable ||
    $("settingsMenu").contains(event.target)
  )
    return;
  if (event.key.toLowerCase() === "m") {
    event.preventDefault();
    toggleSound();
  }
  if (!state.data) return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveFrame(1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveFrame(-1);
  }
});
if (window.ResizeObserver)
  new ResizeObserver(resizeMap).observe($("mapViewport"));
else window.addEventListener("resize", resizeMap);
window.FlowLab = Object.freeze({
  load: loadFlow,
  openNode,
  setScenario,
  selectStep,
  moveFrame,
  floatingPanels,
  workspaceLayout,
  controlsDock,
  studyMode,
  openSourceInEditor,
  getState: () => ({
    step: state.step,
    scenario: state.scenario,
    nodeId: state.nodeId,
    frame: state.frame,
  }),
});
start();
loadEditorBridge().catch(() => {
  $("editorStatus").textContent =
    "Abertura na IDE disponível com python3 serve.py.";
});
