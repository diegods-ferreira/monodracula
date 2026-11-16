# Reversão exclusiva dos foregrounds amarelos

Foram executadas somente as seis reversões autorizadas nos temas. Os dois arquivos agora são **idênticos byte a byte** aos respectivos arquivos em `../yellow-highlights/baseline/`, que precedem a implementação amarela e já contêm as modernizações anteriores e os comentários aprovados do MonoDracula.

O manifesto atual **2.3.4** foi preservado. A cópia antiga do manifesto na investigação amarela não foi restaurada. Não houve commit, publicação, ajuste de contraste ou alteração do Search lateral/Antigravity.

## Diff funcional final

| Tema | Propriedade | Antes desta reversão | Resultado |
|---|---|---|---|
| MonoMin | `list.highlightForeground` | `#F8C66B` | `#EAEAEA` |
| MonoMin | `editor.findMatchForeground` | `#F8C66B` | Removida |
| MonoMin | `editor.findMatchHighlightForeground` | `#F8C66B` | Removida |
| MonoDracula | `list.highlightForeground` | `#f1fa8c` | `#fcfcfa` |
| MonoDracula | `editor.findMatchForeground` | `#f1fa8c` | Removida |
| MonoDracula | `editor.findMatchHighlightForeground` | `#f1fa8c` | Removida |

[Diff exato dos dois temas](changes.diff). O validador reconstrói essas seis operações a partir dos arquivos em [before/](before/), exige igualdade textual com o resultado e compara integralmente os objetos e os bytes com o baseline histórico. Não é uma substituição global de cores nem uma reversão de commit.

Todos os demais valores, fundos, bordas, seleções, foco, hover, 161 regras TextMate por tema e configurações semânticas permanecem intactos. O trecho textual de `tokenColors` é exatamente igual ao anterior à reversão. Os comentários MonoDracula mantêm `#797fa5`; o comentário TypeScript amostrado continua itálico no renderizador. Registro dos temas e versão do pacote foram verificados.

Strings e outros tokens originalmente amarelos continuam amarelos. A cor da linha selecionada no Quick Open também pode continuar amarela, conforme o tema original. A reversão remove o override uniforme dos matches; não remove amarelos da paleta ou da sintaxe.

## Validações efetivamente executadas

Ambiente: VS Code **1.146.0**, Node **24.18.0**, Windows, mesma instalação e mesmo conjunto congelado de 15 extensões para baseline e restaurado. O ensaio alternou cópias reais dos quatro temas em um único perfil temporário final. Caminhos, versões de extensões e hash dos settings pessoais estão em [session.json](session.json). Semantic highlighting foi ligado para TS e JS somente no perfil temporário, sem mudar os temas ou os settings pessoais.

| Verificação | Resultado | Evidência |
|---|---|---|
| JSONC válido, duplicatas, cores, propriedades reconhecidas e manifesto | Aprovado | [structural.json](structural.json), `audit/structural.json` |
| Somente seis reversões; preservação integral das demais melhorias | Aprovado, igualdade textual e com baseline histórico | `validate.cjs`, `changes.diff` |
| TextMate, scopes, fontStyle e configurações semânticas | Aprovado, igualdade profunda e textual | `structural.json` |
| Estilos TextMate resolvidos, seis linguagens, dois temas e dois conjuntos de grammars | Aprovado, 24 combinações iguais | `tokens.json`, `tokens-installed.json` |
| Quick Open focado e não focado, negrito e navegação por teclado | Aprovado, mesmos estilos do baseline; matches claros em peso 700 | `*-quick.json/png`, `*-quick-next.json/png` |
| TS, JS e HTML sem busca | Aprovado, ausência de decorações de busca e mesmos estilos por caractere | `*-clean.json/png` |
| Busca TS, JS e HTML: ocorrência atual, outras e próxima ocorrência | Aprovado, mesmos estilos por caractere e mesmas bordas/fundos; atual mantém borda distinta | `*-find.json/png`, `*-next.json/png` |
| Sintaxe dentro e fora dos matches | Aprovado contra o baseline anterior ao amarelo | [visual-comparison.json](visual-comparison.json) |
| Inspetor nativo TypeScript | Aprovado, `variable`, modificadores `declaration readonly`, mesmos scopes e cores | `*-inspector.json/png` |
| Busca do chat nativo, atual, outras e próxima | Aprovado, mesmos estilos computados do baseline | `*-chat.json/png`, `*-chat-next.json/png` |
| Search lateral, resultados dos fixtures | Aprovado quanto à preservação, mesmos textos e estilos computados | `*-search.json/png` |
| Activity Bar e abas ativas/inativas; Explorer com árvore focada | Aprovado na amostra visível, estilos iguais | `*-ui.json/png` |
| Settings pessoais e manifesto atuais | Aprovado, arquivos preservados | `visual-comparison.json`, `structural.json` |
| Guardas dos modos de auditoria | Aprovado, três rejeições esperadas sem editar temas ou registros históricos | [guard-tests.json](guard-tests.json) |

A comparação visual automatizada passou em **16 casos por tema**, com **64 screenshots reais** e respectivos dados. Ela compara os estilos efetivamente computados no editor por caractere, incluindo cor, peso e itálico. A segmentação em spans pode variar com as decorações, por isso a comparação não exige a mesma fragmentação de DOM. Nas buscas exige-se a presença real da ocorrência atual e de outras ocorrências; capturas sem esses estados não são aprovadas.

