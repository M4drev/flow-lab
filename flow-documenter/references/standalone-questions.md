# Dúvidas de programação — do fluxo ou avulsas

Use para `*duvida <pergunta>`, alias `*fluxo-duvida`, e para perguntas de programação em linguagem natural, sem exigir comando. A pergunta pode não ter relação com nenhum fluxo. Aplique `didactic-grounding.md` com o mesmo cuidado dos documentos.

## Responda à pergunta, sem impor uma etapa

Não exija fluxo, repositório, documento profundo/enxuto, plano ou seleção de analogia para explicar um conceito. Use o contexto anterior somente se ele ajudar a responder à pergunta real. Não associe uma dúvida independente ao último fluxo só porque ele está na conversa.

Se linguagem, versão ou contexto mudarem materialmente a resposta, use o que o usuário informou ou esclareça a ambiguidade. Quando não houver essa dependência, escolha um exemplo simples e declare a linguagem usada. Uma dúvida conceitual não autoriza implementar uma funcionalidade nem iniciar a prática incremental.

## Estrutura proporcional da explicação

1. Responda diretamente o que é ou o que acontece, em uma explicação simples.
2. Mostre para que serve no caso concreto, por que funciona assim e a consequência relevante de alterar/remover a construção.
3. Use um trecho pequeno. Se vier do projeto, confira o conteúdo e linke arquivo/linha; se não houver fonte fornecida, identifique-o como **exemplo ilustrativo**, sem inventar arquivo, linha ou resultado de execução observado.
4. Coloque **Guia imediato — termos e expressões** logo após o parágrafo ou bloco que os introduz. Explique o termo técnico exato e também frases abstratas por meio dos valores e ações do exemplo.
5. Quando a ordem importar, mostre chamada, argumentos, retorno, espera ou mudança de valores em sequência curta. Use setas somente se ajudarem.

Mantenha resposta curta para pergunta simples e aprofunde o necessário em pergunta complexa. Não imponha o formato completo de um documento de fluxo, apêndice, entrevista ou lista de exercícios. Nenhuma analogia é introduzida automaticamente; esse apoio pertence ao pedido explícito `*analogia`.

## Exemplo de explicação literal

Pergunta: “Por que total vale 6 neste trecho Java?”

**Exemplo ilustrativo em Java:**

```java
int quantidade = 2;
int total = quantidade * 3;
```

A primeira linha guarda 2 em quantidade. A segunda lê esse 2, multiplica por 3 e guarda o resultado 6 em total. O trecho não imprime o valor na tela.

**Guia imediato — termos e expressões:**

- **int / tipo:** informa ao Java que o valor é um número inteiro.
- **Variável:** nome usado para guardar e depois ler um valor; quantidade guarda 2 e total passa a guardar 6.
- **Ler o valor:** usar o número atualmente guardado em quantidade no cálculo `quantidade * 3`.
- **Atribuição:** guardar o resultado no nome à esquerda de `=`; aqui, guardar 6 em total.

O exemplo mostra como ligar palavras e expressões ao código sem exigir metáforas ou um projeto real. Para outras perguntas, adapte o conteúdo; não repita este exemplo sem pertinência.

## Evidências e histórico

Em perguntas sobre o código local, leia somente os arquivos necessários e confira os símbolos e versões relevantes. Para mecanismos de linguagem/biblioteca em que houver incerteza, consulte fontes oficiais. Diferencie o que o código demonstra, o resultado esperado e o que foi observado em execução.

Com repositório ou destino local autorizado, registre a dúvida explícita no histórico conforme a entrada da skill. Use a seção `Dúvidas avulsas de programação` quando ela não pertencer a um fluxo. Sem esse contexto, responda normalmente, sem criar histórico em pasta arbitrária nem bloquear a explicação por falta de projeto.
