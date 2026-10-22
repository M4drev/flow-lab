# Narrativa causal direta — parágrafos e setas

Use para `*fluxo-direto`, alias `*quick-direct`, ou pedido equivalente. Gere um único novo Markdown `flow-<slug>-direto.md` perto dos documentos de origem, salvo destino indicado. Se o usuário pedir apenas uma demonstração no chat, apresente ali sem criar documento. Este formato ensina o mesmo fluxo; não inicia prática nem gera automaticamente questões ou JSON.

## Base e limites

Leia o enxuto correspondente por completo e verifique as fontes necessárias. Na ausência do enxuto, leia o profundo completo. Preserve gatilho, resultado, cenário, exclusões, números e relações técnicas. Se não houver base canônica ou houver divergência material com o código, informe o pré-requisito em vez de inventar um novo caminho.

Este modo comprime a apresentação, não elimina a explicação que permite entender. Uma lista de tecnologias com nomes abstratos não é uma narrativa direta. Não force um limite de palavras que retire traduções necessárias.

## Estrutura do único documento

1. Título em português brasileiro, slug, origem e objetivo em poucas linhas; gatilho → resultado e cenário explícitos.
2. `## Fluxo em parágrafos`: etapas com o mesmo número canônico, parágrafo causal, guia imediato e trecho real.
3. `## Fluxo em setas`: o mesmo caminho e os mesmos números, com papel, motivo e o que fica possível depois, mais guia imediato abaixo de cada bloco.
4. Limites/ramificações essenciais, evidências e validação curta. Linke o histórico existente. Não acrescente apêndice completo, diagrama Mermaid, entrevista ou lista de exercícios automaticamente.

O build anterior ao gatilho pode aparecer como **Preparação anterior**, sem renumerar as etapas canônicas nem sugerir que cada visita do usuário executa um build.

## Cada etapa em parágrafo

O parágrafo deve explicar naturalmente: **quem faz o quê → por que aqui → o que prepara → consequência concreta da ausência/erro**. Nomeie o **papel da etapa no fluxo**, como preparação do código, registro, escolha da página, envio do pedido ou apresentação.

Diferencie um pré-requisito técnico de uma escolha de organização: sem assinatura este HTTP frio não sai; concentrar o pedido em um service é a organização escolhida, não uma lei que proíbe HTTP em componente.

Logo abaixo, apresente **Guia imediato — termos e expressões**. Inclua frases abstratas além de nomes técnicos. Cada entrada combina significado concreto, símbolo real e link clicável com linha; para conceitos densos, explique a ação e os valores concretos envolvidos. Adicione um bloco de código mínimo e fiel que sustente as entradas; mais de um bloco é adequado quando uma distinção exige fontes diferentes. Se editar o trecho, indique omissões.

Formato de referência:

> **Etapa N — ação que permite a próxima.** Parágrafo curto com papel, motivo e consequência.
>
> **Guia imediato — termos e expressões:**
> - **Expressão usada:** tradução concreta → símbolo literal → link atual. O trecho abaixo mostra a ação correspondente.
>
> Trecho real reduzido, com linguagem e origem identificadas.

Não deixe expressões como “comportamento”, “estado”, “preparar”, “produzir” ou “definição” sem especificar a ação, o valor ou o arquivo a que se referem. Use os exemplos de `didactic-grounding.md` como referência de clareza.

## Cada bloco da forma em setas

Use setas entre os blocos, com esta informação explícita:

`Etapa N — trecho do fluxo [papel: ... | por quê: ação/necessidade concreta | permite depois: ...]`

Logo abaixo, mantenha um **Guia imediato** pequeno: termo/expressão → tradução concreta → símbolo e fonte. Pode reutilizar um bloco de código da primeira forma por âncora, mas inclua também o arquivo/linha e um fragmento literal relevante. Não use apenas um glossário final ou um link genérico para o documento inteiro. Se aparecer um conceito que ainda não tem exemplo, acrescente o trecho real naquele ponto.

A forma com setas precisa poder ser estudada sem reler todos os parágrafos. É aceitável repetir uma definição curta. Não repita blocos completos quando uma expressão literal e o link já resolvem.

## Precisão da sequência

O template pode mostrar carregamento antes da resposta; callbacks de HTTP real acontecem depois; sessão/carrinho podem ocorrer em paralelo. As setas mostram dependências do caminho escolhido, não uma fila universal de todas as ações.

## Validação e entrega

Confira as duas formas contra a mesma base: etapas e ordem iguais; papéis concretos; guias locais cobrindo expressões difíceis; código fiel e links/linhas válidos; cercas balanceadas; nenhum efeito de servidor inventado. Não alegue execução real se só leu arquivos.

Entregue o caminho do Markdown e o resultado da validação. Se o usuário também pedir a explicação no chat, apresente as duas formas com seus guias, ajustando o tamanho ao pedido. Não reduza a resposta a um anúncio de que o modo existe quando o usuário pediu o material.
