# JSON compatível com o Flow Lab

Use esta referência ao gerar um JSON para o visualizador, não para reimplementar a interface. O JSON é um material opcional do mesmo fluxo delimitado; não altera a ordem documento profundo → enxuto → prática.

## Recursos obrigatórios e ponto de partida

Antes de gerar o artefato, leia integralmente:

1. esta referência e `didactic-grounding.md`;
2. [flow.schema.json](../assets/flow-lab-contract/flow.schema.json), contrato estrutural exato `schemaVersion: "1.0"`;
3. [example/flow.json](../assets/flow-lab-contract/example/flow.json), exemplo completo e válido de outro fluxo;
4. o documento profundo correspondente por completo, como fonte das explicações e de todas as informações gerais do fluxo;
5. depois dessa leitura, o código real necessário para conferir arquivos, linhas, símbolos, versões, chamadas e relações.

O **documento profundo é a base didática e causal do JSON**: use seu gatilho, resultado, cenário, escopo, exclusões, etapas, explicações, guias, contratos e ramos. Adapte esses conteúdos aos campos suportados sem perder as relações e a clareza prática. Não substitua essa leitura pelo enxuto, direto, exemplo do contrato ou lembranças do chat. Enxuto e direto não precisam existir para gerar JSON.

Depois, use o **código atual como evidência dos detalhes executáveis**: confirme caminhos, linhas, nomes, corpos de métodos, retornos, versões e cópias dos trechos. Não copie comentários didáticos do apêndice como se fossem linhas reais da aplicação. Se só as linhas se deslocaram, resolva os novos números; se o comportamento divergir de forma material, informe que o profundo precisa ser atualizado antes de prosseguir, sem mudar silenciosamente o fluxo do JSON.

Se faltar o profundo, peça seu caminho ou a etapa 1. Um caminho fornecido para enxuto/direto serve para localizar o profundo correspondente, não para mudar a fonte didática. Se houver vários profundos plausíveis, peça que o usuário escolha. Se o fluxo ainda não foi escolhido, apresente candidatos delimitados. Não gere o artefato enquanto esse pré-requisito estiver pendente.

O exemplo é uma demonstração do formato, não um modelo para copiar os nomes/valores de negócio. Seu fonte real está em `example/src/dobro.mjs`. Não copie o catálogo da SoaresStore nem versões de dependências de outro projeto.

## Ensino concreto dentro do contrato

Aplique o padrão didático aos textos de cada etapa e quadro: termo técnico ou expressão difícil deve ter explicação concreta próxima, ligada ao símbolo real e à ação concreta no código. Use os campos existentes `terms.definition`, `terms.usage`, `sourceId`/`line` e `frame.termIds`; não acrescente chaves para imitar um guia Markdown. Para “estado local”, identifique os campos e mostre sua escrita/leitura nas cópias dos trechos.

O JSON é um material de ensino com a mesma clareza do profundo, enxuto, direto e das respostas avulsas. Comprimir em campos não autoriza resumir a explicação a rótulos ou a outro jargão. Em `summary`, explique o que acontece, por que é necessário e quem usará o resultado; em `actor`, `effect`, `insight` e `next`, identifique ações e dados. Em `frame.explanation`, descreva a linha destacada com receptor, método/função, valores de entrada, retorno e momento, quando pertinentes. Aplique o mesmo cuidado às variantes, escolhas, variáveis e descrições gerais.

Preencha **`step.termIds` e `frame.termIds`** com os termos e expressões difíceis usados naquele texto; confira também variantes por cenário. O visualizador coloca esses guias imediatamente depois da explicação correspondente. `terms.definition` traduz o conceito em ações simples; `terms.usage` conecta o conceito ao símbolo, aos valores e à consequência neste fluxo. `sourceId`/`line` levam ao trecho real; quando declaração, escrita e leitura diferirem, use os quadros/fontes correspondentes. Um glossário geral sem associação ao resumo/quadro não cumpre esse padrão.

Exemplos para orientar a escrita, não para impor Angular a outros projetos:

