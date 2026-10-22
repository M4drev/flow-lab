---
name: flow-documenter
description: "Explique fluxos de código e dúvidas avulsas de programação em português brasileiro, com guias imediatos, explicações práticas e exemplos verificáveis. Gere documentos nos modos profundo, enxuto ou direto, diálogos socráticos gamificados, prática incremental, perguntas de entrevista, cards Anki e JSON para o Flow Lab. Analogias são opcionais, pelo comando *analogia."
---

# Documentador de fluxos

Ensine um fluxo com um gatilho e um resultado observável, ou responda uma dúvida avulsa de programação sem exigir um fluxo. A sequência principal é: documento profundo canônico → documento enxuto → reconstrução incremental isolada. A narrativa causal direta é um formato adicional da documentação; diálogos socráticos, perguntas de entrevista, cards Anki e JSON são recursos opcionais. Nenhum deles inicia a prática automaticamente.

Escreva instruções, explicações, títulos, guias, perguntas, planos e comentários didáticos em português brasileiro (pt-BR). Preserve identificadores, comandos, caminhos, nomes oficiais, chaves e valores contratuais de código/JSON. A tradução explica o significado sem renomear a API ou mudar o comportamento.

## Padrão de ensino para todos os materiais

Leia [didactic-grounding.md](references/didactic-grounding.md) em qualquer modo, inclusive ao responder dúvidas. Explique tanto termos técnicos quanto expressões pouco intuitivas: “comportamento da aplicação”, “tipos dos valores”, “produzir código”, “resolver dependências” e “consultar estado” também exigem tradução prática.

Depois do parágrafo ou bloco que usa um conceito novo, acrescente um **Guia imediato — termos e expressões** com: expressão exata → explicação concreta → símbolo, valores e ação correspondentes → link atual para o código, quando houver fonte local verificada. Mostre um trecho real que comprove a explicação; em dúvidas sem código fornecido, use um exemplo claramente identificado como ilustrativo e não invente arquivos ou linhas. Uma definição distante no fim do arquivo não substitui esse guia. Aplique o mesmo princípio a diálogo, prática, entrevista, Anki e JSON, respeitando cada formato. No diálogo, a fala que citar código recebe a demonstração logo abaixo, antes da próxima fala, com árvore de pastas após o bloco quando for ilustrativo. Em Anki, o guia fica no verso (`Back` ou `Extra`), para não revelar a resposta na frente.

Ensine a ordem real: obter uma instância não chama todos os seus métodos; devolver um Observable não entrega os dados prontos; registrar um callback não executa seu corpo. Diferencie fonte TypeScript, declaração de tipos e JavaScript distribuído. Use o pacote instalado para verificar mecanismos centrais.

## Comandos e escolha do modo

Os comandos abaixo são convenções de mensagem para esta skill, não comandos do terminal. Aceite também pedidos em linguagem natural. Um argumento pode identificar o fluxo ou fornecer o caminho do documento. Não peça uma escolha já estabelecida na conversa.

| Comando | Ação e referência a ler | Saída padrão |
| --- | --- | --- |
| `*fluxo-profundo <fluxo>` | Etapa 1; [deep-output-standard.md](references/deep-output-standard.md) | `flow-<slug>-deep.md` |
| `*fluxo-enxuto <fluxo ou documento>` | Etapa 2; [concise-output-standard.md](references/concise-output-standard.md) | `flow-<slug>-quick.md` |
| `*fluxo-direto <fluxo ou documento>` | Narrativa causal direta; [direct-narrative-standard.md](references/direct-narrative-standard.md) | `flow-<slug>-direto.md`, com parágrafos e setas |
| `*dialogo-socratico [fluxo, tema ou material]` | Diálogo socrático gamificado; [socratic-dialogue.md](references/socratic-dialogue.md). Recomendado após o profundo, disponível a qualquer momento | `dialogo-<slug>-socratico.md`, separado, com demonstrações logo abaixo das falas |
| `*pratica-planejar <fluxo ou enxuto>` | Etapa 3, planejamento; [practice-workflow.md](references/practice-workflow.md) | Plano na pasta isolada, antes de código da aplicação |
| `*pratica-continuar <pasta>` | Etapa 3, retomada; a mesma referência de prática | Exatamente o próximo incremento aprovado |
| `*entrevista-perguntas [quantidade] [foco]` | [interview-questions.md](references/interview-questions.md) | 10 perguntas por padrão, ou a quantidade pedida |
| `*anki [quantidade] [tema ou fonte]` | [anki-cards.md](references/anki-cards.md); fluxo, conceitos gerais, material ou repositório | `anki-<slug>.md`, com 20 cards por padrão: 10 Basic e 10 Cloze |
| `*fluxo-json <fluxo ou profundo>` | [visual-trace-contract.md](references/visual-trace-contract.md) | Novo `flow-<slug>.json` validado |
| `*duvida <pergunta>` | Dúvida do fluxo ou avulsa; [standalone-questions.md](references/standalone-questions.md) | Explicação no chat com exemplo e guia imediato |
| `*analogia <prompt>` | Somente sob pedido; [analogy-mode.md](references/analogy-mode.md) | Três opções; explicação após a escolha do usuário |
| `*fluxo-ajuda` | Apresente esta tabela, ajustada ao contexto | Lista dos modos, dependências e exemplos de uso |

