# Como gerar um fluxo para o Flow Lab

O visualizador usa `flow.json` por padrão. Para outro fluxo, gere um JSON conforme `flow.schema.json` e escolha **Abrir JSON**. Também é possível servir a pasta por HTTP e usar `?flow=outro-fluxo.json`. HTML, CSS e JavaScript permanecem iguais.

## Conteúdo e motor

- `flow.json`: conteúdo deste fluxo, incluindo 13 etapas, 19 nós, termos e quadros.
- `flow-engine.js`: valida IDs/referências e filtra quadros por cenário, sem DOM.
- `app.js`: renderização, navegação, painel de código, busca e áudio.
- `styles.css`: componentes visuais reutilizáveis.
- `floating-panels.js`: janelas internas móveis e redimensionáveis, sem duplicar o conteúdo.
- `workspace-layout.js`: divisórias redimensionáveis entre os três painéis fixos, por ponteiro e teclado.
- `study-mode.js`: modo de tela cheia com os três painéis, saída por botão/Esc e sincronização com o navegador.
- `serve.py`: servidor local e ponte segura para o editor da máquina; não exige pacotes Python externos.
- `flow.schema.json`: contrato estrutural; o motor verifica também referências cruzadas.

O mapa representa grupos didáticos de responsabilidades. O painel de linhas detalha a avaliação de expressões, entra nos métodos e volta ao chamador. Ele é um percurso verificado por análise do fonte, sem conexão a uma sessão real de debugger.

## Ordem para a IA preencher

1. Leia o documento profundo correspondente por completo: dele vêm o fluxo, as explicações, os limites e os ramos. Depois confira o código atual para caminhos, linhas, símbolos e versões. Registre o profundo em `meta.sourceDocument`. Enxuto e direto não substituem essa base. Se o comportamento tiver divergido, alinhe o profundo antes de gerar; deslocamentos de linhas podem ser corrigidos sem mudar o fluxo.
2. Crie `sources` por ID. Guarde cada trecho uma única vez em `segments: [{startLine, lines}]`. Uma linha do array equivale a uma linha original; preserve linhas vazias. Segmentos omitidos aparecem como lacunas explícitas.
3. Crie `terms`: categoria, definição para estagiário, uso concreto e origem `sourceId/line`.
4. Crie `frames`: `sourceId`, `line`, título, explicação, categoria e `termIds`. Inclua receptor, argumentos, saída e chamada/retorno quando participarem da linha.
5. Crie `traces` com IDs dos quadros na ordem causal. IDs podem ser reutilizados entre trilhas; código não é duplicado.
6. Crie `steps` com resumo, executor, efeito, chave de entrevista e próxima conexão. Toda etapa precisa ter ao menos um nó/trilha compatível com cada cenário, para permitir navegação contínua. Se uma etapa tiver vários nós, use `primaryNodeId` para escolher a trilha principal; esse nó deve pertencer à etapa e ao cenário. `step.variants` pode substituir essa escolha. Sem essa propriedade, o primeiro nó compatível é selecionado.
7. Crie `graph.nodes` com etapa (índice zero), coordenadas e `traceId`; arestas declaram origem, destino, etapa e tipo.
8. Declare `scenarios` e aplique filtros `scenarios: ["..."]` a quadros, nós e arestas condicionais. `step.variants` substitui a explicação da etapa no cenário.

## Didática das explicações e guias imediatos

O JSON usa o mesmo ensino prático dos documentos. Preserve o termo técnico exato, mas explique o que ele representa naquele código, quem faz a ação, quais valores entram/saem, por que a ação é necessária e qual passo poderá usar o resultado. Explicação curta não pode depender de uma palavra difícil ainda sem tradução. Aplique isso também a frases como “consultar estado”, “disponibilizar configuração” e “produzir código”. Não inclua analogias por padrão.

| Onde escrever | O que o leitor precisa entender |
| --- | --- |
| `step.summary` e `step.variants` | O que acontece nesta responsabilidade, por que precisa acontecer e o que permite depois. Dê nome aos dados e métodos envolvidos. |
| `actor`, `effect`, `insight`, `next` | Quem age; qual valor/objeto muda; qual relação técnica importa; quem usará o resultado. Evite rótulos soltos como “infraestrutura resolvível”. |
| `frame.explanation` | Na linha destacada: objeto que recebe a chamada, método, argumentos, resultado e próximo destino, quando pertinentes. Separe preparar, chamar, retornar e esperar. |
| `terms.definition` | Significado simples do termo ou expressão, sem explicar um jargão por outro desconhecido. |
| `terms.usage`, `sourceId` e `line` | Uso concreto naquele fluxo, com símbolo e valor. A referência abre a linha real no painel de código. |
| `step.termIds` e `frame.termIds` | IDs dos conceitos usados naquele resumo/quadro. Eles exibem o guia junto da explicação, sem exigir procurar no glossário geral. |

