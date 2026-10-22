# Ensino concreto: termo exato, explicação simples e código real

Aplique este padrão a todos os materiais e respostas da skill. O leitor sabe alguma sintaxe, mas ainda pode confundir arquivo, classe, objeto, método, dado e ação. Não diminua a precisão para simplificar: mantenha o termo técnico e explique o que ele representa e faz no fluxo ou exemplo em estudo.

## Guia imediato para palavras e expressões

Depois do parágrafo ou bloco que introduz uma dificuldade, coloque **Guia imediato — termos e expressões**, antes de passar à próxima ação. O guia abrange nomes técnicos e frases abstratas: “comportamento da aplicação”, “produzir código”, “disponibilizar”, “carregar a definição”, “consultar estado”, “recurso” e “executar uma operação” precisam de objetos e ações identificáveis.

Para cada entrada relevante, mostre:

1. **Termo ou expressão exata** usada no texto, sem substituir o nome oficial por um apelido.
2. **Tradução prática:** quem faz o quê, com qual valor/objeto e com qual efeito verificável. Não explique um jargão por outro ainda indefinido.
3. **Ligação verificável:** símbolo literal, arquivo e linha atual clicável; quando declaração e uso diferirem, ofereça ambos.
4. **Exemplo real curto:** código copiado fielmente do projeto. Um bloco pode sustentar várias entradas próximas; identifique qual expressão corresponde a cada trecho. Omissões são explícitas. Um fragmento inline ligado a um bloco já mostrado evita repetir código, sem obrigar o leitor a procurar uma definição distante.

Quando não houver código fornecido ou repositório pertinente, use um exemplo mínimo marcado como **ilustrativo**. Explique seus valores, ações e resultado esperado; não invente links para arquivos inexistentes nem trate o exemplo como execução observada. Essa condição permite responder dúvidas avulsas sem impor um projeto.

Um glossário final pode funcionar como índice, mas não substitui os guias locais. Se o conceito voltar em outra forma do mesmo documento, como setas depois de parágrafos, repita a tradução curta e a fonte próxima; não deixe apenas a palavra técnica.

Não explique pontuação trivial. Cubra o que altera o entendimento do fluxo. Para campo, classe, objeto e método centrais, distribua entre parágrafo, guia e fonte: categoria, origem, instância que recebe a chamada, argumentos, retorno, momento da execução e próximo destinatário.

## Exemplos de explicações vagas e concretas

Os símbolos abaixo são exemplos de ensino, não valores universais. Localize os equivalentes e as linhas no projeto atual; não copie caminhos, versões ou paginação sem verificar.

### “Comportamento da aplicação” e “tipos dos valores”

**Vago:** “TypeScript descreve o comportamento da aplicação e os tipos dos valores.”

**Concreto:** “Neste arquivo, escrevemos a ação de iniciar a busca quando o catálogo abre. Também declaramos que página e quantidade devem ser números. Veja as duas partes separadas no código.”

```typescript
ngOnInit(): void {
  this.loadProducts(this.pageIndex(), this.pageSize());
}

loadProducts(page: number, size: number): void {
  // ...
}
```

**Guia imediato — termos e expressões:**

- **Comportamento da aplicação:** ação que o programa executa em uma situação. No exemplo, `ngOnInit` chama `loadProducts` quando Angular inicializa o catálogo. Linke o método real.
- **Tipos dos valores:** descrições usadas pelo TypeScript para conferir usos esperados. Em `page: number`, `number` diz que página é um número; não converte a resposta HTTP nem valida JSON. Linke a assinatura real.

### “Produzir código”

**Vago:** “O build produz o código para execução.”

**Concreto:** “A ferramenta lê os arquivos do projeto e grava arquivos JavaScript que poderão ser entregues ao navegador. O script de build mostra como pedir essa transformação; ele não é o JavaScript resultante.”

**Guia imediato — termos e expressões:**

- **Produzir código:** gerar arquivos de saída a partir dos arquivos de entrada. Linke o comando configurado e a entrada do build, com um trecho real. Só mostre nomes/conteúdo de arquivos emitidos se tiverem sido inspecionados; não execute um build caro só para ilustrar uma frase.

### Configuração e acesso aos produtos

**Vago:** “`config.js` disponibiliza informações para acessar serviços.”

**Concreto:** “`config.js` deixa disponível `apiBaseUrl`. Mais adiante, `ProductService` junta esse endereço a `/api/products` para enviar o pedido da lista. Sem um destino adequado, o navegador pode pedir os produtos ao endereço errado.”

**Guia imediato — termos e expressões:**

- **Disponibilizar configuração:** colocar um valor onde o próximo trecho consegue obtê-lo. Linke a leitura da configuração e seu uso no endereço do GET, sem expor destinos/chaves reais.
- **API:** ponto de comunicação com o programa do servidor. A tela pede a lista e recebe produtos; o acesso interno ao banco permanece uma fronteira, salvo se foi investigado nesse fluxo.

### “Consultar estado” e Signal

**Vago:** “O template consulta o estado local e reage.”

**Concreto:** “O catálogo guarda a lista em `products`. Quando Angular avalia `products()` no template, obtém essa lista e cria uma apresentação para cada item. Quando o callback usa `products.set(res.content)`, troca a lista guardada pelos produtos recebidos.”

```typescript
readonly products = signal<PublicProduct[]>([]);
// ...
this.products.set(res.content);
```

**Guia imediato — termos e expressões:**