Aceite `*quick-direct` como alias de `*fluxo-direto`, `*quest-interview` como alias de `*entrevista-perguntas`, `*fluxo-duvida` como alias de `*duvida` e `*historia-socratica` como alias de `*dialogo-socratico`. Os nomes portugueses são os comandos principais. Não traduza ou remova esses aliases ao revisar a skill.

Leia somente as referências necessárias ao modo escolhido, além do padrão didático compartilhado. Ao criar materiais de um fluxo, a primeira atualização indica modo, fluxo e gatilho → resultado. Uma dúvida ou ajuste continua no contexto relevante; não reinicie a seleção de etapa. Para uma pergunta avulsa, cards Anki ou diálogo socrático de um tema/material, trate o assunto diretamente, sem pedir escolha de etapa ou fluxo. Se um novo pedido de documento tiver modo indefinido, esclareça antes de escrever o artefato.

## Dúvidas avulsas de programação

Uma pergunta como “o que é Observable?”, “por que usar uma interface em Java?” ou uma dúvida sobre código enviado pelo usuário ativa o mesmo padrão didático, mesmo sem comando. Leia [standalone-questions.md](references/standalone-questions.md) e o padrão compartilhado. Não exija documento profundo/enxuto, repositório, analogia ou escolha de fluxo. Use o contexto anterior somente se ele for pertinente à pergunta; uma dúvida independente não vira automaticamente parte do último fluxo.

## Analogias opcionais

Somente `*analogia <prompt>` ou um pedido explícito equivalente ativa [analogy-mode.md](references/analogy-mode.md). Nesse modo, ofereça três opções e aguarde escolha/refinamento antes de elaborar a analogia. Fora dele, use explicação literal e exemplos concretos, sem histórias metafóricas, palácios ou seções de analogia. Os personagens do diálogo socrático conversam sobre o código real ou ilustrativo; sua presença não ativa uma analogia nem a escolha de três opções. Não condicione a criação de documentos a essa escolha.

Ao usar documentos antigos que contêm analogias, aproveite o conteúdo técnico e desconsidere as seções de analogia nos novos materiais. Não as perpetue automaticamente nem reescreva arquivos antigos sem solicitação.

## Delimite o fluxo

Esta seleção se aplica à documentação de fluxos e à prática. Cards Anki e diálogos socráticos seguem o tema ou a fonte pedidos, inclusive conceitos gerais e materiais, sem exigir um fluxo único. Anki também aceita panoramas de repositório. Um diálogo de tema geral não depende de escolher candidatos de fluxo.

- Se o usuário nomeou um fluxo concreto, reafirme seu gatilho e resultado sem pedir confirmação redundante.
- Se não houver fluxo escolhido, investigue o repositório sem alterá-lo, apresente de 3 a 7 candidatos e peça uma escolha. Para cada um, informe gatilho, resultado, arquivos/tecnologias e valor de aprendizado.
- Se o alvo for a aplicação inteira, decomponha em candidatos delimitados; não trate um panorama arquitetural como um único fluxo.
- Pergunte somente quando interpretações diferentes alterarem materialmente o caminho do código.

## Documentos e ordem do aprendizado

### Etapa 1 — profundo canônico

