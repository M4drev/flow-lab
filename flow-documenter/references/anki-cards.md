# Anki — conceitos e aplicações em cards

Leia esta referência ao receber `*anki [quantidade] [tema ou fonte]` ou um pedido equivalente. Gere **um documento `.md` com 20 cards por padrão**. A quantidade, os tipos e o destino explicitamente pedidos prevalecem. Este modo funciona com um fluxo, conceitos gerais, material fornecido ou repositório; não exige criar profundo, enxuto ou prática antes.

## Escolha da base

- **Fluxo:** use o fluxo indicado ou o atual, quando inequívoco. Leia o documento correspondente, se houver, e confira os trechos participantes no código atual. Sem documento prévio, investigue o caminho necessário para os cards sem iniciar outra etapa documental.
- **Repositório:** confira instruções locais, tecnologias e arquivos relevantes ao foco. Um pedido sobre o repositório inteiro pode combinar fundamentos e usos em partes diferentes; não obrigue o usuário a escolher um único fluxo. Declare o recorte realmente examinado, sem alegar que leu todo o projeto.
- **Material:** leia o conteúdo indicado, incluindo a parte solicitada de arquivos ou páginas. Cite arquivo e seção/página ou link da fonte. Se a fonte essencial estiver inacessível, peça o conteúdo ou acesso necessário; não invente o que ela diz.
- **Conceitos gerais:** explique o tema diretamente. Use exemplos mínimos identificados como ilustrativos e documentação oficial para mecanismos que precisem de confirmação. Não exija um projeto nem atribua os exemplos ao último repositório da conversa.

Se faltar tema e não houver contexto que o determine, pergunte sobre o que serão os cards. Nos outros casos, prossiga sem uma seleção de etapa. Leia o histórico existente apenas para selecionar dificuldades relevantes; pedir cards não é, por si, uma dúvida a registrar.

## Conteúdo e didática

Cubra **fundamentos e aplicação**, sem presumir que o aprendiz já sabe os termos usados pela fonte. Inclua pré-requisitos úteis mesmo quando não aparecem escritos nela: classe, objeto, método, argumento e retorno podem explicar uma chamada; Observable, `subscribe`, callback e Signal podem explicar um fluxo Angular. Escolha os conceitos pertinentes ao pedido, sem impor Angular ou Java a outros temas.

Identifique cada card como **Fundamento geral** ou **Aplicação em <projeto/fluxo/material>**. Um fundamento acrescentado por necessidade didática não passa a ser uma afirmação da fonte. Não diga que uma tecnologia é usada no projeto sem evidência. Sempre que houver uso real relevante, conecte o conceito ao símbolo e ao trecho verificado: o que é um Signal pode ser um alvo; como `products.set(...)` muda os produtos da tela pode ser outro, com pergunta própria.

Cada card testa **um alvo principal**, com pergunta específica e resposta verificável. Evite “explique tudo sobre X”, listas extensas e várias perguntas independentes na mesma frente. Distribua definição, finalidade, leitura de código, argumentos/retorno, ordem das ações, causa e efeito e distinções que realmente ajudem naquele tema. Não repita a mesma pergunta nos dois formatos apenas para atingir a quantidade.

Preserve [o padrão didático compartilhado](didactic-grounding.md): termo técnico exato, explicação simples do que acontece, valores/ações concretos e fonte verificável. **A resposta principal vem primeiro e é curta; o guia imediato vem logo abaixo, no verso.** Acrescente somente o trecho curto necessário para demonstrar a resposta. Frases vagas, como “consulta o estado” ou “produz código”, também precisam dessa tradução prática. Não transforme cada verso em um capítulo.

**Proteja a tentativa de responder:** não coloque o gabarito em título, classificação, dica ou glossário mostrado na frente. Os guias, exemplos explicativos e fontes ficam em `Back` ou `Extra`. Na frente, forneça somente o contexto e o código necessários para resolver a pergunta. Por exemplo, ao perguntar o que é Observable, sua definição fica no verso. Analogias continuam exclusivas de `*analogia` ou pedido explícito equivalente.

## Tipos e quantidade real no Anki

A proporção padrão desta skill é **10 Basic + 10 Cloze**. Para outra quantidade, divida entre ambos, com um Basic a mais se o total for ímpar; para um único card, use Basic, salvo outro pedido. Respeite uma proporção ou tipo único solicitado. Essa distribuição é uma escolha didática da skill, não uma regra do aplicativo.

No Anki, **nota** é o conjunto de campos preenchidos; **card** é a pergunta e sua resposta que serão revisadas. Uma nota pode gerar mais de um card. Para que a contagem do documento corresponda ao total solicitado, adote **uma nota que gera um card por entrada numerada**:

- **Basic:** pergunta em `Front` e resposta em `Back`. Use o tipo simples, sem reversão automática. [Tipos de nota do Anki](https://docs.ankiweb.net/manual/getting-started#note-types).
- **Cloze:** frase no campo `Text`, com `{{c1::resposta}}`; explicação no campo `Extra`, exibido no verso. Uma dica opcional usa `{{c1::resposta::dica}}`. [Lacunas e campo Extra](https://docs.ankiweb.net/manual/editing#cloze-deletion).

Em cada nota Cloze independente, recomece em **`c1`**: o número da lacuna não é o número do card no documento. Use uma lacuna principal por nota. Repetir `c1` na mesma nota esconde os trechos juntos e continua gerando um card; combinar `c1` e `c2` gera dois. Evite essa multiplicação no padrão de uma entrada por card. Confira o total efetivo se o usuário solicitar várias lacunas independentes ou reversão. [Contagem de lacunas](https://docs.ankiweb.net/manual/editing#cloze-deletion).

Escolha uma palavra, símbolo ou relação significativa para ocultar; a frase deve admitir uma resposta clara. Não oculte um parágrafo inteiro nem deixe outra parte visível entregar a resposta. Uma dica ajuda a delimitar a categoria esperada, sem dar a solução. Não use sublinhados, `[...]` isolado ou a sintaxe de outro aplicativo no lugar de `{{c1::...}}`.

## Documento de saída

Use `anki-<slug>.md` na raiz do repositório pertinente ou na pasta de trabalho autorizada para um tema geral, salvo destino indicado. Não sobrescreva um arquivo existente silenciosamente. O documento começa com tema, base consultada, recorte e contagem total por tipo. A quantidade padrão vale para **o documento inteiro**, não 20 cards de cada tipo.

Explique brevemente como copiar os campos: escolher `Basic` e preencher `Front`/`Back`, ou escolher `Cloze` e preencher `Text`/`Extra`. Os nomes podem aparecer traduzidos ou personalizados no Anki do usuário; preserve o mapeamento de cada conteúdo. Classificação e numeração organizam o Markdown, sem criar campos personalizados obrigatórios.

O `.md` é o documento de estudo solicitado, com os conteúdos separados para copiar aos campos. Não prometa importação nativa desse layout: o importador de texto do Anki recebe campos delimitados, como TSV/CSV, em UTF-8. Só gere uma exportação adicional se ela for solicitada, seguindo o formato oficial; não substitua o Markdown por outro arquivo. [Importação de arquivos de texto](https://docs.ankiweb.net/manual/importing/text-files).

Numere todas as entradas em sequência e identifique o tipo. Nas Basic, mantenha guia, exemplo e fonte dentro do conteúdo do verso. Nas Cloze, mantenha o texto com as chaves literais, de preferência em bloco `text` para facilitar a cópia sem alterar a sintaxe, e coloque o guia e a fonte em `Extra`. Se sugerir tags, elas são etiquetas opcionais da nota, fora dos campos de pergunta/resposta.

### Exemplo Basic — fundamento geral, código ilustrativo

Este exemplo demonstra a forma de um card, não código de um repositório inspecionado. Ao gerar aplicações reais, substitua-o pelo código verificado e acrescente o link clicável do arquivo e linha; em materiais, cite a seção/página ou URL correspondente.

#### Card 01 — Basic

**Classificação:** Fundamento geral — argumentos.

**Frente (Front):** Na chamada `dobrar(3)`, qual valor é enviado para o método?

**Verso (Back):** `3`. Esse é o argumento: o valor que a chamada entrega ao método.

**Guia imediato — termos e expressões:** **Classe** é uma declaração que agrupa dados e métodos; aqui, `Calculadora`. **Método** é um trecho nomeado da classe que pode ser chamado para executar uma ação; aqui, `dobrar`. **Argumento** é o valor enviado na chamada, `3`. **Parâmetro** é o nome que recebe esse valor ao entrar no método, `valor`.

**Exemplo ilustrativo em Java:**

```java
class Calculadora {
    static int dobrar(int valor) {
        return valor * 2;
    }

    static int calcular() {
        return dobrar(3);
    }
}
```

Na chamada mostrada, `valor` recebe `3`. O resultado esperado de `dobrar(3)` é `6`; isso explica o código, sem afirmar execução observada.

### Exemplo Cloze — fundamento geral, código ilustrativo

#### Card 02 — Cloze

**Classificação:** Fundamento geral — retorno.

**Texto (Text):**

```text
Em um método Java com resultado numérico, a instrução {{c1::return}} devolve o resultado ao trecho chamador e encerra essa execução do método.
```

**Complemento do verso (Extra):** `return` devolve o resultado e encerra a execução atual do método. Isso não encerra a aplicação inteira.

**Guia imediato — termos e expressões:** **Retorno** é o valor que o trecho chamador recebe ao terminar a chamada. No exemplo ilustrativo abaixo, a chamada `dobrar(3)` devolve `6`, pois `valor * 2` calcula `3 * 2`. **Método** é um trecho nomeado da classe que pode ser chamado para executar uma ação; aqui, `dobrar`. **Classe** é a declaração que agrupa esses métodos e possíveis dados, aqui `Calculadora`.

**Exemplo ilustrativo em Java:**

```java
class Calculadora {
    static int dobrar(int valor) {
        return valor * 2;
    }
}
```

Os dois exemplos são modelos de estrutura; não os inclua em toda geração nem os conte como cards extras. Cada card produzido deve fazer sentido sozinho, porque o Anki pode apresentá-los fora da ordem do documento.

## Revisão e entrega

- Confira a quantidade pedida, a soma por tipo e quantos cards cada nota realmente gera; no padrão são 20 entradas, com 10 Basic e 10 Cloze.
- Confira `Front`/`Back` ou `Text`/`Extra` preenchidos, chaves balanceadas, resposta não vazia e `c1` por nota no padrão. Verifique que título e frente não revelam o alvo e que a lacuna não aceita várias respostas igualmente plausíveis.
- Revise precisão, independência dos enunciados, variedade sem duplicação e presença de fundamentos úteis. Complete a quantidade com pré-requisitos pertinentes, sem inventar fatos da fonte nem acrescentar assuntos desconexos.
- Confira explicações práticas próximas da resposta, trechos, links locais e linhas atuais. Separe aplicação comprovada, fundamento geral, exemplo ilustrativo e inferência. Preserve a concisão de cada card.
- Entregue o link do `.md`, a contagem por tipo e o escopo. Não afirme ter importado os cards ou testado a revisão no Anki sem ter feito isso.

As fontes oficiais acima fundamentam os tipos, campos, lacunas e importação. Consulte-as novamente quando surgirem dúvidas sobre versões ou outro formato; não crie um suposto padrão Markdown oficial do Anki.
