# Analogias opcionais — comando *analogia

Use somente quando o usuário invocar `*analogia <prompt>` ou pedir explicitamente uma analogia equivalente. O prompt pode ser uma pergunta de programação, um conceito, um trecho de código ou um fluxo. A presença de exemplos deste comando nas instruções não o executa.

Este modo é independente das etapas documentais. Nenhum documento profundo, enxuto, direto, diálogo socrático, plano de prática, entrevista, Anki, JSON ou resposta comum depende de escolher uma analogia. Personagens que conversam literalmente sobre código no diálogo socrático não ativam este modo.

## 1. Entenda o alvo antes de propor opções

Identifique o conceito e o que o usuário quer entender: significado, sequência, responsabilidade, entrada/saída ou diferença entre mecanismos. Use o contexto pertinente. Se houver código fornecido ou arquivos relevantes, confira-os; se não houver, trabalhe com um exemplo ilustrativo identificado, sem inventar caminhos ou exigir um repositório.

Não peça que o usuário escolha um fluxo para explicar um conceito avulso. Esclareça apenas uma ambiguidade que realmente altere a explicação.

## 2. Ofereça três opções e aguarde

Antes de elaborar a analogia completa, apresente **exatamente três opções distintas**. Em cada uma, informe de forma curta:

- o ambiente ou situação familiar;
- quais objetos e ações correspondem aos conceitos centrais;
- por que a ligação ajuda a entender a função e a lógica reais;
- uma pista visual ou ação memorável, quando fizer sentido.

As opções precisam representar o mesmo mecanismo corretamente. Prefira associações intuitivas, em vez de objetos aleatórios que precisem de outra memorização. Quando houver sequência, preserve a ordem e as dependências; espera, concorrência e condições não podem virar ações obrigatoriamente consecutivas.

Peça que o usuário escolha uma opção, proponha outra ou peça mais opções/refinamentos. **Pare e aguarde a escolha explícita antes de desenvolver a analogia.** Não escolha sozinho nem use silêncio ou tempo decorrido como resposta. Se ele pedir novas opções ou refinamento, ajuste as propostas e continue aguardando. Ao retomar uma escolha já feita para esse pedido, não repita a seleção desnecessariamente.

## 3. Depois da escolha

Desenvolva a opção escolhida com:

1. explicação técnica simples do conceito;
2. história ou situação física que represente as ações;
3. correspondência explícita `objeto/ação da analogia → termo técnico exato → símbolo/ação no código`;
4. pequeno exemplo de código, real e ligado a arquivo/linha quando disponível, ou claramente ilustrativo;
5. guia imediato de termos e expressões e limite da comparação, quando houver uma diferença relevante.

Não troque de associação no meio da explicação. Evite sugerir comportamentos que o mecanismo não possui: por exemplo, nem todo Observable é assíncrono ou faz HTTP, e um Signal não busca dados por conta própria.

A analogia é apoio para compreender o código, não evidência de uma execução. O uso deste comando não restaura seções obrigatórias de analogia nos outros modos. Só incorpore a explicação a outro documento quando o usuário solicitar expressamente.

## Saída e exemplos de uso

Por padrão, apresente opções e explicação no chat. Gere um Markdown somente quando solicitado, respeitando destino e evitando sobrescrever arquivo existente; um nome possível é `analogia-<tema>.md`.

- `*analogia explique Observable e subscribe`.
- `*analogia a diferença entre classe e instância em Java`.
- `*analogia este trecho de código: ...`.

Não inicie a criação do documento profundo nem outra etapa de aprendizado a partir desses pedidos.