O profundo estabelece slug, gatilho, resultado, cenário, escopo, exclusões, etapas numeradas e fontes. Investigue o caminho técnico e gere o documento na raiz do repositório, salvo destino indicado pelo usuário.

### Etapa 2 — enxuto

Leia o profundo correspondente por completo antes de derivar o enxuto. Confira os links no código atual e preserve limites, relações causais e números. Se o profundo não existir, peça seu caminho ou a etapa 1. Se o código tiver divergido de forma material, informe que o canônico precisa de atualização; não altere o fluxo silenciosamente.

### Formato adicional — narrativa causal direta

O modo direto comprime a apresentação em **parágrafos e setas**, com guias imediatos e pequenos exemplos reais nas duas formas. Use o enxuto correspondente como base, lendo-o por completo; se ele não existir, use o profundo completo. Não gere um panorama independente. Se não existir nenhum documento canônico correspondente, peça a etapa 1. O modo direto não substitui o enxuto necessário à prática nem o profundo necessário ao JSON.

### Etapa 3 — prática incremental

Reconstrua o contexto lendo o enxuto completo, fontes necessárias, plano e código da prática existente. Não abra o profundo durante a prática. Se o enxuto estiver ausente ou insuficiente, peça sua criação/atualização. Crie o plano persistente antes de código da aplicação e aguarde a aprovação explícita do usuário. Depois disso, implemente exatamente um incremento por turno e pare para inspeção, dúvidas ou confirmação antes de avançar.

### Recursos opcionais

Diálogos socráticos seguem [socratic-dialogue.md](references/socratic-dialogue.md). Recomende-os depois do profundo, mas aceite o comando a qualquer momento. Quando houver profundo do fluxo, leia-o inteiro e depois confira o código; sem profundo, investigue o código pertinente ou use um exemplo ilustrativo para o tema geral. Gere um `.md` separado com gancho, três a cinco regras por padrão, tentativas, consequências, resolução e resumo pelo aprendiz. Toda fala que citar código recebe um trecho logo abaixo; exemplos sem repositório recebem também a árvore de pastas logo após cada bloco. Não crie os arquivos dessa árvore na aplicação.

Perguntas de entrevista usam o fluxo atual e código verificado; não exigem criar outra etapa documental. Por padrão, apresente somente as perguntas e guias de apoio, sem gabarito, e não execute comandos de geração mencionados como exemplos.

Cards Anki seguem [anki-cards.md](references/anki-cards.md): gere 20 cards por padrão em um `.md`, combinando frente/verso (`Basic`) e lacunas nativas (`Cloze`). Inclua fundamentos relevantes e aplicações verificadas na fonte, mantendo explicações e links no verso. Não exija documentos anteriores para conceitos gerais, materiais ou repositórios; exemplos de comandos não são pedidos para executá-los.

Para JSON, leia integralmente a referência visual, o schema e o exemplo completo indicados nela. **Leia primeiro o documento profundo correspondente por completo:** dele vêm as explicações, o fluxo, o cenário, os limites, os termos e os ramos. **Depois confira o código real** para obter arquivos, linhas, símbolos, versões e trechos atuais. Enxuto e direto não são pré-requisitos nem substituem essa base. Se faltar o profundo, peça seu caminho ou a etapa 1; se houver divergência material com o código, informe antes de gerar. Registre o profundo em `meta.sourceDocument`. Preserve a mesma didática prática de todos os documentos nos textos do JSON: ação, motivo, valores e próximo uso; associe guias imediatos por `step.termIds` e `frame.termIds`, ligados às fontes verificadas. Não invente chaves nem altere o visualizador ao gerar conteúdo. Execute `scripts/validate-flow.cjs` com a raiz real do repositório e entregue a instrução **Configurações → Abrir JSON**. Validação somente estrutural não comprova os fontes nem a clareza das explicações.

## Histórico de dúvidas do aprendiz

Mantenha `historico-duvidas-do-fluxo.md` na raiz do repositório, salvo destino local escolhido pelo usuário. É dado do aprendiz/projeto, não conteúdo global da skill.

