# Etapa 1 — padrão do documento profundo

Use esta estrutura para o documento profundo. Ele é a fonte técnica canônica da etapa 2; o enxuto carrega o contexto necessário para a etapa 3. Adapte os títulos à tecnologia, preservando as informações exigidas.

Escreva todo o material autoral em português brasileiro: títulos, explicações, rótulos Mermaid, tabelas, legendas, listas de verificação e notas. Preserve código, identificadores, caminhos, comandos, nomes de APIs/bibliotecas e termos técnicos oficiais, acompanhados de explicação prática.

## 1. Abertura e escopo

Comece com:

- `# Fluxo NN — <gatilho> até <resultado observável>`;
- slug descritivo estável, reutilizado nos nomes dos documentos e da pasta de prática;
- objetivo e leitor esperado;
- link para o índice final `Guia de termos deste fluxo`, sem substituir os guias imediatos;
- revisão/data do repositório e versões relevantes;
- cenário exato do caminho de sucesso;
- exclusões explícitas;
- indicação de que análise estática não é um registro de execução real.

Diferencie, quando relevantes: preparação/registro, execução síncrona, continuação assíncrona, ramo paralelo e evento futuro declarado mas não executado no cenário.

## 2. Percurso causal sequencial

Numere as etapas críticas pela ordem causal. Cada etapa normalmente contém:

1. **Título da transição.**
2. **Localização:** link absoluto clicável com linha original.
3. **Trecho principal fiel ao código.**
4. **Explicação da execução:** quem executa, quando, entradas, saída, mudança de valores e próxima chamada.
5. **Explicação do mecanismo:** categoria e significado dos símbolos, quem recebe a chamada, campo/classe/método, argumentos, retorno, declaração atual e ordem de ida/volta. Em linhas com várias ações, detalhe a sequência e separe ação imediata de callback posterior.
6. **Guia imediato — termos e expressões:** tradução prática inclusive de frases abstratas, com ação concreta, símbolo e linha real. Aplique `didactic-grounding.md`.
7. **Por que existe aqui:** necessidade ou escolha de organização e problema concreto resolvido.
8. **Se faltar ou estiver errado:** consequência observável.
9. **O que prepara:** próxima etapa causal.

Entre temporariamente na construção de dependências quando isso for necessário e retorne claramente ao chamador. Não apresente todos os métodos de uma classe como executados só porque existem.

## 3. Comportamento não linear

Após o caminho de sucesso, cubra apenas ramos ligados ao fluxo escolhido:

- trabalho paralelo iniciado pelo mesmo componente ou processo;
- sucesso, vazio, validação, autorização, nova tentativa e falha;
- reentrada por eventos do usuário, agendamentos, paginação, mensagens ou callbacks;
- limitações de concorrência, cancelamento, cache, transação, limpeza ou ordenação realmente visíveis no código.

Diga quando a ordem não é determinada e explique as chamadas e os efeitos reais de cada ramo.

## 4. Apoios para reconstrução

Inclua:

- diagrama causal Mermaid;
- `Guia de termos deste fluxo` como índice compacto para os guias locais: termo, categoria, tradução prática, papel e origem/linha;
- confusões frequentes e armadilhas de reconstrução;
- lista curta de recordação ativa que peça o caminho técnico sem consulta;
- referências oficiais dos mecanismos;
- limites de verificação e comandos não executados.

## 5. Apêndice completo comentado

A última seção deve ser `## Apêndice — fontes completas comentadas`.

Inclua o conteúdo integral de cada classe, módulo de funções, template e contrato pertencente à aplicação que participe diretamente do fluxo. Acrescente apoio somente quando seu corpo for necessário para reconstruir uma transição executada.

Não inclua CSS, salvo quando a lógica de estilo for o próprio fluxo; dependências, bibliotecas inteiras, arquivos gerados ou saída de build; componentes importados alheios ao caminho; arquivos com segredos ou valores sensíveis. Explique omissões necessárias e só use marcadores seguros quando indispensáveis, sem apresentá-los como fonte original.

Para cada arquivo:

1. título e link para a linha 1;
2. todas as linhas originais, declarações, corpos e ordem dos métodos preservados;
3. comentários didáticos imediatamente antes da unidade sintática pertinente;
4. marcadores com a linha original, como `DOC-FLOW | L42`;
5. métodos e ramos não executados marcados como fora do cenário;
6. nenhum comentário em tag HTML aberta, lista de argumentos, string ou outro lugar que invalide o trecho;
7. aviso de que os comentários são documentação e não devem ser copiados automaticamente para a aplicação.

Links apontam para as linhas originais do repositório, não as linhas deslocadas pelo apêndice. Para método de biblioteca central, mostre um trecho verificado, pacote/versão e relação do TypeScript com o JavaScript distribuído no percurso ou guia; não copie a dependência inteira para o apêndice.

## Verificação do profundo

O apêndice deve cobrir os fontes prometidos. Removendo somente os comentários didáticos acrescentados, cada cópia não sensível deve coincidir com o arquivo original, byte a byte, exceto pela quebra de linha final.

Confira slug, números únicos, gatilho, resultado, limites e evidências suficientes para retomar em outro chat. Confira guias próximos de termos e expressões e ligações entre as explicações e o código real.

A profundidade é ampla dentro do fluxo escolhido. Expanda mecanismos e dependências realmente executados; quando outro subsistema começar, identifique a fronteira e trate-o como possível fluxo futuro, sem ampliar o escopo atual.
