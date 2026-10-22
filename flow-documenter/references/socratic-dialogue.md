# Diálogo socrático gamificado — história com código visível

Use para `*dialogo-socratico [fluxo, tema ou material]`, alias `*historia-socratica`, ou pedido equivalente. Gere **um documento Markdown separado**, `dialogo-<slug>-socratico.md`, salvo nome/destino escolhido pelo usuário. Este modo cria o roteiro completo com as duas vozes; não interrompa a geração para o usuário responder às perguntas fictícias.

O melhor momento sugerido é **depois do documento profundo**, mas o comando pode ser chamado em qualquer momento, inclusive para conceitos gerais ou uma história ilustrativa sem fluxo prévio. Ele não inicia prática, entrevista, Anki nem outra etapa automaticamente. Exemplos de comandos nesta referência não são pedidos para executá-los.

## Base técnica e origem dos exemplos

- **Fluxo com profundo existente:** leia o profundo correspondente por completo; use seu gatilho, cenário, limites, etapas e explicações. Depois confira arquivos, linhas e símbolos no código atual. Preserve a causalidade; falas dramáticas não mudam chamadas, retornos, espera ou ramos independentes. Se o comportamento divergir, explique a divergência sem misturar versões como se fossem uma execução.
- **Fluxo sem profundo:** investigue o caminho necessário no código e informe o recorte. Não obrigue a criar o profundo antes do diálogo; a recomendação de sequência não é um pré-requisito.
- **Tema geral, material ou história criada do zero:** use o tema/fonte pedidos, sem exigir projeto ou escolha de fluxo. Identifique a linguagem e os exemplos como ilustrativos. Não atribua ao projeto anterior arquivos, tecnologias ou incidentes inventados.

Leia o padrão [didático compartilhado](didactic-grounding.md) e o histórico existente, quando houver contexto local autorizado. Reutilize somente dúvidas pertinentes. As falas dos personagens são ficção didática: não são dúvidas reais do usuário nem confirmação de que ele aprendeu; não as registre no histórico como tal.

O formato adota o **Diálogo Socrático Gamificado**: confronto construtivo entre a intuição prática e a análise das consequências. Uma análise de vídeo fornecida orienta o estilo; código e documentação oficial sustentam os fatos técnicos. Não alegue ter assistido a um vídeo que não foi acessado. Métricas, frequências, valores de negócio e ferramentas citados em um roteiro de referência não são dados do projeto atual.

## Duas vozes, com respeito e ritmo

- **PETTER — aprendiz pragmático:** percebe o efeito visível, quer resolver o problema e sugere uma solução plausível com conhecimento parcial. Usa frases curtas e linguagem cotidiana. Faz perguntas que revelam a diferença entre aparência e mecanismo; não é ridicularizado nem apresentado como incapaz.
- **TONY — especialista:** responde com calma, pede previsões, examina os valores e mostra consequências verificáveis. Explica causas e escolhas com custos e benefícios, ligadas a nomes reais de funções, classes ou campos. Não usa autoridade ou mais jargão como substituto da demonstração.

Mantenha esses papéis e nomes consistentes; adapte nomes se o usuário pedir. Cada fala tem **no máximo três frases**. Divida explicações longas em novas trocas, sem esconder um monólogo enorme em uma única frase. Blocos de código e guias ficam fora das falas. Use emoção leve e reações naturais, sem humilhação, gritaria constante ou promessas como “agora pode subir para produção”.

As perguntas devem fazer o leitor raciocinar: “qual valor chega aqui?”, “quem guarda isso?”, “o que falta para a próxima linha funcionar?”. Mostre a previsão do aprendiz e confira-a no código, em vez de apenas converter uma aula expositiva em perguntas decorativas.

## Estrutura da história

1. **Gancho — o comportamento inesperado:** comece com um sintoma ou pergunta concreta que será resolvido ao final. Pode ser um caso limite, uma situação menos comum que testa uma regra do sistema. Se for inventado, rotule-o como cenário hipotético; não fabrique um incidente de produção.
2. **Regras desbloqueadas:** organize, por padrão, **três a cinco blocos**, com títulos como `Regra 1 — <nome memorável> (<conceito técnico exato>)`. A quantidade se adapta ao foco e ao pedido. Construa do fundamento ao uso, às consequências e aos limites; em um fluxo real, respeite suas dependências e diferencie a ordem da explicação da execução.
3. **Resolução do gancho:** volte ao problema inicial e mostre qual linha, valor ou sequência explica o resultado. Se a correção não existir no projeto, apresente-a como proposta ilustrativa, sem dizer que foi implementada.
4. **Resumo pelo aprendiz — nível concluído:** Petter reconstrói as regras em checkpoints de uma linha, com suas próprias palavras. O resumo conecta o que parecia acontecer ao que o código faz. Não é um gabarito de entrevista nem uma avaliação real do usuário.

