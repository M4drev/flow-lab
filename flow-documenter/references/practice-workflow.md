# Etapa 3 — reconstrução incremental isolada

Use somente para prática guiada, não para gerar uma aplicação inteira de uma vez. Planos, comentários, explicações, mensagens de depuração e perguntas didáticas são escritos em português brasileiro. Preserve identificadores, nomes oficiais, caminhos e comandos quando traduzi-los mudaria seu significado.

## 1. Reconstrua o contexto pelos arquivos

A prática normalmente começa em outro chat, sem depender de memória anterior. Antes de planejar ou editar código da aplicação:

1. leia integralmente o enxuto correspondente;
2. leia instruções aplicáveis, como `AGENTS.md`;
3. examine somente fontes, versões, configurações, testes e fronteiras necessários ao fluxo do enxuto;
4. confira alterações locais e preserve trabalho alheio;
5. em retomadas, leia o plano e o código atual da prática por completo.

Monte internamente a correspondência `etapa do enxuto → mecanismo/princípio → fonte de referência → parte planejada do exercício → evidência esperada na execução`. Não abra o profundo nesta etapa. Se faltar enxuto ou ele for insuficiente, peça a etapa 2; se divergir do código, informe antes de continuar. Não sobrescreva pasta existente que não seja claramente o mesmo exercício. O direto pode ajudar na leitura, mas não substitui um enxuto que documente os mecanismos necessários.

## 2. Escolha a variante

Respeite a variante escolhida pelo usuário. Caso contrário, ofereça opções delimitadas:

- **outro tema de negócio:** mesmos mecanismos e sequência, outro tema, como catálogo → biblioteca, cardápio, cursos ou estoque;
- **transferência para outra funcionalidade:** mesmos princípios em outra situação, com correspondência explícita entre uso original e novo;
- **reconstrução fiel isolada:** mesmo caminho técnico em um projeto de aprendizado neutro, sem alterar a aplicação nem depender de dados de produção.

A variante pode mudar nomes e regras de negócio, mas deve preservar o conceito praticado. Mantenha um gatilho e um resultado, sem ampliar para toda a aplicação.

## 3. Pasta dedicada e plano persistente

Salvo destino seguro escolhido pelo usuário, proponha `<raiz-do-repositorio>/flow-practice/<slug>/`. Use outra pasta se já houver trabalho não relacionado. A aplicação de referência permanece somente para leitura.

O primeiro artefato é `IMPLEMENTATION_PLAN.md`. Crie-o antes de código da aplicação, apresente decisões e dependências pendentes e aguarde aprovação explícita antes de implementar. O plano precisa permitir retomada em outro chat e conter:

1. título, slug, variante, objetivo, gatilho e resultado;
2. caminho do enxuto canônico e revisão/data consultada;
3. mecanismos incluídos, exclusões e correspondência com cada etapa numerada;
4. organização e sequência causal do fluxo isolado;
5. versões de execução/ferramentas e árvore prevista de pastas/arquivos;
6. dependências externas, comandos, pacotes, variáveis de ambiente, portas, recursos de banco, migrações, dados de exemplo e limpeza segura, quando necessários;
7. tabela numerada de incrementos: estado (`pendente`, `em andamento`, `concluído`, `bloqueado`), arquivos, conceito, mensagens de depuração esperadas, comando de validação e pré-requisitos;
8. riscos, premissas, escolhas pendentes e quais exigem confirmação;
9. sequência esperada de depuração do início ao fim e critérios finais;
10. somente o próximo incremento claramente identificado.

Atualize o plano após cada incremento verificado com arquivos, comandos, evidências, decisões e próxima ação reais. Não guarde segredos nele.

## 4. Planeje o fluxo completo; implemente um incremento por vez

O plano aprovado cobre entrada, configuração, registro de dependências, navegação, criação de componente ou função de atendimento, comunicação externa, mudanças de valores, apresentação/resultado e falhas relevantes. Em um exercício Angular, isso pode abranger HTML, `main.ts`, configuração, rotas, raiz, catálogo, service, HTTP, signals e apresentação de erro/vazio, conforme os documentos canônicos.

Depois da aprovação, faça exatamente um incremento coeso por turno:

1. releia o plano atual e as evidências necessárias;
2. explique o aprendizado e as etapas do enxuto correspondentes;
3. crie/altere somente a unidade necessária agora, normalmente um fonte da aplicação e a configuração mecânica indispensável;
4. acrescente comentários e observações de depuração;
5. execute a menor validação relevante;
6. registre o resultado real e atualize o plano;
7. explique o incremento no chat com guia imediato;
8. pare para o usuário inspecionar, perguntar, reproduzir ou confirmar o próximo incremento.

Não antecipe regras de negócio, componentes, métodos ou estágios de banco só porque seus nomes são conhecidos. Uma ferramenta de geração pode criar arquivos mecânicos no mesmo incremento; remova ou isole padrões alheios e não preencha comportamento futuro.

Quando houver dúvida, esclareça o conceito atual antes de avançar. “Continue” autoriza somente o próximo incremento pendente, não todos os restantes.

## 5. Comentários didáticos e guias próximos

