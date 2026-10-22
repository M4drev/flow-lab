"use strict";

const test = require("node:test"),
  assert = require("node:assert/strict");
const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const { spawnSync } = require("node:child_process");
const { validateFlow } = require("./validate-flow.cjs");
const example = path.resolve(__dirname, "../assets/flow-lab-contract/example");
const exampleData = JSON.parse(
  fs.readFileSync(path.join(example, "flow.json"), "utf8"),
);

function fixture(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "flow-contract-test-"));
  try {
    fs.mkdirSync(path.join(root, "src"));
    fs.copyFileSync(
      path.join(example, "src/dobro.mjs"),
      path.join(root, "src/dobro.mjs"),
    );
    const file = path.join(root, "flow.json");
    const save = (data) => fs.writeFileSync(file, JSON.stringify(data));
    save(exampleData);
    callback({ root, file, save });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("exemplo completo valida estrutura, referências e snapshots sem npm externo", () => {
  const result = validateFlow(path.join(example, "flow.json"), {
    repoRoot: example,
  });
  assert.equal(result.sourceVerified, true);
  assert.equal(result.sourceRows, 6);
  assert.equal(result.steps, 2);
  assert.equal(
    spawnSync(process.execPath, [path.join(example, "src/dobro.mjs"), "2"], {
      encoding: "utf8",
    }).stdout.trim(),
    "4",
  );
});

test("schema rejeita chaves inventadas e valores com tipo incorreto", () =>
  fixture(({ file, root, save }) => {
    const wrong = structuredClone(exampleData);
    wrong.analogia = "campo não suportado";
    save(wrong);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /Estrutura incompatível/,
    );
    const badValue = structuredClone(exampleData);
    badValue.frames.entrada.variables[0].value = 2;
    save(badValue);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /Estrutura incompatível/,
    );
  }));

test("referências quebradas, linha fora do snapshot e nó cortado falham", () =>
  fixture(({ file, root, save }) => {
    const broken = structuredClone(exampleData);
    broken.frames.chamada.target.line = 999;
    save(broken);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /destino inexistente/,
    );
    const cut = structuredClone(exampleData);
    cut.graph.width = 260;
    save(cut);
    assert.throws(() => validateFlow(file, { repoRoot: root }), /Nó cortado/);
  }));

test("snapshot divergente falha sem expor o texto do arquivo", () =>
  fixture(({ file, root }) => {
    fs.appendFileSync(path.join(root, "src/dobro.mjs"), "\n");
    fs.writeFileSync(
      path.join(root, "src/dobro.mjs"),
      "segredo-que-nao-deve-aparecer\n",
    );
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      (error) =>
        /Snapshot divergente/.test(error.message) &&
        !error.message.includes("segredo-que"),
    );
  }));

test("modo estrutural é declarado como incompleto e não lê fontes", () =>
  fixture(({ file, root }) => {
    fs.unlinkSync(path.join(root, "src/dobro.mjs"));
    const result = validateFlow(file, { repoRoot: root, structureOnly: true });
    assert.equal(result.sourceVerified, false);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /Arquivo não encontrado/,
    );
  }));

test("fontes fora da raiz e snapshots de credenciais são recusados", () =>
  fixture(({ file, root, save }) => {
    const outside = structuredClone(exampleData);
    outside.sources.dobro.path = "../outside.mjs";
    save(outside);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /fora do repositório/,
    );
    const secret = structuredClone(exampleData);
    secret.sources.dobro.path = ".env";
    save(secret);
    assert.throws(() => validateFlow(file, { repoRoot: root }), /credenciais/);
  }));

test("ramificação exige valor padrão e cada opção precisa de percurso não vazio", () =>
  fixture(({ file, root, save }) => {
    const branch = structuredClone(exampleData);
    branch.frames.entrada.when = { modo: "a" };
    save(branch);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /Ramo sem valor inicial/,
    );
    const empty = structuredClone(exampleData);
    empty.traces.calculo.frameIds = ["entrada"];
    empty.traces.calculo.branches = { modo: "a" };
    empty.frames.entrada.when = { modo: "a" };
    empty.frames.entrada.choices = [
      {
        label: "Alternativa",
        description: "Ramo sem quadro",
        branch: "modo",
        value: "b",
      },
    ];
    save(empty);
    assert.throws(
      () => validateFlow(file, { repoRoot: root }),
      /Ramo produz trilha vazia/,
    );
  }));

test("CLI sinaliza erro com exit code e resultado válido com fontes verificadas", () =>
  fixture(({ file, root, save }) => {
    const cli = path.join(__dirname, "validate-flow.cjs");
    let run = spawnSync(process.execPath, [cli, file, "--repo-root", root], {
      encoding: "utf8",
    });
    assert.equal(run.status, 0);
    assert.equal(JSON.parse(run.stdout).sourceVerified, true);
    const bad = structuredClone(exampleData);
    bad.schemaVersion = "999";
    save(bad);
    run = spawnSync(process.execPath, [cli, file, "--repo-root", root], {
      encoding: "utf8",
    });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Estrutura incompatível/);
  }));
