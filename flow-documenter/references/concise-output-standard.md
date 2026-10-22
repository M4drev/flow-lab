# Etapa 2 — padrão do documento enxuto

Leia o profundo correspondente por completo. O enxuto é sua compressão fiel, não uma análise independente. Preserve slug, gatilho, resultado, limites, exclusões, relações causais e números. Confira links contra os fontes atuais; se houver divergência material, informe que o profundo precisa de atualização em vez de redefinir o fluxo silenciosamente.

Todo o material autoral deve estar em português brasileiro. Preserve código, identificadores, caminhos, comandos e nomes oficiais, explicando termos e expressões difíceis pelo padrão `didactic-grounding.md`.

## 1. Abertura

Comece com:

- `# Fluxo NN — <gatilho> até <resultado> (enxuto)`;
- objetivo em uma frase;
- versões relevantes;
- indicação de trechos reduzidos e links para o código exato;
- link para o índice final `Guia de termos deste fluxo`, sem substituir os guias locais;
- resposta de entrevista em um parágrafo curto;
- sequência principal em texto, como `entrada → rota → componente → service → pedido → valores guardados → interface`;
- cenário e exclusões explícitos.

## 2. Etapas causais essenciais

Use as etapas necessárias ao entendimento, preservando correspondência com o profundo. Não altere a quantidade para atender a um intervalo arbitrário.

Cada etapa contém:

1. título que descreve a transição;
2. bloco pequeno com linhas essenciais;
3. explicação direta de quem executa, o que recebe/devolve, por que existe e o que vem depois;
4. **Guia imediato — termos e expressões**, logo após o parágrafo ou bloco que os usa, incluindo frases abstratas; tradução prática, ação concreta, símbolo e arquivo/linha;
5. consequência de ausência/erro quando útil;
6. **Linhas-chave**, com links absolutos clicáveis.

Explique instância que recebe a chamada, campo/método, argumentos, retorno e declaração atual. Em expressões com várias ações, siga a ordem real, sem esconder o mecanismo em “chama o service” ou “assina o Observable”. Bibliotecas centrais recebem explicação curta e link para a implementação instalada verificada.

Diferencie classe/instância, registro/execução, obtenção de dependência/chamada de método, carregamento de código/dados, declaração/evento, preparação do pedido/callback da resposta e tipo/validação real. Identifique omissões com reticências ou “trecho reduzido”; não apresente pseudocódigo como fonte literal.

## 3. Ramos relevantes

Mencione inicialização paralela em uma seção curta quando isso evitar uma dependência falsa. Explique erro, vazio, nova tentativa, paginação e autorização somente quando relevantes ao fluxo. Não copie classes alheias para provar que existem.

## 4. Apoios para entrevista

Termine com:

- diagrama causal Mermaid compacto;
- índice `Guia de termos deste fluxo`: termo, categoria, definição prática, uso e origem/linha, remetendo aos guias locais;
- de 3 a 7 distinções ou armadilhas úteis;
- explicação pronta de aproximadamente 45–90 segundos;
- de 3 a 6 perguntas de recordação do caminho e dos conceitos;
- referências oficiais;
- limites da análise estática e da verificação.

Essas perguntas de recordação não substituem o modo `*entrevista-perguntas`, que gera a quantidade solicitada de perguntas de entrevista sobre o fluxo.

## 5. Critério de concisão e validação

Use a menor forma que explique as transições corretamente. Prefira links a cópias extensas; remova repetição, não a explicação prática necessária. Não acrescente apêndice completo nem catalogue funcionalidades próximas.

Compare com o profundo: nenhuma transição crítica ausente, números correspondentes, relações técnicas preservadas, trechos e links válidos, guias imediatos suficientes e nenhuma cópia acidental de arquivo completo. Este é o formato enxuto de referência; o modo de parágrafos e setas segue `direct-narrative-standard.md`.
