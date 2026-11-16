# Implementação — borda do prompt do Claude Code

Implementadas exclusivamente as duas propriedades autorizadas. **Nenhuma cor existente, regra TextMate, configuração semântica ou versão foi alterada.** A implementação corresponde ao candidato aprovado nos estados e consumidores amostrados. Sem commit, tag ou publicação.

## Baseline registrado antes de editar

O [registro inicial](baseline.json) identifica o commit `0cb60ab0dc54c5d25a23d1398bfeef6e608f061e`, os SHA-256 dos arquivos, os finais de linha CRLF e o estado do Git. Os temas eram iguais aos arquivos dos experimentos, inclusive por hash. A propriedade estava ausente em ambos. O manifesto já estava em **2.3.5**. A pasta da investigação anterior estava não rastreada e foi preservada.

| Tema | Propriedade explícita anterior | Fallback efetivo anterior | Valor implementado |
|---|---|---|---|
| MonoMin | Ausente | `input.border`: `#151515` | `inlineChatInput.border`: **`#888888ad`** |
| MonoDracula | Ausente | `input.border`: `#21222c` | `inlineChatInput.border`: **`#939293a6`** |

As alphas são as já aprovadas; não houve nova seleção de cor. A implementação apenas acrescenta uma linha no objeto `colors` de cada tema, preservando CRLF e todos os demais bytes.

## Diff exato

O [diff completo](changes.diff) contém dois acréscimos, sem remoções:

```diff
--- a/themes/MonoMinTheme.json
+++ b/themes/MonoMinTheme.json
@@ -2,6 +2,7 @@
 	"$schema": "vscode://schemas/color-theme",
 	"type": "dark",
 	"colors": {
+		"inlineChatInput.border": "#888888ad",
 		"button.secondaryBackground": "#101010",
 		"button.secondaryForeground": "#939293",
 		"button.secondaryHoverBackground": "#1f1f1f",
--- a/themes/MonoDraculaTheme.json
+++ b/themes/MonoDraculaTheme.json
@@ -2,6 +2,7 @@
 	"$schema": "vscode://schemas/color-theme",
 	"type": "dark",
 	"colors": {
+		"inlineChatInput.border": "#939293a6",
 		"button.secondaryBackground": "#21222c",
 		"button.secondaryForeground": "#939293",
 		"button.secondaryHoverBackground": "#282a36",
```

## Validações estruturais e de tokens

As **10 verificações estruturais** de [validate.cjs](validate.cjs) passaram; resultado em [structural.json](structural.json). A comparação usa o commit registrado, valida seu hash reconstruindo os finais de linha e exige o acréscimo textual exato. Não há uma lista genérica que permita outras mudanças.

Foram verificados JSONC válido, sintaxe AST, ausência de chaves duplicadas, formatos hexadecimais e registro de todas as propriedades na instalação do VS Code. Os **161 registros TextMate de cada tema** permanecem iguais em profundidade e em bytes desde `tokenColors` até o fim do arquivo: scopes, ordem, cores e estilos preservados. Os comentários `#797fa5` e seus estilos originais do MonoDracula foram conferidos explicitamente, sem impor itálico a regras que não o tinham.

Também foram conferidos `semanticHighlighting`/`semanticTokenColors`, todas as cores preexistentes, foregrounds restaurados do Quick Open, ausência de `editor.findMatchForeground` e `editor.findMatchHighlightForeground`, manifesto **2.3.5** e registro dos temas. Os hashes dos settings pessoais e dos bundles originais do VS Code/Claude Code permaneceram iguais.

O teste histórico `docs/theme-modernization/yellow-revert/validate.cjs` foi executado e **não passou**, pois exige igualdade textual com o snapshot completo da reversão amarela. Seu erro `Unauthorized textual delta` está em [historical-test.json](historical-test.json). Não foi modificado nem apresentado como aprovado. Ele não é um teste cumulativo que aceite a borda recém-autorizada; os invariantes relevantes de busca, tokens e cores foram revalidados estritamente em `validate.cjs`, permitindo somente o delta deste relatório. Os demais scripts históricos que escrevem auditorias de outras etapas não foram executados como validadores desta implementação.

## Comparação visual executada