Em cada bloco técnico, use este microciclo:

1. **Sintoma:** Petter descreve a dificuldade ou o objetivo prático.
2. **Revelação:** Tony mostra um mecanismo que a intuição inicial deixou de considerar.
3. **Atalho plausível:** Petter propõe a solução aparentemente mais simples; deixe claro se é uma hipótese ou uma alteração fictícia.
4. **Consequência concreta:** Tony demonstra, com valores e código, quando essa ideia falha ou quais custos impõe. Se a solução simples for válida naquele caso, reconheça isso; não invente uma catástrofe para forçar arquitetura mais complexa.
5. **Solução e limite:** construa a abordagem adequada, explique por que funciona e qual uso posterior ela permite. Mostre também seu custo ou condição de validade, quando relevante.

O ritmo pode variar para soar natural, mas cada regra precisa ligar o problema à demonstração e à conclusão. Não transforme todo atalho em desastre de segurança ou concorrência sem evidência. Exemplo hipotético é identificado; resultado calculável é esperado; execução observada só é afirmada quando testada. Não invente “0 ms”, cargas ou latências exatas para dar aparência de precisão.

## Regra central: a fala aponta e o código aparece logo abaixo

**Sempre que uma fala citar código, um símbolo ou um mecanismo aplicado, mostre imediatamente o trecho que o demonstra, antes da fala seguinte.** Isso vale para perguntas, hipóteses, consequências, soluções e o resumo final. Uma fala emocional sem conteúdo técnico não exige bloco artificial.

Use a sequência local:

**Fala → identificação do arquivo e bloco de código → árvore de pastas, se ilustrativo → guia imediato → próxima fala.**

O rótulo do arquivo pode vir entre a fala e o bloco; não coloque outra explicação nesse intervalo. Identifique o que o leitor deve observar no trecho e use valores concretos. Um bloco pode demonstrar conceitos da mesma fala, mas não acumule várias trocas para só mostrar o código no fim. Não substitua a demonstração por “veja o código acima”, link distante ou apêndice.

- **Código do projeto:** copie o trecho fielmente e linke o arquivo com linha atual. Mostre declaração e uso quando a diferença importar. Marque omissões; não acrescente comentários como se fossem parte do fonte. Para localizar a ação, use símbolos exatos, não só o nome do arquivo.
- **Proposta ou contraexemplo:** rotule como versão hipotética, não aplicada. Mantenha separado do código verificado e mostre a consequência que sustenta a fala. Uma recomendação arquitetural não passa a ser um mecanismo já usado pelo projeto.
- **Sem vínculo com fluxo/repositório:** apresente exemplos coerentes entre si e **logo após cada bloco de código mostre a árvore de pastas de exemplo**, em bloco `text`. Indique o arquivo daquele trecho. Pode repetir só o ramo pertinente, mas preserve nomes, caminhos, imports e relações entre arquivos ao longo da história. No final, se houve evolução, mostre a versão consolidada necessária para reunir os trechos, com sua árvore correspondente.

As pastas ilustrativas são parte do `.md`, não diretórios a criar na máquina. Não invente links clicáveis para arquivos inexistentes. Diferencie trecho parcial, versão intermediária e versão final; não apresente variantes incompatíveis como arquivos que devem ser executados juntos. Só crie código fora do documento se o usuário pedir isso separadamente.

Coloque **Guia imediato — termos e expressões** depois da demonstração local. Preserve o termo exato e traduza-o em ação simples: qual objeto/valor existe, o que é lido ou alterado, por que isso importa e onde está no trecho. Também explique frases como “guardar o retorno”, “preparar uma dependência” e “atualizar o estado”. A conversa pode ser rápida; a demonstração precisa permitir localizar o significado no código.

No resumo final, mantenha cada checkpoint curto. Quando um item citar código ou um mecanismo aplicado, coloque seu trecho mínimo logo abaixo, com árvore se ilustrativo e guia quando necessário. O resumo não é uma exceção à demonstração próxima.

## Analogias e precisão