- **Vago:** “O template consulta o estado local.” **Concreto:** “Angular chama products() para ler a lista guardada no catálogo. O @for percorre essa lista e entrega cada produto a um card.” Explique template, lista guardada e entrada do card nos termos associados, com origem verificada.
- **Vago:** “A página inicializa Signals.” **Concreto:** “signal([]) cria products com uma lista vazia. products() lê essa lista; products.set(res.content) a troca pelos produtos recebidos, e Angular acompanha a mudança para atualizar a tela.” No guia, defina Signal com esse uso e mostre as linhas de criação, escrita e leitura nas fontes/quadros pertinentes.
- **Vago:** “O service devolve um Observable frio.” **Concreto:** “O método devolve um objeto pelo qual o catálogo receberá a resposta ou a falha. Para este GET do HttpClient, subscribe ativa o pedido; a lista chega depois no callback, a função registrada para receber a resposta.” Explique Observable, subscribe e callback sem generalizar esse comportamento HTTP a todos os Observables.

Use texto simples nos campos: `textContent` não interpreta Markdown. A linha destacada e os segmentos são o exemplo real; não duplique código em strings didáticas nem invente links em Markdown que a interface exibirá como texto literal. Revise a relação **frase → termo → símbolo/valor → fonte/linha → próxima ação** antes da validação mecânica. Não acrescente analogias por padrão.

## Um objeto JSON, nove campos obrigatórios

JSON puro UTF-8: sem Markdown envolvendo o arquivo, comentários, funções, vírgulas após o último elemento ou HTML executável. Todos os textos didáticos são pt-BR; preserve os identificadores e o texto original das cópias dos trechos.

| Campo | Formato | Papel no aplicativo |
| --- | --- | --- |
| `schemaVersion` | string `"1.0"` | Versão do contrato |
| `meta` | objeto | Identidade, fronteira e procedência do fluxo |
| `scenarios` | lista (array) não vazia | Alternativas de resultado |
| `steps` | lista (array) não vazia em ordem causal | Explicação das etapas principais |
| `graph` | objeto | Nós, conexões e coordenadas do mapa |
| `sources` | objeto por ID | Trechos de cada arquivo, armazenados uma vez |
| `terms` | objeto por ID | Glossário aplicado ao código |
| `frames` | objeto por ID | Quadros de linha, chamadas, retornos e condições |
| `traces` | objeto por ID | Sequência de IDs de quadros de cada nó |

O esquema é a autoridade para nomes e tipos. Ele rejeita propriedades desconhecidas; não crie `code`, `file`, `sourceFiles`, `lessons`, `analogy`, `executor` ou outros nomes por intuição quando o campo correto já existe. Os objetos por ID não são listas (arrays). IDs de quadros, fontes e trilhas são suas chaves, sem um `id` interno extra. Nós/etapas possuem `id`; arestas não possuem `id` no contrato 1.0.

### Metadados e cenários

- `meta` exige `id`, `title`, `language: "pt-BR"` e `description`.
- Para fluxos reais, registre `sourceDocument` como caminho relativo do documento profundo utilizado, `revision` como revisão verificada, `verifiedAt` como data real da verificação e `versions` como objeto de textos (strings). Esses campos dão procedência; não inferem execução observada.
- `meta.references`, quando usado, é uma lista de `{title, url}` com URLs `https://` de fontes consultadas.
- Cada cenário exige `id` e `label`; `color`, opcional, usa `#RRGGBB`. Use somente os resultados relevantes ao código; não invente sucesso/vazio/erro se não participarem do fluxo.
- `description` declara gatilho, saída observável e que se trata de percurso didático quando não há conexão com um depurador real.

### Fontes e glossário

- Cada fonte exige `path`, `language`, `origin` e `segments`.
- `path` é relativo à raiz do repositório analisado, sem `:linha`, URL ou caminho absoluto da máquina. O número fica em `frame.line`/`target.line`.
- `origin` aceita somente `application` ou `dependency`. Para dependências, registre `package` e `version` verificados; `runtimeSourceId`, opcional, conecta ao JavaScript distribuído ou outra implementação executável identificada.
- Cada segmento tem `{startLine, lines}`: linha inicial inteira, contada a partir de 1, e lista (array) de textos (strings). Preserve conteúdo, indentação e linhas vazias, sem inserir comentários didáticos na cópia do trecho. Uma string representa uma linha original, sem terminador de linha. Segmentos não se sobrepõem; lacunas ficam explícitas na interface.
- Toda linha referenciada precisa estar em algum segmento, inclusive a origem de um termo e o destino de uma chamada. Não substitua trechos reais por pseudocódigo sem comunicar que deixou de representar aquele fonte.
- Cada termo exige `label`, `category`, `definition` e `usage`; origem opcional é `sourceId` + `line`. Explique classe, instância, referência, método, biblioteca e retorno com precisão, usando o código atual.
- Não inclua credenciais, `.env`, chaves privadas, dados pessoais ou conteúdo de produção. Omita segmentos sensíveis; se forem indispensáveis à explicação, identifique a fronteira sem fabricar uma linha alternativa.

