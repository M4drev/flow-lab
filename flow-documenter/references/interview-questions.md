# Perguntas de entrevista técnica a partir do fluxo

Use para `*entrevista-perguntas`, alias `*quest-interview`, ou pedido equivalente. São questões plausíveis baseadas no código, não uma previsão garantida de empresas ou entrevistadores específicos.

## Fluxo e quantidade

Use o fluxo atual da conversa. Leia o histórico de dúvidas e o documento disponível correspondente, preferindo enxuto ou direto, e somente as fontes necessárias para conferir as perguntas. A ausência de outro formato documental não bloqueia perguntas sobre um fluxo já delimitado e verificável. Se não houver fluxo escolhido, selecione-o pelas regras da entrada da skill.

Gere **10 perguntas por padrão** ou exatamente a quantidade positiva pedida. Um foco como “Observable e subscribe”, “inicialização” ou “nível estagiário” direciona as questões sem mudar o fluxo. Preserve o nível solicitado; na ausência dele, combine entendimento básico com leitura prática adequada a quem está começando.

Por padrão, responda no chat. Crie Markdown somente quando solicitado, usando um novo `flow-<slug>-entrevista.md` ou o nome escolhido. Solicitar perguntas não inicia prática, não executa código e não autoriza responder pelo aprendiz.

## Como escrever as perguntas

Cubra de forma equilibrada, quando existirem no fluxo:

- significado e uso de conceitos centrais, como Signal, Observable e bootstrap;
- sequência: registro, criação da instância, chamada, retorno, espera e callback;
- leitura de trecho real: qual objeto recebe a chamada, argumentos e resultado;
- motivo da posição no fluxo e consequência concreta de remover ou alterar a linha;
- diferenças importantes: classe/instância, Observable/Signal, tipo/validação, carregamento de código/dados;
- vazio, erro, reentrada, concorrência ou outras ramificações realmente presentes;
- explicação curta do caminho completo e ligação dos símbolos às ações do código.

Não invente mecanismos, tecnologias ou garantias para completar a quantidade. Se o fluxo for pequeno e a quantidade grande, varie a situação de raciocínio de forma explícita, sem apresentar perguntas equivalentes como se fossem temas novos.

Cada pergunta numerada contém um enunciado claro, um link para o arquivo e linha reais e, quando a leitura de código for central, um pequeno trecho fiel. Faça a pergunta usando o termo técnico exato e uma situação concreta: “O que muda na tela se a linha que desliga loading for removida?” é mais verificável que “Fale sobre reatividade”.

## Guia próximo sem entregar o gabarito por padrão

Logo abaixo do enunciado, inclua **Guia de apoio — termos e expressões**, com tradução simples, uso concreto e fonte, conforme o padrão compartilhado. Para perguntas cuja resposta seria revelada pela própria definição, deixe esse guia em um bloco Markdown `<details>` recolhido e claramente opcional. Isso permite tentar responder antes de consultar, mantendo o apoio no mesmo lugar.

O guia explica vocabulário e aponta o código; não acrescente automaticamente resposta modelo, avaliação do candidato, pontuação ou solução completa. Se o usuário pedir gabarito ou comentários, forneça-os com guias imediatos e fontes, distinguindo o esperado pelo tipo do que é garantido em execução.

Exemplo de enunciado, a adaptar ao código atual: “No método que busca produtos, o retorno é um Observable. Quem chama subscribe nesse retorno e por que o GET não é enviado apenas pela criação do Observable?”

Em uma pergunta “O que é Signal e para que ele é usado aqui?”, o apoio pode apontar a declaração de `products`, sua leitura e sua escrita, sob `<details>`, para o aprendiz abrir depois.

## Comandos de exemplo

- `*entrevista-perguntas` → 10 perguntas do fluxo atual.
- `*entrevista-perguntas 5 sobre Signal e Observable` → 5 perguntas com esse foco.
- `*quest-interview 12 sobre inicialização Angular, sem gabarito` → mesmo modo, 12 questões.
- `*entrevista-perguntas 10 com respostas comentadas` → 10 questões e comentários solicitados.

Exemplos são instruções de uso; não gere uma lista real só porque este arquivo menciona o comando.

## Verificação

Confira quantidade, variedade, aderência ao fluxo, links/linhas, trechos e clareza dos termos. Nenhuma pergunta pode depender de um comportamento ausente no código como se ele existisse. Informe os limites de análise estática quando eles afetarem o enunciado.