O guia da etapa aparece logo após seu resumo; o guia da linha, logo após sua explicação. Preencha os dois conjuntos de IDs, inclusive nas variantes de cenário que introduzirem outros conceitos. O glossário geral é uma consulta adicional. Uma referência deve corresponder ao uso descrito e existir nos segmentos; a linha destacada já é o exemplo de código, sem duplicar a cópia do trecho no texto. Nos textos do JSON, use texto simples: o aplicativo não transforma Markdown em links ou blocos de código.

Exemplos de revisão, aplicáveis somente quando os símbolos existirem no fluxo:

- **Vago:** “O template consulta o estado local.” **Claro:** “Angular chama products() para ler a lista guardada no catálogo. O @for percorre essa lista e passa cada produto ao ProductCardComponent; sem essa leitura, os cards não receberiam os produtos.” Associe os termos de template, leitura e entrada do card às linhas correspondentes.
- **Vago:** “O componente inicializa Signals.” **Claro:** “signal([]) cria products com uma lista vazia; products() permite ler a lista e products.set(res.content) a troca pelos produtos recebidos. Angular acompanha essa mudança para atualizar a tela.” No guia, explique **Signal** como um valor cuja leitura e mudança podem ser acompanhadas pelo Angular; aponte declaração, escrita e leitura pelos quadros pertinentes.
- **Vago:** “O service retorna um Observable frio.” **Claro:** “getPublicProducts devolve um objeto Observable, pelo qual o catálogo receberá a resposta ou a falha. Para este GET do HttpClient, subscribe ativa o pedido; a lista de produtos chega depois em res.content.” No guia, explique **Observable**, **subscribe** e **callback**, sem afirmar que todo Observable faz HTTP ou é assíncrono.

Esses exemplos são orientação de linguagem, não trechos para copiar em qualquer projeto. O validador verifica estrutura e referências; a clareza, a causalidade e a cobertura dos termos exigem revisão de quem gera o material.

## Quadro mínimo com contexto

```json
{
  "sourceId": "catalog",
  "line": 110,
  "label": "Entrar no método do service",
  "explanation": "productService é o campo que guarda a instância de ProductService. getPublicProducts é seu método; recebe page=0 e size=12. Após o retorno, subscribe é chamado no Observable.",
  "kind": "call",
  "termIds": ["instance", "method", "page"],
  "stack": [
    "CatalogComponent.loadProducts",
    "ProductService.getPublicProducts"
  ],
  "target": { "sourceId": "service", "line": 53 }
}
```

Esse exemplo só é válido com as fontes e termos correspondentes. Para referenciar uma linha, ela precisa existir em um segmento de `sources`.

Categorias: `execute`, `declaration`, `call`, `return`, `register`, `async`, `parallel`, `condition`, `callback`, `reactive`, `render` e `future`. Uma declaração contextual não é uma instrução executada. Templates são avaliados pelo framework; bibliotecas TypeScript são compiladas/bundled em JavaScript.

`choices` marca ramificações. Uma opção pode selecionar `scenario` ou abrir `nodeId` para explorar um ramo; `frameId` identifica o início do ramo ou uma referência a consultar. Selecionar uma opção não avança por si só a leitura da trilha: para alternativas dentro dela, use `trace.branches` como valores iniciais, `frame.when` para filtrar quadros e `choice.branch/value` para escolher o caminho. O próximo clique em Avançar entra no quadro seguinte desse ramo. Sem `branch`, `frameId` apenas consulta a linha de origem, mantendo o percurso. Assim retry e paginação não aparecem como duas chamadas obrigatórias consecutivas. Opções sem destino apenas explicam alternativas. `variables` mostra valores: use `value` fixo ou `values` por cenário.

Para dependências, registre `origin: "dependency"`, pacote e versão. `runtimeSourceId` conecta o fonte TypeScript ao trecho JavaScript distribuído. Não use sobrecargas ou `.d.ts` como corpo executável; não copie a biblioteca inteira.

## Verificação e execução

