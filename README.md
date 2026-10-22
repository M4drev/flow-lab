# Flow Lab + flow-documenter

Estude código com explicações práticas e exemplos verificáveis. A skill gera os materiais; o Flow Lab apresenta o JSON com explicação da etapa, código linha por linha e mapa de nós.

- [`flow-lab/`](flow-lab/): visualizador, exemplo do catálogo Angular, contrato e testes.
- [`flow-documenter/`](flow-documenter/): skill completa para Codex, com referências, exemplos e validadores.

## Instalação

```bash
git clone https://github.com/M4drev/flow-lab.git
cd flow-lab
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R flow-documenter "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Abra no Codex o projeto que deseja estudar e envie `$flow-documenter`. Os comandos com `*` abaixo são mensagens para a IA, não comandos do terminal.

## Sequência recomendada

1. **Entender:** `*fluxo-profundo <fluxo>` investiga o código e cria o documento de referência.
2. **Reforçar, se quiser:** `*dialogo-socratico <documento profundo>` cria uma história separada com Tony, o especialista, e Petter, o aprendiz. Código aparece logo abaixo das falas; exemplos inventados incluem árvores de pastas.
3. **Revisar:** `*fluxo-enxuto <documento profundo>` gera a versão enxuta. `*fluxo-direto <documento>` acrescenta outro material, com parágrafos e setas.
4. **Praticar:** `*pratica-planejar <documento enxuto>` prepara um exercício isolado. Aprove o plano; depois use `*pratica-continuar <pasta>` para avançar um incremento por vez.

Para estudar visualmente, use `*fluxo-json <documento profundo>` e abra o arquivo no Flow Lab. O JSON deriva do profundo completo, seguido da conferência do código atual. Enxuto e direto não substituem essa base.

Diálogo, Anki e dúvidas também funcionam com conceitos gerais ou materiais, sem documentos anteriores. Analogias são opcionais e só começam quando solicitadas.

## Comandos

| Mensagem para a IA | Resultado |
| --- | --- |
| `*fluxo-profundo <fluxo>` | Documento completo `flow-<slug>-deep.md`. |
| `*fluxo-enxuto <profundo>` | Revisão `flow-<slug>-quick.md`, derivada do profundo. |
| `*fluxo-direto <enxuto ou profundo>` | Narrativa com parágrafos, setas e guias imediatos. |
| `*dialogo-socratico [fluxo, tema ou material]` | `dialogo-<slug>-socratico.md` separado. Recomendado após o profundo, disponível a qualquer momento. |
| `*pratica-planejar <fluxo ou enxuto>` | Plano de reconstrução baseado no enxuto; aguarda aprovação. |
| `*pratica-continuar <pasta>` | Próximo incremento aprovado da prática. |
| `*entrevista-perguntas [quantidade] [foco]` | 10 perguntas sobre o fluxo por padrão, sem gabarito. |
| `*anki [quantidade] [tema ou fonte]` | 20 cards em `.md` por padrão: 10 frente/verso e 10 lacunas `{{c1::resposta}}`. Não é importação automática no Anki. |
| `*fluxo-json <fluxo ou profundo>` | JSON validado para importar no Flow Lab. |
| `*duvida <pergunta>` | Resposta no chat com explicação simples, código e guia imediato. Também aceita perguntas sem comando. |
| `*analogia <prompt>` | Três opções; desenvolve a analogia depois da sua escolha. |
| `*fluxo-ajuda` | Modos, dependências e exemplos de uso. |

Aliases: `*historia-socratica` → diálogo; `*quick-direct` → direto; `*quest-interview` → entrevista; `*fluxo-duvida` → dúvida. As regras completas estão em [`SKILL.md`](flow-documenter/SKILL.md).

## Abrir o Flow Lab

Requer Python 3.9+; o servidor usa somente a biblioteca padrão. Na raiz desta cópia:

```bash
python3 flow-lab/serve.py
```

Acesse **http://localhost:4173**. Em **Configurações → Abrir JSON**, selecione o fluxo gerado. A interface oferece cenários, navegação manual, painéis destacáveis/redimensionáveis e tela cheia com os três painéis.

O exemplo inicial contém trechos da SoaresStore e pode ser lido sem esse projeto. Para **Abrir no editor** funcionar, a raiz deve conter os arquivos indicados no JSON. Ao estudar outro repositório, inicie assim:

```bash
python3 flow-lab/serve.py --repo-root /caminho/do/projeto
```

Importar um JSON não altera essa raiz. O editor é escolhido em **Configurações**; também é possível iniciar com `--editor zed` e escolher outra porta com `--port 4174`. O exemplo do catálogo conserva os caminhos e a procedência originais; o documento profundo e a aplicação SoaresStore não fazem parte desta cópia.

Contrato e detalhes da interface: [`JSON-CONTRACT.md`](flow-lab/JSON-CONTRACT.md). O percurso é didático, baseado em trechos de código; não se conecta a uma sessão real de depuração.

## Verificações

Para os testes, use Node.js 22.12 ou superior da série 22, ou Node.js 24+:

```bash
npm ci
npm run check
```

A comparação do exemplo com os arquivos originais é opcional e exige a SoaresStore com suas dependências instaladas:

```bash
FLOW_LAB_SOURCE_ROOT=/caminho/da/SoaresStore npm test
```

Para validar o JSON de outro fluxo contra seu projeto, sem instalar pacotes npm:

```bash
node flow-documenter/scripts/validate-flow.cjs /caminho/fluxo.json --repo-root /caminho/do/projeto
```
