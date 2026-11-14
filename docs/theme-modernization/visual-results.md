# Validação visual representativa da Etapa A

**Amostragem executada no renderer real dos dois temas, sem regressões observadas nos casos comparados.** Não foram repetidas as auditorias automatizadas já aprovadas. Os temas e suas configurações semânticas permaneceram intactos; apenas os perfis temporários receberam semântica ligada e opções de guias para o ensaio.

## Método e evidências

Foram usados os insumos da sessão `monodracula-visual-d4JSyW`, baseline fixado e versão atual já preparados. A inspeção utilizou duas instâncias isoladas do VS Code 1.146.0, com as mesmas extensões, arquivo e configuração. O probe controlou a seleção do tema e dos documentos via API; a interface foi capturada por Chromium DevTools em localhost. Não houve edição de CSS, dos temas ou do DOM dos tokens para produzir a aparência.

A amostra [visual-sample.ts](visual-sample.ts) contém classe/interface, readonly, método, parâmetro, variável constante, strings, números, operadores, comentários e três níveis de indentação. A opção efetiva `editor.semanticHighlighting.enabled = true` e os dados do provedor foram registrados especificamente para esta amostra. A identidade efetiva de cada tema foi confirmada pelas variáveis CSS do renderer: `#282a36/#fcfcfa` no MonoDracula e `#1f1f1f/#eaeaea` no MonoMin.

As capturas incluem screenshots reais, estilos computados dos spans, o widget **Inspect Editor Tokens and Scopes**, guias, ícones, abas, linhas do Explorer e controles. O diálogo de botão foi ensaiado em hosts sem `--extensionTestsPath`, pois o modo de testes suprimia o diálogo. As primeiras tentativas obstruídas por boas-vindas ou sem diálogo não foram usadas para aprovar testes.

O resumo é [visual-evidence/comparison.json](visual-evidence/comparison.json), regenerável com `node docs/theme-modernization/summarize-renderer.cjs`. Os JSONs preservam os valores computados e os PNGs registram o que foi desenhado. Os screenshots semânticos de baseline/atual do MonoDracula são inclusive idênticos em bytes; não se exigiu igualdade binária das demais imagens para aceitar estilos equivalentes.

## Matriz efetivamente executada

| Ensaio, em ambos os temas | Resultado | Classificação de diferenças |
|---|---|---|
| Tokens visíveis de TypeScript com semântica ligada | **Aprovado na amostra**: foreground, itálico e peso dos spans iguais | Nenhuma regressão observada |
| Inspetor sobre `label` | **Aprovado**: tipo semântico `variable`, modificadores `declaration readonly local`, scopes e regras iguais | Comportamento preexistente preservado |
| Guias ativas/inativas em três níveis | **Aprovado**: classes e sombras que desenham as guias iguais | Comportamento preexistente preservado |
| Activity Bar: Explorer ativo versus ícones inativos | **Aprovado**: estilos iguais entre versões, destaque relativo mantido | Comportamento preexistente preservado |
| Aba ativa versus abas inativas | **Aprovado**: cores computadas e hierarquia iguais | Comportamento preexistente preservado |
| Explorer: seleção com foco versus seleção sem foco | **Aprovado**: estilos iguais nos estados equivalentes; fundos e outline distinguem o foco | Comportamento preexistente preservado |
| Botão secundário normal, hover e foco | **Executado; diferença esperada confirmada**: paleta nova aplicada, hover identificável e outline de foco presente | **Mudança deliberada da Etapa A** |
| `agentsPanel.border` na janela real de agentes | **Executado; diferença esperada confirmada** em um consumidor visível do painel lateral | **Mudança deliberada da Etapa A** |
| Comentários azulados de menor contraste no MonoDracula | Cor `#6272a4` e itálico preservados no renderer | **Comportamento preexistente**, não regressão |
| Sessões de agentes autenticadas, respostas e ferramentas em execução | **Pendente / não executado** | Sem classificação visual até existir evidência |

Uma primeira captura de foco do Explorer apresentou diferença de outline entre as janelas. Após aguardar a aplicação do foco e recapturar exatamente o mesmo estado, os estilos coincidiram. Não foi necessário alterar temas; essa diferença transitória de captura não foi considerada regressão.

## Valores observados