```bash
npm ci
npm run check
python3 flow-lab/serve.py --repo-root /caminho/do/projeto
```

Acesse `http://localhost:4173`. Execute os comandos acima na raiz desta cópia. O servidor serve a pasta do próprio script, independentemente de onde o comando foi chamado. Sem `--repo-root`, a abertura no editor usa a raiz desta cópia; para trabalhar com os caminhos de outro projeto, informe sua raiz. Se você já estiver dentro do laboratório, use `python3 serve.py --repo-root /caminho/do/projeto`. A comparação dos trechos com a aplicação de origem é opcional nos testes: use `FLOW_LAB_SOURCE_ROOT=/caminho/da/SoaresStore npm test`, com as dependências desse projeto instaladas.

Se o servidor simples anterior estiver usando a porta 4173, pare-o com **Ctrl+C** antes de iniciar este. `python3 -m http.server` continua servindo a interface, mas não oferece a ponte para abrir a IDE. Ao abrir o HTML direto, use **Abrir JSON** se o browser bloquear o carregamento por `file://`.

O aplicativo já seleciona a primeira etapa ao carregar o JSON. No desktop (a partir de 1000 px), os painéis fixos formam três colunas: **explicação à esquerda, linha por linha no centro e mapa com console à direita**. O mapa começa com mais largura (proporção aproximada 27/26/47, respeitando larguras mínimas). Os painéis têm a mesma altura e rolagem própria; o guia geral fica abaixo. Em telas menores, explicação, código, mapa/console e guia são empilhados nessa ordem.

**Tela cheia**, no cabeçalho, deixa visíveis somente os painéis **Explicação da etapa**, **Linha por linha** e **Runtime em movimento**, com seus controles de navegação. Cabeçalho, apresentação do fluxo, progresso e glossário geral ficam ocultos, inclusive se o glossário estiver destacado. O botão **⛶ Sair** fica na barra da explicação; **Esc** também sai desse modo. O passo, o cenário, as larguras escolhidas e as janelas destacadas continuam na mesma sessão. Ao voltar, o foco retorna ao botão de entrada e a página recupera sua rolagem. Em telas menores, os três painéis continuam empilhados com rolagem.

O modo usa a [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen) quando disponível e mantém a interface sincronizada com a saída nativa do navegador. Se o navegador não permitir a tela cheia nativa, a mesma apresentação ocupa a janela disponível e o botão de saída continua funcionando. Esse modo é preferência visual da sessão, sem novos campos no JSON.

**Cenário do percurso** fica dentro de **Runtime em movimento**, entre seu cabeçalho e os controles do mapa. O texto de apoio explica que o mapa e as explicações acompanham a escolha. As opções vêm de `scenarios` do JSON, sem fixar sucesso/vazio/erro no JavaScript. O mesmo seletor acompanha o runtime ao destacá-lo e permanece disponível na tela cheia.

Arraste a divisória lateral entre dois painéis fixos para trocar espaço entre eles, preservando a largura do terceiro. Com a divisória focada, **←/→** ajustam a largura e **Home/End** atingem seus limites. Esse ajuste não avança o código. As larguras mínimas preservam a leitura; ao mudar a viewport, as proporções se adaptam. Uma divisória fica indisponível enquanto um de seus painéis estiver destacado e volta após reencaixar. As larguras escolhidas permanecem na sessão, inclusive ao importar outro fluxo ou destacar/reencaixar painéis.

Existe uma única navegação, usada por **←/→** e pelos botões **Retroceder / Avançar**. Um avanço apresenta o próximo quadro/linha da trilha; no último, continua no primeiro quadro da etapa seguinte. Um retrocesso na primeira linha volta à última linha da etapa anterior. O percurso não reinicia sozinho ao chegar ao fim. A marca reinicia explicitamente o fluxo. Inputs e controles de configurações não disparam atalhos de navegação. Som também pode ser alternado por **M** fora desses controles.

Não existe temporizador de passagem entre etapas: cada ação corresponde a um passo, e a última linha permanece visível enquanto você lê. A posição e o ramo visitado são lembrados por etapa/cenário durante a sessão, para que retroceder restaure a trilha realmente percorrida. Trocar cenário conserva os filtros de sucesso/vazio/erro. Escolher um ramo determina o caminho; avançar continua sendo necessário para ler seu próximo passo.