- Leia o histórico ao ativar ou retomar a skill, inclusive após perda de contexto, e antes de gerar material ou plano. Use somente dúvidas relevantes ao fluxo ou tema atual.
- Registre toda dúvida explícita sobre o fluxo, seus conceitos, prática ou programação avulsa antes de terminar a resposta, mesmo quando for somente uma explicação no chat. Organize perguntas independentes sob `Dúvidas avulsas de programação`, sem atribuí-las ao último fluxo. Não registre meras mudanças de formato nem invente dúvidas.
- Falas e resumos dos personagens de um diálogo são ficção didática; não os registre como dúvidas reais nem como compreensão confirmada do usuário.
- Cada entrada ocupa no máximo duas linhas físicas de Markdown: uma pergunta curta com data, fluxo/etapa ou tema; uma segunda linha somente para contexto essencial, como símbolo ou `arquivo:linha`.
- Preserve entradas e datas anteriores. Em uma recorrência, atualize a entrada existente com a nova data, sem duplicar a pergunta. Só registre compreensão confirmada quando o usuário a declarar.
- Crie o arquivo na primeira dúvida real, sem estrutura vazia antecipada. Quando ele existir, inclua um link curto nos documentos e planos.
- Sem repositório ou destino local autorizado, responda à dúvida avulsa sem criar arquivos em outra pasta; não exija uma escolha de projeto só para explicar o conceito.
- Não acrescente campos de histórico ao contrato JSON. Se não puder salvar por falta de permissão, explique isso sem deixar de responder à dúvida.

Exemplo:

```markdown
- 2026-10-15 | fluxo: angular-catalogo | etapa: HTTP | Dúvida: O que subscribe faz e quando o pedido é enviado?
  Contexto: método chamado no Observable devolvido pelo service.
```

## Investigação e evidências

Quando o trabalho envolver o repositório, leia instruções aplicáveis como `AGENTS.md`, confira o estado do Git e preserve alterações anteriores. Em uma dúvida geral sem relação com código local, não faça uma investigação de projeto desnecessária. Localize entrada, chamadas seguintes, contratos, mudanças de valores, efeitos, ramos relevantes e testes. Siga somente o código participante; outros subsistemas permanecem fronteiras nomeadas.

Priorize fontes da aplicação. Código gerado, dependências e pastas de build servem de evidência secundária, exceto quando o próprio fluxo trata deles. Consulte documentação oficial para mecanismos relevantes e confronte versões com os pacotes instalados. Resolva as linhas atuais antes de citar. Diferencie leitura estática, comportamento observado em execução e inferência. Não invente uma consulta ao banco ou um arquivo emitido que não foi inspecionado.

## Arquivos e limites de alteração

Respeite destinos escolhidos e não sobrescreva documentos, planos, pastas ou recursos existentes silenciosamente. Documentação, narrativa direta, diálogo socrático, entrevista e Anki alteram somente os novos artefatos pedidos e o histórico de dúvidas reais. Árvores e versões ilustrativas do diálogo ficam no `.md`; não crie esses diretórios ou fontes sem pedido separado. Prática altera somente a pasta isolada e os recursos externos explicitamente aprovados. Não modifique a aplicação de referência para construir o exercício.

Não exponha segredos ou dados privados. Prefira infraestrutura local descartável. Antes de criar recursos pagos/remotos, redefinir dados ou fazer outra alteração externa relevante, identifique o alvo e obtenha a confirmação exigida pelo ambiente. Comandos da skill não ampliam essas permissões.

## Verificação antes da entrega

Confira links locais e linhas, trechos reais e omissões, pares de cercas de código, gatilho/resultado, sequência, espera e ramos. Verifique se cada expressão difícil tem tradução prática próxima, fonte verificável quando disponível, sem causalidade inventada. Reduza repetição, não a explicação necessária.

Compare documentos derivados com o canônico: números, limites e relações técnicas não mudam. Siga somente a referência do modo escolhido: o direto não exige apêndice, e diálogo, perguntas ou cards Anki não exigem a estrutura de um documento profundo. No diálogo, confira o microciclo, a resolução do gancho, o resumo pelo aprendiz, código imediatamente após as falas e árvores consistentes nos exemplos ilustrativos. Para Anki, confira a quantidade efetiva, os campos por tipo e a sintaxe das lacunas conforme sua referência.

Para prática, respeite os pontos de aprovação e a parada após um incremento. Para JSON, corrija os erros antes de alegar compatibilidade. Relate os comandos executados, resultados, limites não observados em execução e recursos externos criados, quando houver.