Ambiente real: **VS Code 1.146.0 / Claude Code 2.1.325**, perfil novo, cópias temporárias da extensão e dos temas, transcript sintético local encerrado e configurações pessoais intactas. A fixture contém blocos curtos/longos de commit, TypeScript e código inline comum/linkado. Não houve envio de mensagem, CSS injetado ou patch em bundles.

Foram comparadas três variantes para cada tema, na mesma instância:

1. **Baseline:** JSONC do commit anterior registrado, sem nova propriedade ou override.
2. **Aprovado:** esse baseline com o valor aprovado em `workbench.colorCustomizations`, somente no perfil temporário.
3. **Atual:** cópia byte a byte do tema definitivo atualizado, **sem override**.

O [comparador de capturas](compare.html) apresenta os três lado a lado. Há **54 capturas do conjunto final** e mais nove capturas preliminares preservadas em [evidence/initial](evidence/initial). Todos os estados finais têm screenshots e estilos computados; os dados semânticos e inventários compartilhados têm JSON adicional. As **15 verificações de comparação visual/dados** passaram: [visual-validation.json](visual-validation.json).

A primeira amostra MonoMin conservava um chip de contexto `example.ts`, removido depois que a navegação mudou o editor ativo. Isso acrescentava uma divisória sem borda de largura positiva e alterava o texto do rodapé. A validação parou nessa diferença de cenário. Ela foi diagnosticada, a evidência inicial foi conservada e **somente o baseline MonoMin** foi recapturado após estabilizar a navegação editor → conversa. Não houve ajuste compensatório de tema nem exclusão desse consumidor para fazer o teste passar. O coletor agora estabiliza esse contexto antes de iniciar os ensaios.

### Borda e hierarquia

| Estado | MonoMin: contraste com interior | MonoDracula: contraste com interior | Resultado |
|---|---:|---:|---|
| Baseline desfocado | 1,00:1 | 1,00:1 | Problema anterior confirmado |
| Atual desfocado | **3,20:1** | **3,09:1** | Igual ao candidato aprovado |
| Atual em hover, sem foco | **3,20:1** | **3,09:1** | Hover preservado, sem intensificação nova |
| Atual com foco Manual | **5,85:1** | **5,06:1** | Cor `#d97757` e halo originais preservados |
| Atual com foco Plan | **5,15:1** | **3,36:1** | `#888888` / `#6272a4` e halo originais preservados |
| Atual com foco Auto | **6,87:1** | **6,27:1** | `#f97583` / `#ff74ab` e halo originais preservados |

No MonoMin, o contorno desfocado efetivo é aproximadamente `#666666` contra interior/conversa `#151515`: 3,20:1 dos dois lados. No MonoDracula, aproximadamente `#6e6e72` contra interior `#21222c` e conversa `#1d1f28`: **3,09:1 / 3,22:1**. O background sob a pintura da borda é o do fieldset (`#1f1f1f` / `#282a36`), distinto da camada interna visível. A medição considera essa composição, conforme [measurements.json](measurements.json).

O VS Code expõe as alphas aprovadas à webview como `.68` e `.65`; foram usadas as cores computadas efetivas. A borda continua **1 px**, radius **8 px**, com outline de estilo `none`. Sem foco há a sombra preta original; com foco permanecem o halo colorido de **3 px a 12%** e a sombra a 20%. No Plan MonoDracula a diferença de luminância é menor, mas o foco muda de cinza para azul e ganha halo, visível na captura. Não se equipararam estados ativos e inativos.

O estado vazio manteve o botão de envio efetivamente desabilitado, com opacity `.4`; um rascunho local não enviado permitiu verificar o botão habilitado. Não se provocou um turno ocupado para desabilitar o próprio prompt. Nenhum resultado foi inferido para esse estado não exercitado.

### Efeitos indiretos observados

Os sete consumidores presentes no DOM final correspondem à amostra aprovada. Seis tiveram somente a borda computada alterada:

- Container do prompt.
- Divisória superior do rodapé do prompt.
- Contorno da mensagem do usuário.
- Contorno dos três botões de copiar código.

O controle de copiar resposta tem borda de 0 px e permaneceu igual. Os inventários `*-shared.json` mostram igualdade entre a implementação e o preview aprovado, e diferença restrita à cor da borda contra o baseline. Não foram adicionadas molduras aos blocos `pre` nem realizadas outras compensações.

### Componentes e syntax highlighting preservados na amostra