### Etapas, quadros e trilhas

- Uma etapa exige `id`, `title` e `summary`. Para um material completo, preencha também `number` (string), `kind`, `kindLabel`, `actor`, `effect`, `insight`, `next`, `activeNodes`, `primaryNodeId`, `termIds` e um `log` didático quando útil. `timing` e `kicker` são opcionais.
- `actor` indica quem executa; `effect` explica o estado/efeito produzido; `insight` registra a chave técnica; `next` conecta à próxima responsabilidade. Não substitua isso por uma lista de tecnologias.
- `primaryNodeId` aponta para um nó da mesma etapa e compatível com o cenário. Define a trilha principal; cada etapa precisa ter uma trilha válida em cada cenário. `variants` é objeto por ID de cenário que substitui os campos suportados pelo esquema, inclusive `primaryNodeId`, quando o resultado muda.
- Um quadro exige `sourceId`, `line`, `label`, `explanation`, `kind` e `termIds` (use `[]` se não houver termos relevantes).
- `kind` do quadro aceita somente `execute`, `declaration`, `call`, `return`, `register`, `async`, `parallel`, `condition`, `callback`, `reactive`, `render` ou `future`. `step.kind` e os tipos visuais de nó/aresta não são esse enum; siga os nomes visuais do visualizador, como `sync`, `async`, `parallel`, `reactive` e `error`.
- `target` é `{sourceId, line}`, nunca um caminho de arquivo diretamente. `stack` é lista (array) de textos (strings) que representa a pilha didática. `variables` é uma lista de objetos com `name` e `value` (string) ou `values` (objeto de textos (strings) por cenário). Até `0`, `true`, arrays e `null` devem ser descritos como strings nesses valores de visualização.
- Cada trilha exige `label` e `frameIds`, lista (array) não vazia em ordem causal. Reutilize os mesmos quadros/arquivos entre trilhas; não duplique a cópia do trecho em cada quadro.
- Entradas de função, chamadas, retorno ao chamador e registro de callbacks precisam ter ordem coerente. A mesma linha pode aparecer em vários quadros para detalhar partes de uma expressão; isso não significa executar a chamada novamente.
- Sobrecarga TypeScript e `.d.ts` são declarações de contexto, não corpo executado. Template HTML é avaliado/renderizado pelo framework; a JVM não executa o Angular. Um Observable pode emitir sincronamente: classifique a operação concreta, não o nome da biblioteca.

### Ramificações sem misturar caminhos

- Filtro `scenarios: ["..."]` pode ser aplicado a quadros, nós e arestas. Omitir o filtro significa todos os cenários, não apenas o primeiro.
- Para alternativas na mesma trilha, declare `traces.<id>.branches` com valores iniciais, `frame.when` com as condições e `choice.branch/value` com a seleção. O próximo Avançar percorre o ramo escolhido; não coloque retry e paginação como chamadas consecutivas obrigatórias.
- Cada escolha exige `label` e `description`. `scenario` seleciona resultado; `nodeId` permite explorar outro ramo do mapa. `frameId` identifica o início do ramo ou uma referência: com `branch`, a leitura aguarda o avanço; sem `branch`, consulta a origem sem mudar a posição.
- Uma escolha sem destino apenas explica uma alternativa. Nunca atribua comportamento a campos não suportados pela aplicação.
- Cada combinação material de cenário/ramo precisa ter quadros navegáveis. O validador checa valores padrão e mudanças individuais de ramo; relações entre vários ramos ainda exigem revisar os caminhos combinados contra o código.
- Represente espera, callback, condição, atividade independente e evento futuro separadamente. Não confunda uma ordem de estudo com uma ordem total entre operações paralelas.

### Mapa causal

- `graph` exige `width`, `height`, `nodes` e `edges`.
- Cada nó exige `id`, `step`, `x`, `y`, `title` e `traceId`. `step` é índice contado a partir de 0 de `steps`, diferente das linhas contadas a partir de 1 dos arquivos. `subtitle`, `type` e `scenarios` são opcionais.
- Cada aresta exige `from`, `to` e `step`; `type`, `scenarios` e `loop` são opcionais. Arestas só conectam IDs de nós existentes. `loop: true` sinaliza reentrada; não converte evento futuro em repetição automática.
- O visualizador atual usa nós de 160×68. Deixe espaçamento entre eles e dimensione o grafo para conter todos; cresça suas dimensões conforme o fluxo, sem impor um limite fixo de etapas. Evite colisões entre nós que precisam aparecer juntos.