- **Estado local:** valores guardados naquela instância, como a lista de produtos, a mensagem de erro e o indicador de carregamento. Linke os campos concretos.
- **Signal:** valor que o Angular acompanha. `products()` devolve a lista guardada e `products.set(res.content)` a substitui pelos produtos recebidos, notificando o Angular da mudança. Signal não busca produtos nem é um Observable. Linke declaração, escrita e leitura.
- **Consultar:** aqui, executar `products()` para obter o valor, não buscar no banco ou fazer outra chamada HTTP. Mostre o laço real do template.

### Observable, assinatura e retorno

**Vago:** “O service retorna um Observable e o componente se inscreve.”

**Concreto:** “O service prepara um GET e devolve o objeto Observable. No catálogo, `subscribe` é chamado nesse objeto para registrar as funções de sucesso/erro e ativar este pedido. O retorno imediato ainda não é a lista; a lista chega depois no callback do HTTP real.”

**Guia imediato — termos e expressões:**

- **Observable:** objeto que permite acompanhar valores, erro e conclusão. Neste HTTP frio, chamar `get` prepara a operação e **subscribe** a ativa e registra quem receberá o resultado. Isso não significa que todo Observable faça rede, emita só uma vez ou seja assíncrono.
- **Subscription:** objeto devolvido por `subscribe` que permite encerrar o acompanhamento com `unsubscribe()`. Não confunda esse retorno imediato com os dados da resposta.
- **Callback:** função entregue para ser chamada quando houver uma notificação. Registrar essa função não executa seu corpo imediatamente.

## Nomes e ordem de execução sem ambiguidade

Em `this.productService.getPublicProducts(page, size)`:

- `this` é a instância atual do catálogo; o campo `productService` guarda outra instância, não um arquivo.
- `ProductService` é a classe; `getPublicProducts` é um método. Indique suas declarações atuais.
- `page` e `size` são argumentos, por exemplo `0` e `12` somente quando o projeto confirmar esses valores.
- A execução entra no método do service, obtém seu retorno e volta ao catálogo; só então chama `subscribe` no retorno. Explique ida e volta e o próximo alvo.

Explique construção de dependências apenas quando ela participa da transição. Não execute mentalmente os outros métodos de uma classe só porque foram declarados. Mostre separadamente registro, chamada, retorno, espera, callback, condição, trabalho paralelo e evento futuro. Templates são avaliados pelo Angular; suas linhas não formam uma pilha JavaScript comum.

## Bibliotecas e código executável

Informe pacote, versão instalada, declaração da dependência e localização resolvida quando isso explicar um mecanismo central. A instalação pode estar na raiz de um workspace; não invente qual comando histórico foi executado.

Ao explicar `subscribe`, verifique a implementação instalada. Em RxJS 7.8.2, `Observable.ts:67` pode ser uma declaração de sobrecarga e o corpo começar em `:204`; reconfira. Mostre a ligação com JavaScript distribuído, sem afirmar que TypeScript ou `.d.ts` roda no navegador ou que um bundle específico foi observado sem inspeção.

Análise estática explica o caminho sustentado pelo código; só logs/debugger permitem afirmar uma ordem observada de uma execução particular.

## Aplicação nos diferentes formatos

- **Dúvida avulsa:** mesmo padrão de tradução prática, exemplo curto e guia imediato; sem exigir fluxo, documento ou código local. Uma pergunta simples pede uma resposta proporcional, não um documento inteiro.
- **Profundo/enxuto/direto:** guia imediatamente abaixo do parágrafo ou bloco, com fontes e trechos curtos. A profundidade muda; a clareza prática permanece.
- **Diálogo socrático:** cada fala tem até três frases. Toda menção a código ou mecanismo aplicado recebe o trecho imediatamente abaixo, antes da próxima fala, conforme [socratic-dialogue.md](socratic-dialogue.md). Em exemplos ilustrativos sem repositório, a árvore de pastas vem logo após cada bloco de código; o guia imediato vem em seguida. Isso também vale para hipóteses e resumo final. Preserve o termo exato, traduza as expressões abstratas e ligue cada ação aos valores e símbolos visíveis.
- **Prática:** comentários válidos no código e guia imediato na explicação do incremento; mapa de símbolos no plano. Não introduza comentários em strings, JSON puro ou tags abertas.
- **Entrevista:** enunciados claros; guia opcional logo abaixo, sem gabarito completo por padrão. Uma pergunta sobre um termo pode usar apoio recolhido, para o aprendiz tentar responder primeiro.
- **Anki:** um alvo por card, pergunta clara e resposta principal curta. O guia imediato e o trecho/fonte ficam logo abaixo da resposta em `Back` (Basic) ou `Extra` (Cloze), sem entregar o gabarito na frente ou no título. Diferencie fundamento geral, exemplo ilustrativo e aplicação verificada no projeto/material; mantenha cada card compreensível fora da ordem do documento.
- **JSON:** mantenha a mesma explicação prática em resumos, quadros, variantes e escolhas: ação, por que precisa acontecer, valores/símbolos e próximo uso. Use `terms.definition`, `terms.usage`, `sourceId`/`line`, `step.termIds` e `frame.termIds` para o guia imediatamente depois da explicação atual. Snapshots mostram o código real; termos e expressões vagas precisam de tradução simples e uso concreto. Não invente campos nem use Markdown esperando que o visualizador o interprete. A clareza e a causalidade são revisadas além da validação estrutural.

## Pergunta de revisão didática

Ao terminar um parágrafo, pergunte internamente: “O aprendiz consegue apontar no arquivo ou exemplo qual objeto, valor e ação correspondem a cada frase que escrevi?” Se não, substitua a frase vaga por uma ação concreta e acrescente a ligação de código no guia próximo.