A barra flutuante inicia no centro inferior com **[Retroceder] [Abrir no editor] [Avançar]**. A alça mostra somente **seis pontos em duas linhas de três**, centralizados acima dos botões, sem texto visível. Arraste por ela para qualquer posição visível, ou use **Alt + setas** com a alça focada; sua instrução continua disponível para leitores de tela. O movimento não altera o percurso; ao redimensionar a viewport, a barra permanece dentro da tela. Os três controles continuam acessíveis mesmo com os painéis destacados. No celular, o botão central mostra o ícone ↗ e mantém seu nome acessível.

Categoria do quadro (declaração, chamada, execução etc.), contador e quadradinhos de progresso ficam agrupados imediatamente acima do código. O contador usa **PASSO** porque uma expressão da mesma linha pode envolver vários quadros didáticos; a linha real está no path e na margem do código. Quadradinhos e linhas do bloco são indicadores, não atalhos para saltar no percurso. As abas/referências só consultam arquivos: **Voltar à linha atual** retoma a visualização sem perder a posição. A navegação agrupa responsabilidades didáticas: rever um quadro em outra etapa não significa que a aplicação executa a mesma instrução novamente.

**Destacar ↗** funciona na explicação, código linha por linha, runtime e guia. Arraste pela barra superior, redimensione pelo canto inferior direito e use o **X** para reencaixar. Com a barra focada, **Alt + setas** move a janela; setas sem Alt continuam percorrendo o código. **Esc** reencaixa a janela focada, sem apagar a seleção ou fechar o código. Conteúdo e controles continuam ativos; o placeholder preserva o lugar original no grid, e o mapa reajusta sua escala à largura da janela.

**Configurações**, no canto superior direito, reúne **Abrir JSON**, som e **Editor desta máquina**, além do lembrete de atalhos. Clicar fora ou pressionar **Esc** fecha o menu. Importar um novo JSON seleciona sua primeira etapa, preservando as preferências da máquina. O resultado de **Abrir no editor** aparece também junto ao código, mesmo com configurações fechadas.

## Editor escolhido em cada máquina

O navegador não pode executar a IDE diretamente; **Abrir no editor ↗** envia apenas `path`, `line` e o ID de um editor ao servidor local. A linha corresponde ao arquivo atualmente mostrado, inclusive ao consultar uma referência.

O modo **Automático** consulta `VISUAL`/`EDITOR` para launchers reconhecidos e, na ausência deles, a associação de texto do sistema: MIME no Linux, registro no Windows, LaunchServices no macOS. Nenhuma associação do sistema é alterada. Não existe um protocolo universal para selecionar linhas em qualquer editor: adaptadores locais usam a sintaxe CLI do Zed, VS Code, VSCodium, Cursor, Antigravity, Kate, KWrite, Sublime, Gedit, IntelliJ IDEA e WebStorm. Quando o editor padrão não possui adaptador/CLI, abre-se o arquivo e a interface avisa que a linha não pôde ser selecionada. A disponibilidade depende da instalação do launcher no `PATH`.

No seletor **Editor desta máquina**, cada usuário pode escolher um launcher disponível. A preferência fica no `localStorage` desse navegador e não no JSON do fluxo. Com armazenamento bloqueado, vale para a sessão atual. Para iniciar esta execução com uma preferência explícita:

```bash
# De dentro da pasta do laboratório, para quem usa Zed:
python3 serve.py --editor zed
```

`--editor auto` é o padrão do servidor; `--editor zed` não torna Zed obrigatório para outros usuários. Uma preferência já salva no navegador tem prioridade sobre a opção de inicialização. Outra porta pode ser escolhida com `--port 4174`; para reutilizar o visualizador em outro projeto, informe `--repo-root /caminho/do/projeto`.

A ponte escuta somente em `127.0.0.1`, valida Host/Origin/token por sessão e aceita somente arquivos de código existentes dentro do repositório e linhas válidas. Não aceita comandos arbitrários, arquivos ocultos nem caminhos que escapem da raiz. Comandos são executados por lista de argumentos, sem shell. Os testes da ponte usam mocks de launchers: não abrem IDEs nem modificam preferências do sistema.

JSON é dado: nenhum código recebido é executado. Trechos e explicações são renderizados com `textContent`.

O contrato continua em **`schemaVersion: "1.0"`**: esta atualização muda a apresentação e o padrão de escrita. Posições, larguras, desprendimento de painéis e preferências da máquina pertencem à interface; não crie campos de HUD no JSON do fluxo. Schema e motor continuam compatíveis com os arquivos 1.0 existentes.