## Como gerar e validar

1. Leia o profundo completo e extraia o fluxo, suas explicações e informações gerais. Em seguida, confira o código atual, revisão e versões necessárias e relacione cada etapa aos arquivos e linhas reais.
2. Organize fontes/termos, quadros, trilhas, cenários, etapas e grafo. Use o exemplo somente como guia de formato.
3. Grave um novo `flow-<slug>.json` perto do profundo ou no destino solicitado; não sobrescreva o `flow.json` padrão da aplicação sem pedido explícito.
4. Execute o utilitário abaixo com o diretório real desta skill e a raiz real do repositório:

```bash
node "<skill-dir>/scripts/validate-flow.cjs" "<artefato.json>" --repo-root "<raiz-do-repositorio>"
```

O utilitário usa o esquema compilado e o mesmo motor de referências da aplicação. Não exige instalação npm. Confere campos/tipos, IDs/linhas/destinos, cobertura de etapas por cenário, alternativas individuais, limites do grafo e conteúdo das cópias dos trechos contra os arquivos locais. Não executa o código das cópias dos trechos, abre IDEs, chama APIs nem altera fontes.

`sourceVerified: true` é necessário para entregar um fluxo real como verificado. `--structure-only` serve para diagnóstico quando as fontes não estão disponíveis; seu resultado não autoriza afirmar que os caminhos/linhas são reais. O script não prova causalidade, didática, ausência de colisões no mapa ou todas as combinações entre múltiplos ramos: revise essas propriedades e, quando possível, faça um teste rápido no visualizador.

5. Corrija os erros sem flexibilizar o contrato, ocultar caminhos ou inventar fonte. Preserve o artefato anterior quando atualizar outro fluxo.
6. Entregue link do JSON, documento profundo utilizado, comando/resultado da validação e orientação **Configurações → Abrir JSON → selecionar o arquivo**. Não é preciso colocar o JSON na pasta do visualizador para importar pelo seletor.

O JSON não carrega dependências nem executa a aplicação de referência. O visualizador de referência está em `prototypes/flow-lab`: no desktop, possui explicação à esquerda, linhas no centro e mapa/console maior à direita, com divisórias ajustáveis entre painéis fixos. Em telas menores, eles são empilhados. Todos continuam destacáveis, móveis e redimensionáveis; reencaixar preserva as larguras fixas da sessão. A barra móvel única usa alça de seis pontos horizontais acima dos três botões. Avançar/retroceder percorre linhas e atravessa etapas nos dois sentidos; não há temporizador. Gerar outro fluxo não exige reescrever esses componentes nem pressupõe que essa pasta exista no repositório estudado.

`?flow=arquivo.json` só funciona quando esse arquivo é servido por HTTP e o navegador consegue buscá-lo. Abertura na IDE utiliza os caminhos da raiz configurada no servidor local do visualizador; para outro repositório, ajuste `--repo-root` ao iniciar esse servidor. Importar o JSON não muda a raiz do servidor nem a preferência de editor da máquina.

## Compatibilidade e manutenção

- Estes recursos empacotados são uma cópia do contrato Flow Lab 1.0 aprovado, não dependem da instalação da SoaresStore.
- Se o usuário escolher um visualizador com outro esquema, compare os contratos antes de gerar. Não alegue compatibilidade nem mude silenciosamente a versão do artefato; peça a atualização do pacote quando houver incompatibilidade.
- Ao atualizar o contrato da aplicação, mantenha `flow.schema.json`, `flow-engine.cjs` e `scripts/schema-validator.cjs` sincronizados e repita os testes com fluxos válidos/inválidos. O compilado foi gerado por Ajv em modo standalone (validador independente); não é para editar manualmente, e seu hash verifica o esquema empacotado.
- Mudanças apenas no layout da aplicação não exigem novos campos no JSON.
- Larguras, posições e painéis destacados pertencem à interface, sem campos adicionais no artefato. O layout e o reforço didático atuais preservam `schemaVersion: "1.0"`; use o contrato empacotado, independentemente do nome da pasta do visualizador.