Nos três blocos por tema, texto, backgrounds, padding, radius, foregrounds e as 21 partes de tokens TypeScript permaneceram iguais ao baseline. Inline comum e inline linkado ficaram iguais. O controle de copiar apareceu em hover; o clipboard não foi acionado. O Auto habilitado conservou os estilos do botão, SVG e paths, inclusive seu problema de contraste preexistente — não foi corrigido nesta etapa.

O Search nativo teve o mesmo estilo de input antes/depois. Os spans renderizados do arquivo `example.ts` mantiveram texto, foreground, background, itálico, peso e decoração. Reutilizou-se o comando existente **`themeAudit.capture`** de `visual-probe/extension.cjs`, copiado sem alteração para o probe temporário: o provedor semântico TypeScript retornou a mesma legenda e os mesmos dados `[1,13,5,7,9]` no baseline e no tema atualizado; fonte, documento e versões das extensões permaneceram iguais.

A configuração semântica permaneceu **`configuredByTheme`**, sem override semântico novo. Retorno do provedor não demonstra, isoladamente, que esses tokens foram aplicados semanticamente; o teste confirma a igualdade dos dados e dos estilos realmente renderizados nesta configuração. Não se forçou semantic highlighting ligado nesta etapa.

## Matriz de resultados e limites

| Verificação | Classificação |
|---|---|
| Somente duas propriedades autorizadas; JSONC, registro e cores válidos | **Aprovado** |
| TextMate integral, configuração semântica e manifesto 2.3.5 | **Aprovado** |
| Repouso, hover e foco Manual/Plan/Auto iguais ao candidato | **Aprovado na amostra real** |
| Foco mais evidente que repouso; envio vazio disabled preservado | **Aprovado na amostra real** |
| Seis contornos compartilhados previstos | **Mudança deliberada autorizada**, igual ao experimento |
| Backgrounds/código/inline/Auto e Search nativo amostrados | **Preservados** |
| Spans do editor e dados do provedor semântico | **Preservados na configuração examinada** |
| Chip de contexto na captura inicial | **Variação do cenário**, diagnosticada e recapturada; sem regressão de tema |
| Teste histórico de igualdade da reversão amarela | **Não aprovado para o estado novo**, incompatibilidade de snapshot documentada |
| Prompt ocupado, Stop/active, diálogos de permissões e notebook chat | **Não exercitados** |
| Quick Open, buscas completas e Antigravity em runtime nesta rodada | **Não reexercitados**; propriedades preservadas por igualdade exata |

Não foram identificadas regressões atribuíveis à implementação na amostra executada. Isso não equivale a certificar todos os consumidores latentes de `inlineChatInput.border` ou todos os componentes da extensão. O alcance compartilhado é o já aceito na autorização; não houve tentativa de isolar o prompt por uma propriedade nova ou de compensar outros componentes.

## Reexecução

Os scripts usam a instalação registrada em `baseline.json` e Node com `fetch`/`WebSocket`. Execute da raiz. Para uma nova rodada, preserve os artefatos desta pasta antes de substituir a sessão/evidências. `snapshot.cjs` é um registro pré-implementação e recusa sobrescrever o baseline; não deve ser repetido depois da mudança.

```powershell
node docs/theme-modernization/claude-code-prompt-border/validate.cjs
node docs/theme-modernization/claude-code-prompt-border/prepare.cjs --fixture
node docs/theme-modernization/claude-code-prompt-border/control.cjs fixture
node docs/theme-modernization/claude-code-prompt-border/run-visual.cjs
node docs/theme-modernization/claude-code-prompt-border/measure.cjs
node docs/theme-modernization/claude-code-prompt-border/validate-visual.cjs
node docs/theme-modernization/claude-code-prompt-border/cdp.cjs workbench close
```

Espere a inicialização da extensão e a disponibilidade real de Auto antes do coletor. Se não estiver disponível, registre a pendência; não force atributos ou configurações privadas. O coletor não altera configurações pessoais ou semânticas e desfaz seus overrides de cor temporários. A instância de teste foi encerrada, conservando os arquivos temporários para inspeção.

Referências consultadas: [diagnóstico](../../contrast-investigation/claude-code-panel/README.md), [experimentos aprovados](../../contrast-investigation/claude-code-panel/experiments/README.md) e [patch aprovado](../../contrast-investigation/claude-code-panel/experiments/proposed-theme.diff). A implementação aguarda revisão do usuário antes de qualquer commit ou publicação.
