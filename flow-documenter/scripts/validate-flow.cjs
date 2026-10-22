"use strict";

// Validação local e somente leitura: nunca executa código recebido no JSON.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const schemaValidator = require("./schema-validator.cjs");
const engine = require("../assets/flow-lab-contract/flow-engine.cjs");
const contractFolder = path.resolve(__dirname, "../assets/flow-lab-contract");

function inside(root, target) {
  const relative = path.relative(root, target);
  return (
    relative !== ".." &&
    !relative.startsWith(".." + path.sep) &&
    !path.isAbsolute(relative)
  );
}

function sourceFile(root, relativePath) {
  if (
    !relativePath ||
    path.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath) ||
    /^[a-z][a-z\d+.-]*:/i.test(relativePath)
  )
    throw new Error("Use paths relativos ao repositório: " + relativePath);
  const parts = relativePath.replaceAll("\\", "/").split("/");
  if (
    parts.some(
      (part) => [".git", ".aws"].includes(part) || /^\.env(?:\.|$)/i.test(part),
    ) ||
    /\.(pem|key)$/i.test(relativePath)
  )
    throw new Error(
      "Não inclua arquivos de credenciais/ambiente como snapshots: " +
        relativePath,
    );
  const target = path.resolve(root, relativePath);
  if (!inside(root, target))
    throw new Error("Path fora do repositório: " + relativePath);
  if (!fs.existsSync(target))
    throw new Error("Arquivo não encontrado: " + relativePath);
  const real = fs.realpathSync(target);
  if (!inside(root, real))
    throw new Error(
      "Link de fonte aponta para fora do repositório: " + relativePath,
    );
  if (!fs.statSync(real).isFile())
    throw new Error("Path não é um arquivo: " + relativePath);
  return real;
}

function verifyBranches(data) {
  let pathsChecked = 0;
  const scenarios = new Set(data.scenarios.map((scenario) => scenario.id));
  for (const [id, frame] of Object.entries(data.frames)) {
    if (
      frame.choices?.some(
        (choice) =>
          choice.scenario &&
          choice.nodeId &&
          data.graph.nodes
            .find((node) => node.id === choice.nodeId)
            ?.scenarios?.includes(choice.scenario) === false,
      )
    )
      throw new Error("Escolha associa nó e cenário incompatíveis: " + id);
    for (const variable of frame.variables || []) {
      for (const scenario of Object.keys(variable.values || {}))
        if (!scenarios.has(scenario))
          throw new Error(
            "Valor referencia cenário inexistente: " + id + "/" + scenario,
          );
      for (const scenario of frame.scenarios || scenarios)
        if (
          variable.value === undefined &&
          variable.values?.[scenario] === undefined
        )
          throw new Error(
            "Variável sem valor no cenário: " +
              id +
              "/" +
              scenario +
              "/" +
              variable.name,
          );
    }
  }
  for (const [traceId, trace] of Object.entries(data.traces)) {
    const defaults = trace.branches || {},
      values = new Map();
    const add = (key, value) => {
      if (defaults[key] === undefined)
        throw new Error(
          "Ramo sem valor inicial em traces.branches: " + traceId + "/" + key,
        );
      if (!values.has(key)) values.set(key, new Set([defaults[key]]));
      values.get(key).add(value);
    };
    for (const frameId of trace.frameIds) {
      const frame = data.frames[frameId];
      for (const [key, value] of Object.entries(frame.when || {}))
        add(key, value);
      for (const choice of frame.choices || [])
        if (choice.branch) add(choice.branch, choice.value);
    }
    for (const node of data.graph.nodes.filter(
      (item) => item.traceId === traceId,
    )) {
      for (const scenario of node.scenarios || scenarios) {
        const selections = [{ ...defaults }];
        for (const [key, alternatives] of values)
          for (const value of alternatives)
            selections.push({ ...defaults, [key]: value });
        for (const selection of selections) {
          if (!engine.traceFrames(data, traceId, scenario, selection).length)
            throw new Error(
              "Ramo produz trilha vazia: " + traceId + "/" + scenario,
            );
          pathsChecked += 1;
        }
      }
    }
  }
  return pathsChecked;
}