Aplique `didactic-grounding.md`: termo técnico e expressão abstrata recebem explicação concreta, símbolo, origem e ligação ao código que executa a ação. Separe classe, objeto e método; explique argumentos, retorno e alvo real. No chat, coloque o guia imediatamente após o parágrafo/bloco. No plano, mantenha um índice prático. Dentro do código, use comentários válidos próximos das ações, sem forçar tabelas ou Markdown em formatos inadequados.

- No começo do arquivo, quando a linguagem permitir, explique seu papel, quem o carrega/chama, qual `[Fluxo — Etapa N]` cobre e quem recebe o controle depois.
- Antes de anotações, decoradores, classes, interfaces, componentes, providers, rotas, funções, métodos e configurações importantes, explique significado, motivo e conexão com o fluxo.
- Dentro de métodos, comente os blocos causais: entradas, valores antes/depois, efeitos, espera, saída e próximo destinatário.
- Use rótulos estáveis, como `[Fluxo — Etapa 04]`, ligando código, mensagens, plano e enxuto.
- Em HTML, deixe comentários fora de tags abertas e expressões Angular. Em JSON puro, explique campos no plano/chat ou documento adjacente válido, sem inventar comentários.
- Explique linhas e blocos importantes, não pontuação óbvia ou toda propriedade repetida.
- Marque comentários/mensagens exclusivos do exercício, que seriam normalmente reduzidos em produção.

Não copie esses comentários para a aplicação de referência. Distinga declaração de tipos e corpo executável ao entrar em uma biblioteca; explique ordem de chamada/retorno de linhas com várias ações.

## 6. Torne a execução observável com depuração segura

Registre somente as fronteiras causais que ajudam a observar a ordem real, com a ferramenta de registro apropriada. No navegador, pode ser `console.debug`; no servidor, prefira o mecanismo de registro do projeto.

Rótulo de referência:

```text
[FLUXO <slug>][Etapa 04][resposta-http] dados recebidos
```

Pontos úteis incluem entrada/bootstrap; configuração/rota; construção e inicialização; criação, envio, resposta, erro e conclusão de pedido; valores antes/depois; apresentação final; validação, autorização, nova tentativa, cancelamento ou alternativa incluídos no fluxo.

Use identificador de execução/correlação quando operações puderem se intercalar. Não registre senhas, tokens, segredos, headers de autorização, dados pessoais, conexões de produção ou corpos sensíveis completos. Não prometa ordem total quando houver concorrência: registros mostram uma execução observada; documentos descrevem relações causais.

Após cada incremento, diga quais novas mensagens podem aparecer, quais ainda não e por quê.

## 7. Infraestrutura necessária, sem complexidade acidental

Se o conceito realmente atravessar interface, API, segurança, banco ou Supabase, o exercício completo deve conter equivalentes isolados executáveis dessas partes. Não substitua mecanismo central por simulação para terminar mais rápido. Uma simulação é aceitável somente em fronteira explicitamente fora do escopo, identificada no plano, código e explicação.

Quando necessário, use as ferramentas de linha de comando para iniciar serviços, criar migrações e dados seguros ou banco/projeto isolado. Registre comandos reproduzíveis e nomes não secretos. Prefira infraestrutura local descartável quando preservar o conceito. Antes de criar recursos pagos/remotos, escolher conta/organização, vincular projeto Supabase, aplicar migração destrutiva ou redefinir dados, identifique o alvo e obtenha a confirmação exigida. Nunca use dados/credenciais de produção.

Mantenha estilo visual pequeno, suficiente para leitura, estados e acessibilidade; não faça um grande trabalho SCSS salvo quando esse for o objeto do aprendizado.

## 8. Explicação no chat após cada incremento

Explique em português brasileiro:

1. o que mudou, com caminhos clicáveis;
2. etapa numerada e fonte de referência correspondente;
3. quem carrega, cria a instância ou chama o código;
4. significado concreto de cada construção importante acrescentada;
5. entradas, saídas, mudanças de valores, efeitos, próximo destinatário e motivo;
6. sequência de depuração esperada e como acioná-la;
7. comandos de validação e resultados;
8. o que ainda não foi implementado intencionalmente;
9. uma pequena pergunta de recordação ou reconstrução manual.

Guia imediato vem junto da explicação que contém o termo/expressão, não somente no final. Depois pare; não implemente outro incremento no mesmo turno.

## 9. Conclusão e validação

Antes de concluir a etapa 3, confira:

- toda etapa do enxuto tem equivalente funcional ou fronteira externa justificada;
- variante preserva os mecanismos e relações pretendidos;
- código está somente na pasta dedicada e recursos isolados aprovados;
- compilação, tipos, testes, lint e execução completa relevantes passam, ou limites não verificados são explicitados;
- depuração mostra sucesso e ramos relevantes sem dados sensíveis;
- comentários são válidos, corretos, vinculados às fontes e em português brasileiro;
- plano registra situação final, preparação, execução, validação, recursos externos e limpeza segura;
- estilo visual permanece subordinado ao aprendizado de programação.

Execute o fluxo completo somente quando os incrementos estiverem prontos. Explique o percurso observado e convide o aprendiz a reconstruí-lo à mão em um caderno ou pasta própria. Revise essa reconstrução quando solicitado; não a faça silenciosamente por ele.
