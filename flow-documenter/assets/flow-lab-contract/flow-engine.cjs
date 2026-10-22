/* Motor independente de DOM: valida o JSON e resolve percursos sem executar código recebido. */
(function (root) {
  "use strict";
  const kinds = [
    "execute",
    "declaration",
    "call",
    "return",
    "register",
    "async",
    "parallel",
    "condition",
    "callback",
    "reactive",
    "render",
    "future",
  ];
  function sourceLines(source) {
    return source.segments.flatMap((segment) =>
      segment.lines.map((text, offset) => ({
        number: segment.startLine + offset,
        text,
      })),
    );
  }
  function lineExists(data, sourceId, line) {
    return (
      !!data.sources[sourceId] &&
      sourceLines(data.sources[sourceId]).some((row) => row.number === line)
    );
  }
  function validate(data) {
    const fail = (message) => {
      throw new Error("JSON de fluxo inválido: " + message);
    };
    if (!data || data.schemaVersion !== "1.0")
      fail("schemaVersion deve ser 1.0.");
    if (!data.meta || typeof data.meta.title !== "string")
      fail("meta.title ausente.");
    for (const name of ["steps", "scenarios"])
      if (!Array.isArray(data[name]) || !data[name].length)
        fail(name + " deve ser uma lista não vazia.");
    for (const name of ["sources", "terms", "frames", "traces"])
      if (
        !data[name] ||
        typeof data[name] !== "object" ||
        Array.isArray(data[name])
      )
        fail(name + " deve ser um objeto por ID.");
    if (
      !data.graph ||
      !Array.isArray(data.graph.nodes) ||
      !data.graph.nodes.length ||
      !Array.isArray(data.graph.edges) ||
      !(data.graph.width > 0) ||
      !(data.graph.height > 0)
    )
      fail("grafo ausente ou sem dimensões.");
    const unique = (list, name) => {
      const ids = list.map((item) => item.id);
      if (
        ids.some((id) => typeof id !== "string" || !id) ||
        new Set(ids).size !== ids.length
      )
        fail("IDs duplicados ou ausentes em " + name);
      return new Set(ids);
    };
    unique(data.steps, "steps");
    const scenarios = unique(data.scenarios, "scenarios");
    const nodes = unique(data.graph.nodes, "nodes");
    const checkScenarios = (item) => {
      if (
        item.scenarios &&
        (!Array.isArray(item.scenarios) ||
          !item.scenarios.length ||
          item.scenarios.some((id) => !scenarios.has(id)))
      )
        fail("referência a cenário inexistente.");
    };
    const checkTerms = (item) => {
      if (
        item.termIds &&
        (!Array.isArray(item.termIds) ||
          item.termIds.some((id) => !data.terms[id]))
      )
        fail("referência a termo inexistente.");
    };
    for (const [id, source] of Object.entries(data.sources)) {
      if (
        typeof source.path !== "string" ||
        !Array.isArray(source.segments) ||
        !source.segments.length
      )
        fail("fonte " + id + " sem path/segmentos.");
      const occupied = new Set();
      for (const segment of source.segments) {
        if (
          !Number.isInteger(segment.startLine) ||
          segment.startLine < 1 ||
          !Array.isArray(segment.lines) ||
          !segment.lines.length ||
          segment.lines.some((line) => typeof line !== "string")
        )
          fail("segmento inválido em " + id);
        segment.lines.forEach((_, offset) => {
          const line = segment.startLine + offset;
          if (occupied.has(line))
            fail("segmentos sobrepostos em " + id + ":" + line);
          occupied.add(line);
        });
      }
      if (source.runtimeSourceId && !data.sources[source.runtimeSourceId])
        fail("runtimeSourceId inválido em " + id);
    }
    for (const [index, step] of data.steps.entries()) {
      if (typeof step.title !== "string" || typeof step.summary !== "string")
        fail("etapa " + step.id + " sem título/resumo.");
      checkTerms(step);
      if (
        step.activeNodes &&
        (!Array.isArray(step.activeNodes) ||
          step.activeNodes.some((id) => !nodes.has(id)))
      )
        fail("activeNodes inválido em " + step.id);
      for (const [scenario, variant] of Object.entries(step.variants || {})) {
        if (!scenarios.has(scenario)) fail("variante inválida em " + step.id);
        checkTerms(variant);
      }
      for (const scenario of scenarios) {
        if (
          !data.graph.nodes.some(
            (node) =>
              node.step === index &&
              (!node.scenarios || node.scenarios.includes(scenario)),
          )
        )
          fail("etapa sem trilha em " + step.id + "/" + scenario);
        const primary =
          step.variants?.[scenario]?.primaryNodeId || step.primaryNodeId;
        if (!primary) continue;
        const node = data.graph.nodes.find((item) => item.id === primary);
        if (
          !node ||
          node.step !== index ||
          (node.scenarios && !node.scenarios.includes(scenario))
        )
          fail("primaryNodeId inválido em " + step.id + "/" + scenario);
      }
    }
    for (const [id, term] of Object.entries(data.terms)) {
      if (typeof term.label !== "string" || typeof term.definition !== "string")
        fail("termo " + id + " incompleto.");
      if (term.sourceId && !lineExists(data, term.sourceId, term.line))
        fail("origem do termo " + id + " inexistente.");
    }
    for (const [id, frame] of Object.entries(data.frames)) {
      if (!lineExists(data, frame.sourceId, frame.line))
        fail(
          "linha inexistente no quadro " +
            id +
            ": " +
            frame.sourceId +
            ":" +
            frame.line,
        );
      if (
        !kinds.includes(frame.kind) ||
        typeof frame.explanation !== "string" ||
        typeof frame.label !== "string"
      )
        fail("quadro " + id + " incompleto.");
      checkScenarios(frame);
      checkTerms(frame);
      if (
        frame.stack &&
        (!Array.isArray(frame.stack) ||
          frame.stack.some((value) => typeof value !== "string"))
      )
        fail("pilha inválida em " + id);
      if (frame.choices && !Array.isArray(frame.choices))
        fail("choices deve ser uma lista em " + id);
      if (
        frame.variables &&
        (!Array.isArray(frame.variables) ||
          frame.variables.some(
            (variable) => !variable || typeof variable.name !== "string",
          ))
      )
        fail("variables deve conter nomes em " + id);
      if (
        frame.target &&
        !lineExists(data, frame.target.sourceId, frame.target.line)
      )
        fail("destino inexistente em " + id);
      if (
        frame.when &&
        (typeof frame.when !== "object" || Array.isArray(frame.when))
      )
        fail("filtro de ramo inválido em " + id);
      for (const choice of frame.choices || []) {
        if (choice.scenario && !scenarios.has(choice.scenario))
          fail("cenário de escolha inexistente em " + id);
        if (choice.frameId && !data.frames[choice.frameId])
          fail("quadro de escolha inexistente em " + id);
        if (choice.nodeId && !nodes.has(choice.nodeId))
          fail("nó de escolha inexistente em " + id);
        if (choice.branch && typeof choice.value !== "string")
          fail("escolha de ramo sem valor em " + id);
      }
    }
    for (const [id, trace] of Object.entries(data.traces)) {
      if (
        !Array.isArray(trace.frameIds) ||
        !trace.frameIds.length ||
        trace.frameIds.some((frameId) => !data.frames[frameId])
      )
        fail("trilha " + id + " tem quadros inexistentes.");
      if (
        trace.branches &&
        (typeof trace.branches !== "object" || Array.isArray(trace.branches))
      )
        fail("valores iniciais de ramos inválidos em " + id);
    }
    for (const node of data.graph.nodes) {
      if (typeof node.title !== "string") fail("nó sem título: " + node.id);
      if (
        !Number.isInteger(node.step) ||
        node.step < 0 ||
        node.step >= data.steps.length ||
        !data.traces[node.traceId] ||
        !Number.isFinite(node.x) ||
        !Number.isFinite(node.y)
      )
        fail("nó " + node.id + " sem etapa, trilha ou posição válida.");
      checkScenarios(node);
      const relevantScenarios = node.scenarios || [...scenarios];
      for (const scenario of relevantScenarios)
        if (!traceFrames(data, node.traceId, scenario).length)
          fail("trilha vazia para " + node.id + "/" + scenario);
    }
    for (const edge of data.graph.edges) {
      if (
        !nodes.has(edge.from) ||
        !nodes.has(edge.to) ||
        !Number.isInteger(edge.step) ||
        edge.step < 0 ||
        edge.step >= data.steps.length
      )
        fail("aresta com origem, destino ou etapa inválidos.");
      checkScenarios(edge);
    }
    return data;
  }
  function stepView(data, stepIndex, scenario) {
    const step = data.steps[stepIndex];
    return { ...step, ...(step.variants?.[scenario] || {}) };
  }
  function traceFrames(data, traceId, scenario, selections = {}) {
    const trace = data.traces[traceId];
    const branches = { ...(trace.branches || {}), ...selections };
    return trace.frameIds
      .map((id) => ({ id, ...data.frames[id] }))
      .filter(
        (frame) =>
          (!frame.scenarios || frame.scenarios.includes(scenario)) &&
          Object.entries(frame.when || {}).every(
            ([key, value]) => branches[key] === value,
          ),
      );
  }
  root.FlowEngine = Object.freeze({
    validate,
    stepView,
    traceFrames,
    sourceLines,
    lineExists,
  });
  if (typeof module !== "undefined" && module.exports)
    module.exports = root.FlowEngine;
})(typeof window !== "undefined" ? window : globalThis);