function validateFlow(jsonPath, options = {}) {
  const rawSchema = fs.readFileSync(
    path.join(contractFolder, "flow.schema.json"),
  );
  if (
    crypto.createHash("sha256").update(rawSchema).digest("hex") !==
    schemaValidator.schemaHash
  )
    throw new Error(
      "Schema e validador compilado estão divergentes; atualize os dois antes de validar.",
    );
  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new Error("JSON malformado; corrija a sintaxe antes da validação.");
    throw error;
  }
  if (!schemaValidator(data)) {
    const diagnostics = schemaValidator.errors
      .slice(0, 8)
      .map((error) => (error.instancePath || "/") + ": " + error.message);
    throw new Error(
      "Estrutura incompatível com Flow Lab 1.0:\n" + diagnostics.join("\n"),
    );
  }
  engine.validate(data);
  for (const step of data.steps) {
    for (const variant of Object.values(step.variants || {}))
      for (const id of variant.activeNodes || [])
        if (!data.graph.nodes.some((node) => node.id === id))
          throw new Error(
            "Nó ativo inexistente em variante: " + step.id + "/" + id,
          );
  }
  for (const node of data.graph.nodes)
    if (node.x + 160 > data.graph.width || node.y + 68 > data.graph.height)
      throw new Error(
        "Nó cortado pelos limites do grafo: " +
          node.id +
          ". Aumente width/height.",
      );
  const branchPaths = verifyBranches(data);
  let sourceRows = 0;
  if (!options.structureOnly) {
    const root = fs.realpathSync(
      path.resolve(options.repoRoot || process.cwd()),
    );
    for (const [id, source] of Object.entries(data.sources)) {
      const actual = fs
        .readFileSync(sourceFile(root, source.path), "utf8")
        .split(/\r?\n/);
      for (const row of engine.sourceLines(source)) {
        if (actual[row.number - 1] !== row.text)
          throw new Error(
            "Snapshot divergente: " +
              source.path +
              ":" +
              row.number +
              " (sourceId=" +
              id +
              "). Atualize trecho/linha; conteúdo não será impresso.",
          );
        sourceRows += 1;
      }
    }
    if (data.meta.sourceDocument) sourceFile(root, data.meta.sourceDocument);
  }
  return {
    schemaVersion: data.schemaVersion,
    steps: data.steps.length,
    nodes: data.graph.nodes.length,
    frames: Object.keys(data.frames).length,
    sources: Object.keys(data.sources).length,
    sourceRows,
    branchPaths,
    sourceVerified: !options.structureOnly,
  };
}

function main(args) {
  if (args.includes("--help") || !args.length) {
    console.log(
      "Uso: node validate-flow.cjs arquivo.json [--repo-root caminho] [--structure-only]\nSem --repo-root, usa o diretório atual. --structure-only não verifica fontes e não é suficiente para a entrega.",
    );
    return;
  }
  const jsonPath = args.shift(),
    options = {};
  while (args.length) {
    const option = args.shift();
    if (option === "--structure-only") options.structureOnly = true;
    else if (option === "--repo-root" && args[0])
      options.repoRoot = args.shift();
    else throw new Error("Argumento inválido: " + option);
  }
  const result = validateFlow(path.resolve(jsonPath), options);
  console.log(
    JSON.stringify(
      { valid: true, file: path.resolve(jsonPath), ...result },
      null,
      2,
    ),
  );
  if (!result.sourceVerified)
    console.log(
      "ATENÇÃO: apenas estrutura/referências; fontes locais não foram verificadas.",
    );
}

module.exports = { validateFlow, verifyBranches };
if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error("Falha: " + error.message);
    process.exitCode = 1;
  }
}