O inspetor nativo confirmou a mesma variável `contrastValue` antes e depois: `#B392F0` no MonoMin e `#BD93F9` no MonoDracula, com tipo semântico `variable` e modificadores `declaration readonly`. Isso comprova a execução do provedor nessa amostra; a igualdade de `tokenColors` sozinha não seria suficiente.

No editor e no chat, as variáveis CSS de `editor.findMatchForeground` e `editor.findMatchHighlightForeground` ficaram sem override. A sintaxe do editor e a herança do chat voltam a determinar o foreground, como no baseline. Os backgrounds das buscas não foram alterados. Não se declara melhoria de contraste nem se tenta corrigir problemas preexistentes.

## Capturas selecionadas

| Caso | Baseline anterior ao amarelo, renderizado novamente | Tema restaurado |
|---|---|---|
| Quick Open MonoMin | [baseline](evidence/monomin-baseline-quick.png) | [restaurado](evidence/monomin-restored-quick.png) |
| Busca TypeScript MonoMin | [baseline](evidence/monomin-baseline-ts-find.png) | [restaurado](evidence/monomin-restored-ts-find.png) |
| Busca TypeScript MonoDracula | [baseline](evidence/monodracula-baseline-ts-find.png) | [restaurado](evidence/monodracula-restored-ts-find.png) |
| Token semântico MonoDracula | [baseline](evidence/monodracula-baseline-inspector.png) | [restaurado](evidence/monodracula-restored-inspector.png) |
| Chat MonoDracula | [baseline](evidence/monodracula-baseline-chat.png) | [restaurado](evidence/monodracula-restored-chat.png) |
| Activity Bar, abas e Explorer MonoMin | [baseline](evidence/monomin-baseline-ui.png) | [restaurado](evidence/monomin-restored-ui.png) |

As imagens complementam a comparação de estilos; não foi exigida identidade binária de screenshots com cursor, caret e posições dinâmicas. As conversas de teste são fixtures estáticos locais importados no chat; nenhum prompt foi enviado a um serviço. Não houve CSS injetado nem edição de bundles.

## Adaptação controlada das auditorias

- `audit.cjs --comments-approved --yellow-reverted` verifica o estado restaurado integralmente e grava em `yellow-revert/audit/`.
- `tokens.cjs --comments-approved --yellow-reverted` usa o baseline pré-amarelo e exige igualdade dos estilos resolvidos, sem tolerância a diferenças.
- `yellow-highlights/validate.cjs --restored` encaminha para o validador desta reversão. Esse modo não permite aplicar amarelos.

Os modos históricos permanecem separados. `applied.json`, baselines, diffs e resultados antigos da implementação amarela não foram reescritos. O modo histórico que exige amarelos continua rejeitando os temas restaurados, como esperado. Flags conflitantes também são rejeitadas. O auditor geral ainda gera relatórios auxiliares de contraste; nenhuma sugestão desses relatórios foi aplicada ou reaberta para decisão nesta tarefa.

## Reprodução

Na raiz do projeto, com os caminhos da instalação e das extensões registrados pelos scripts. A porta local 9391 deve estar livre; a inicialização e o acesso à depuração do Electron precisam estar autorizados. Não execute `validate.cjs --apply` novamente sobre temas já restaurados: essa opção realiza a reversão uma única vez, com guardas contra sobrescrita.

```powershell
node docs/theme-modernization/yellow-revert/validate.cjs
node docs/theme-modernization/audit.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --yellow-reverted
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --yellow-reverted
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --yellow-reverted --installed
node docs/theme-modernization/yellow-revert/guard-tests.cjs
node docs/theme-modernization/yellow-revert/prepare.cjs
node docs/theme-modernization/yellow-revert/collect.cjs
node docs/theme-modernization/yellow-revert/collect-editor.cjs
node docs/theme-modernization/yellow-revert/collect-quick.cjs
node docs/theme-modernization/yellow-revert/collect-inspector.cjs
node docs/theme-modernization/yellow-revert/collect-ui.cjs
node docs/theme-modernization/yellow-revert/compare.cjs
node docs/theme-modernization/yellow-revert/cdp.cjs workbench close
git diff --check
```

O perfil temporário, cópias e dados são regeneráveis; as capturas existentes devem ser guardadas antes de uma nova execução que as substitua. Os scripts não alteram temas durante os testes visuais. Os coletores finais dão foco explícito ao editor, usam Ctrl+F e inserção nativa da consulta, esperam resultados reais e alinham o foco do Explorer e a posição do mouse no Quick Open. Tentativas iniciais afetadas por foco, contexto da paleta ou inicialização foram rejeitadas e substituídas por capturas válidas; não foram tratadas como regressões dos temas.

## Limites e pendências

Não foram exercitados todos os tokens semânticos, provedores, extensões, popups, estados de janela e consumidores indiretos de listas. Antigravity não foi aberto ou modificado nesta validação; sua interface interna não recebe aprovação visual por estes testes. Os problemas de contraste preexistentes do Search lateral e do chat não são corrigidos por essa reversão e não foram usados para ampliar o escopo.

Nenhuma regressão em relação ao baseline foi identificada nas amostras executadas. A abrangência além dessas amostras permanece não verificada. Não há alteração visual adicional aguardando aprovação neste trabalho: a execução terminou na reversão solicitada.