Os personagens e a progressão por regras não obrigam metáforas físicas. Mantenha as analogias opcionais, como nos outros modos: `*analogia` ou pedido explícito equivalente usa [analogy-mode.md](analogy-mode.md), com as três opções e a escolha do usuário. Não abra essa seleção só porque o usuário pediu um diálogo socrático, nem bloqueie o documento por falta de uma analogia. Pode aproveitar uma analogia já escolhida quando sua incorporação ao diálogo for solicitada.

Adapte a forma do roteiro sem copiar suas simplificações como leis universais. Por exemplo, uma explicação sobre desfazer uma mudança precisa mostrar onde o valor anterior foi guardado e onde é restaurado; não atribua esse armazenamento automaticamente a um operador. Diferencie uma apresentação pendente de uma confirmação real. Não imponha Java, Angular, servidor ou banco de dados quando o código estudado não os utiliza.

## Referência de escrita: fala vaga e demonstração concreta

**Inadequado:**

> **TONY:** O retorno resolve o estado e disponibiliza o resultado para o sistema.

Não identifica quem recebe qual valor, qual linha faz isso nem o uso posterior.

**Adequado — trecho de um diálogo ilustrativo em JavaScript:**

> **PETTER:** Se eu chamar `dobrar(3)`, a variável `resultado` passa a guardar `6` sozinha?

**Versão ilustrativa inicial — `exemplo-retorno/src/main.mjs`:**

```javascript
let resultado = 0;
function dobrar(valor) {
  return valor * 2;
}
dobrar(3);
console.log(resultado);
```

```text
exemplo-retorno/
└── src/
    └── main.mjs
```

**Guia imediato — termos e expressões:** **Variável** é um nome que guarda um valor; aqui, `resultado` começa com `0`. **Função** é o trecho nomeado que pode ser chamado, `dobrar`. **Argumento** é o valor enviado, `3`; **parâmetro** é o nome que o recebe, `valor`. **Retorno** é o valor devolvido por `return`; calcular `6` não altera `resultado` por conta própria. **console.log** mostra o valor recebido no terminal; a saída esperada desta versão é `0`.

> **TONY:** `dobrar(3)` devolve `6`, mas nenhuma linha guarda esse retorno em `resultado`. Para usar o número depois, precisamos atribuir o retorno à variável antes de mostrá-la.

**Versão ilustrativa final — `exemplo-retorno/src/main.mjs`:**

```javascript
function dobrar(valor) {
  return valor * 2;
}
const resultado = dobrar(3);
console.log(resultado);
```

```text
exemplo-retorno/
└── src/
    └── main.mjs
```

**Guia imediato — termos e expressões:** **Atribuir o retorno** é guardar o valor devolvido pela chamada: `dobrar(3)` devolve `6` e `resultado` recebe esse `6`. **const** declara um nome que não pode ser reatribuído. A última linha lê `resultado` e a saída esperada é `6`. Esta versão substitui a anterior; não é outro arquivo para executar junto.

O exemplo demonstra proximidade, pastas e clareza; não é o roteiro completo nem dispensa o microciclo, o gancho ou o resumo. Em uma história completa, outras falas fariam a previsão, testariam o atalho e examinariam sua consequência antes da conclusão. Não copie este assunto para todo pedido.

## Revisão e entrega

- Confira gancho resolvido, papéis consistentes, ritmo de até três frases e progressão em regras. O aprendiz faz o resumo; falas curtas não escondem explicações incompreensíveis.
- Confira se cada menção técnica na conversa tem demonstração logo abaixo, com guia próximo. Em exemplos ilustrativos, código e árvore vêm juntos e os caminhos formam um exemplo coerente.
- Confira arquivos/linhas reais, fidelidade dos trechos e separação entre código existente, hipótese, proposta e resultado esperado/observado. Revise as relações causais, não só a sintaxe.
- Não modifique a aplicação nem gere prática ao escrever a história. Não registre perguntas fictícias no histórico do aprendiz. Não gere os exemplos de comandos automaticamente.
- Entregue o link do `.md`, seu tema/base e verificações realmente feitas. Não diga que o usuário dominou o conteúdo, que o exemplo foi executado sem teste, ou que todo o repositório foi lido sem essa inspeção.

Exemplos de uso: `*dialogo-socratico fluxo de inicialização do catálogo`, `*dialogo-socratico classes e objetos em Java`, `*dialogo-socratico /caminho/material.md`. O primeiro pode usar um profundo já existente; os demais não exigem um fluxo.