- O inspetor mostra `label` em **`#BD93F9` sobre `#282A36`** no MonoDracula e **`#B392F0` sobre `#1F1F1F`** no MonoMin, nas duas versões. Os comentários mantêm seus estilos originais. Os screenshots são [baseline MonoDracula](visual-evidence/baseline-dracula-semantic.png), [atual MonoDracula](visual-evidence/current-dracula-semantic.png), [baseline MonoMin](visual-evidence/baseline-min-semantic.png) e [atual MonoMin](visual-evidence/current-min-semantic.png).
- As guias são desenhadas por `box-shadow`. No MonoDracula, inativa **`#37394a`**, ativa **`#4b4f66`**; no MonoMin, inativa **`#3d3d3d`**, ativa **`#505050`**. As sombras resolvidas coincidem com o baseline, inclusive após movimentar o cursor para outro nível.
- Na Activity Bar da amostra, o ícone ativo resolve para **`#BD93F9`** no MonoDracula e **`#F8C66B`** no MonoMin. Os inativos resolvem para **`#3a3d4e`** e **`rgba(136,136,136,0.4)`**, respectivamente. As abas inativas ficam em `#6272a4`/`#888888`, mantendo menor destaque que a aba ativa. Esses valores observados são iguais entre baseline e atual.
- A seleção do Explorer preserva seu foreground acentuado tanto com foco quanto sem foco. A distinção usa o fundo e o indicador de foco; não foi exigido que o texto selecionado sem foco fosse clareado ou escurecido artificialmente. Os screenshots de foco estão em `*-explorer-focus.png`.

### Diferenças deliberadas confirmadas

| Componente | Baseline efetivo | Atual efetivo | Efeito observado |
|---|---|---|---|
| Secundário MonoDracula | Texto `#fcfcfa`, fundo normal `rgba(252,252,250,0.05)` | Texto `#939293`, fundo normal `#21222c`, hover `#282a36` | Mais discreto; aproxima a aparência normal da do botão primário, consequência do mapeamento aprovado para `button.*` |
| Secundário MonoMin | Texto `#eaeaea`, fundo normal `rgba(234,234,234,0.05)` | Texto `#939293`, fundo normal `#101010`, hover `#1f1f1f` | Mesmo efeito de aproximação ao primário; hover continua distinto |
| Borda lateral de agentes MonoDracula | `rgba(252,252,250,0.15)` | `#282a36` | Separação visual mais discreta |
| Borda lateral de agentes MonoMin | `rgba(234,234,234,0.15)` | `#1f1f1f` | Separação visual mais discreta |

Os botões secundários mantêm outline sólido de foco de 1 px, nas cores `#6272a4` e `#888888`. O foco da comparação foi programático; uma navegação completa de teclado por todo o diálogo não foi aprovada por inferência. Os screenshots de botões em hover estão em [baseline MonoDracula](visual-evidence/baseline-dracula-button.png), [atual MonoDracula](visual-evidence/current-dracula-button.png), [baseline MonoMin](visual-evidence/baseline-min-button.png) e [atual MonoMin](visual-evidence/current-min-button.png).

Na janela de agentes, o consumidor confirmado foi `.agent-sessions-workbench.dock-detail-panel .part.auxiliarybar`. A regra que usa `var(--vscode-agentsPanel-border)`, os elementos visíveis e suas cores computadas estão nos arquivos `*-agents.json`; as imagens correspondentes são `*-agents.png`. A presença da variável sozinha não foi usada como prova de aplicação. Não foi enviada nenhuma mensagem nem iniciada uma sessão com um agente. O aviso de modelos indisponíveis aparece em ambos os lados e não foi atribuído ao tema.

## Pendências que dependem do usuário

A amostragem solicitada de sintaxe e estados está executada. As seguintes extensões de cobertura continuam **pendentes**, sem aprovação automática:

1. **Agentes com sessão real:** abra o baseline e o atual nos perfis visuais isolados, use a mesma conta e um projeto de teste equivalente, e compare o painel com uma sessão já existente, respostas e detalhes de ferramentas. Envie screenshots pareados indicando tema e estado. Não é necessário compartilhar o conteúdo privado da conversa; use uma sessão de teste. Até essas evidências, somente o painel lateral vazio capturado está validado.
2. **Teclado completo:** no diálogo do probe, navegue por Tab/Shift+Tab entre primário, secundário e Cancelar. Confirme foco visível e ordem equivalente; envie um par de screenshots do secundário com foco se houver divergência. A captura programática já comprova a existência do outline, não todo o percurso de teclado.
3. **Leitura no seu monitor habitual:** confira os comentários do MonoDracula sem alterar fonte ou cores. Se houver dificuldade, informe fonte, tamanho, escala e um exemplo/screenshot. O contraste reduzido é preexistente e permanece assunto separado da Etapa B; nenhuma proposta foi aplicada.

Os perfis dessa rodada estão em `C:\Users\diego\AppData\Local\Temp\monodracula-visual-d4JSyW\baseline\visual-data` e `current\visual-data`. Use o mesmo diretório congelado `extensions` da sessão e o `--extensionDevelopmentPath` de cada lado (`baseline\theme`/`current\theme`). O arquivo `visual-launch.ps1` da sessão permite reabrir esse par; **Developer: Open Logs Folder** identifica o lado pelo caminho.

Não foram extrapoladas conclusões para todas as grammars, tamanhos de janela, escalas, plataformas ou estados dinâmicos. **Nenhuma regressão foi observada na amostra executada. As únicas diferenças persistentes identificadas foram as mudanças deliberadas de botões e borda de agentes.** Se a aproximação visual entre botões primário/secundário ou a borda mais discreta não corresponder à preferência desejada, isso deve ser discutido explicitamente antes de qualquer refinamento. A Etapa B continua bloqueada.
