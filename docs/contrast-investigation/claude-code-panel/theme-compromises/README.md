# Experimentos exclusivamente pelos temas — Claude Code e composer nativo

Data: 17/11/2026. VS Code **1.146.0**, Claude Code **2.1.325**, manifesto do projeto **2.3.5**. Esta rodada amplia a [comparação causal com Dark Modern](../dark-modern-comparison/README.md) e a [investigação final](../final-investigation/README.md). Os temas definitivos não foram modificados; todos os candidatos ficaram em cópias JSON de perfis descartáveis. Não houve injeção de CSS, patch de bundles, commit ou publicação.

**Resultado:** há candidatos recomendados para os blocos copiáveis e para o composer nativo. Para Send há compromissos viáveis na amostra, com alterações compartilhadas que exigem revisão visual e validação de Stop antes de uma aprovação abrangente.

Abra o [comparador de capturas reais](compare.html). A primeira linha mostra baseline MonoMin, candidato MonoMin, baseline MonoDracula, candidato MonoDracula e Dark Modern, no mesmo estado de Send habilitado. O seletor também oferece o composer nativo vazio/desfocado e preenchido/focado. As imagens podem ser abertas no tamanho original.

## Método e evidências

Foram reaproveitados os métodos, fixtures e cadeias de consumo anteriores. A triagem em [screening.json](screening.json), gerada por [screen.cjs](screen.cjs), antecedeu as capturas: comparou famílias de luminosidade, filtros reais de hover e todos os 21 tokens da fixture TypeScript. Dark Modern é uma referência funcional, sem copiar sua paleta.

Os ensaios reais usaram a mesma instalação, extensão, conversa sintética local, escala e zoom dentro de cada conjunto. Não houve envio de mensagens nem uso de histórico pessoal. Os controles foram acionados por CDP na instância descartável. Os dados guardam cores computadas, ancestrais, opacidades, filtros, geometria, regras e estados, não apenas os valores do JSON.

| Conjunto executado | Evidências | Verificações automatizadas | PNGs reais |
|---|---|---:|---:|
| Send, primários/secundários, blocos e integração Send + blocos | [measurements.json](measurements.json), [validation.json](validation.json), [evidence/](evidence/) | 26 | 35 |
| Composer nativo, Search, Settings e preservação do Claude | [composer/measurements.json](composer/measurements.json), [composer/validation.json](composer/validation.json), [composer/evidence/](composer/evidence/) | 13 | 28 |
| Total desta rodada | Dados completos e imagens comparativas | **39** | **63** |

Os checks confirmam invariantes e medições; a classificação visual abaixo também considera inspeção das imagens. Ela não equivale a aprovação do usuário.

As primeiras tentativas do conjunto Claude tinham um menu de modos aberto ou largura da webview alterada pelo bloqueio de grupos. Foram descartadas da amostra de aceitação, arquivadas localmente e excluídas por `.gitignore`; [context-correction.json](context-correction.json) registra a correção. O coletor aceito exige menu fechado e runtime/layout constantes. Diagnósticos em `diagnostics/` não são testes aprovados.

## 1. Send habilitado: causa e alternativas

O elemento investigado é `button[aria-label="Send message"]`, com SVG descendente e regras `sendButton_` / `sendIcon_` da extensão. Não é o seletor Auto nem Stop. A cadeia efetiva é:

- `button.foreground` → `--vscode-button-foreground` → foreground da seta via `currentColor`;
- `errorForeground` → `--vscode-errorForeground` → fundo de Send no modo Auto;
- regra de hover da extensão → filtro de brilho sobre o botão e seu conteúdo;
- `button.background` / `button.hoverBackground` → fundos dos primários nativos, não o fundo de Send Auto.

Os snapshots `*-normal.json`, `*-send-hover.json` e `*-send-focus.json` registram SVG, caminhos, estilos e regras correspondentes. Os cálculos incluem o filtro de hover. A seta habilitada não recebe a atenuação de disabled. O foco por teclado foi alcançado com **Tab real**, comprovado nos arquivos `*-send-keyboard.json`.

### Candidatos exatos e classificação

Somente as propriedades listadas diferem do respectivo tema original. `MutedButtons` muda o preenchimento dos primários; `SoftError` preserva os fundos escuros do MonoMin e muda também o papel compartilhado de erro.

| Tema/candidato | Propriedade → valor temporário | Classe e avaliação visual |
|---|---|---|
| MonoMin MutedButtons | `button.foreground` → `#101010`; `button.background` → `#808080`; `button.hoverBackground` → `#888888` | **B**, alternativa. Mantém tons neutros, mas deixa primários perceptivelmente mais claros. |
| **MonoMin SoftError** | `button.foreground` → `#EAEAEA`; `errorForeground` → `#d3636f` | **B, preferido para Send no MonoMin**. Preserva os fundos e a identidade monocromática dos primários; escurece o rosa de erro e clareia seu texto. |
| **MonoDracula MutedButtons** | `button.foreground` → `#14141b`; `button.background` → `#797fa5`; `button.hoverBackground` → `#898eaf` | **B, preferido para Send no MonoDracula**. Primário azul acinzentado, hover moderado; altera sua aparência de maneira perceptível. |

`#EAEAEA`, `#101010`, `#888888`, `#14141b` e `#797fa5` já pertencem às paletas. `#808080` é uma gradação neutra. `#898eaf` deriva de aproximadamente 12% de mistura entre `#797fa5` e `#fcfcfa`. `#d3636f` é um escurecimento RGB do rosa `#f97583`, sem introduzir outra família de matiz. A triagem encontrou o limite de aprovação em `#d4636f`; foi ensaiado o passo ligeiramente mais escuro `#d3636f` para ganhar margem na seta. Essa margem continua pequena.

### Contrastes efetivamente medidos

Relações WCAG sRGB, arredondadas apenas nesta tabela. Os arquivos JSON preservam os números completos. A referência é 3:1 para a seta e 4,5:1 para texto normal habilitado dos primários.

| Tema/candidato | Seta normal / foco | Seta hover | Texto primário normal | Texto primário hover / foco |
|---|---:|---:|---:|---:|
| MonoMin baseline | 1,17 | 1,08 | 6,14 | 5,32 |
| MonoMin MutedButtons | 7,16 | 7,86 | 4,82 | 5,37 |
| **MonoMin SoftError** | **3,02** | **3,04** | **15,82** | **13,70** |
| MonoDracula baseline | 1,23 | 1,11 | 5,09 | 4,59 |
| **MonoDracula MutedButtons** | **7,28** | **7,75** | **4,71** | **5,72** |
| Dark Modern baseline | 3,35 | 3,09 | 4,53 | 5,25 |

No MonoMin SoftError, a seta é `#eaeaea` sobre `#d3636f`; em hover, o filtro produz branco sobre `#e86d7a`. Os primários continuam com fundos `#101010` / `#1f1f1f`. O contraste alto do texto aproxima-o do texto principal do tema, sem clarear as superfícies. A recomendação considera esse efeito visual menor, não uma busca pelo maior número de contraste.

No MonoDracula, a seta é `#14141b` sobre `#ff74ab`; o hover produz aproximadamente `#16161e` sobre `#ff80bc`. Os primários usam `#797fa5` / `#898eaf`. O hover do primário fica em 5,72:1, muito menos chamativo que o preenchimento branco do candidato coordenado anterior, de aproximadamente 13,86:1. O rosa de erro original permanece intacto.

### Estados e consumidores compartilhados

| Estado/consumidor | Resultado efetivamente observado |
|---|---|
| Send habilitado, hover e foco por Tab | Executados para baselines e candidatos; todos os três candidatos atendem 3:1 nesses estados. |
| Primário nativo normal, hover e foco | Controle real SCM do workbench; candidatos atendem 4,5:1. Foco SCM foi aplicado por foco DOM real, não por CSS. O percurso Tab até esse controle não foi comprovado. |
| Foco de teclado em primário nativo | Executado também no primário de diálogo nativo, por Shift+Tab real a partir de Cancel; provas `*-modal-keyboard.json`. |
| Primário disabled | Desabilitado pela API do controle; `aria-disabled=true`, opacidade 0,4. Contrastes compostos: 1,79 Min Muted, 3,45 Min SoftError e 1,84 Drac Muted. Não se aplica a exigência de texto habilitado a disabled. |
| Secundário normal, hover e foco | Diálogo nativo real: foreground, background e estilos preservados. |
| Seletor Auto | Estilos preservados; não confundir sua aprovação com a de Send. |
| Consumidor real de `errorForeground` | Borda/halo de foco do próprio prompt Claude: Min SoftError passa de 6,87 para 5,03 contra o interior; mantém espessura e halo. Continua mais evidente que o contorno desfocado aprovado. Dracula não muda. |
| Texto nativo com papel de erro | Label de status de teste via API pública `ThemeColor('errorForeground')`: Min passa de 6,87 para 5,03; Dracula mantém 6,52. É um controle de teste, não uma mensagem de erro embutida do produto. |
| Erro sobre fundo do editor MonoMin | Cálculo adicional: 4,54 para SoftError. Não equivale a captura de uma mensagem de erro real em todos os contextos. |
| Stop / geração em andamento | **Pendente**. Não foi iniciada uma geração. A semelhança de tokens no código-fonte não valida Stop. |

O primário SCM foi criado por uma extensão de teste descartável com a proposta de API `scmActionButton`. A proposta só é necessária ao harness; as propriedades de cor são oficiais. O comando do botão é um no-op: nenhum commit foi criado. O estado disabled veio da API real, não de uma imitação por CSS.

O SCM amostrado já apresenta outline de foco transparente nos três baselines. O foco altera seu fundo para o estado de hover, mas não cria um anel adicional nesses candidatos. Isso é comportamento preexistente, não uma correção de foco validada por esta rodada; o diálogo nativo foi usado como evidência adicional do percurso de teclado.

**Limites da recomendação B:** Min SoftError passa por pouca margem e muda outros consumidores de erro; consumidores com override explícito podem continuar com o rosa anterior. Não foi comprovada a legibilidade de todos os erros sobre todos os fundos. Dracula mantém erros, mas muda todos os primários que herdam essas propriedades. Stop, execução em andamento e consumidores externos não amostrados precisam de revisão antes de uma aprovação abrangente. Não se recomenda alterar apenas `button.foreground` isoladamente: o efeito ruim nos primários já foi demonstrado na rodada anterior e não foi repetido sem hipótese nova.

## 2. Blocos copiáveis: separação sem perder contraste

DOM: `div[class*="codeBlockWrapper_"]`, com `pre > code`, tokens descendentes e botão de copiar. Não é o `code` inline fora de `pre`. A cadeia comprovada é `textCodeBlock.background` → `--vscode-textCodeBlock-background` → fundo do bloco; conversa usa `sideBar.background`; texto plano usa `foreground`. Código inline comum usa `textPreformat.background`. **Inline dentro de links também usa `textCodeBlock.background`**.

As bordas, raios, padding, fontes, estilos dos tokens e copiar foram registrados em `*-code.json` e não foram modificados pelos candidatos. A única diferença de JSON nesta frente é o fundo. A hipótese nova é **escurecer o bloco**, em vez de insistir nos clareamentos anteriores que perdiam contraste. Nenhuma cor de token foi compensada.

| Tema/candidato | `textCodeBlock.background` | Separação bloco/conversa | Texto plano | Menor contraste dos 21 tokens TS | Variação do mínimo | Classe |
|---|---|---:|---:|---:|---:|---|
| MonoMin baseline | `#151515` | 1,000 | 15,18 | 4,609 | — | Referência |
| MonoMin CodeFine | `#171717` | 1,019 | 14,90 | 4,525 | −1,83% | **C**: ganho visual pequeno, sem vantagem sobre escurecer |
| MonoMin CodeRaised | `#1b1b1b` | 1,060 | 14,32 | 4,347 | −5,68% | **C**: introduz mínimo abaixo de 4,5 com separação ainda fraca |
| **MonoMin CodeDark** | **`#00000099`** | **1,094** | **16,61** | **5,043** | **+9,42%** | **A, recomendado** |
| MonoDracula baseline | `#21222c` | 1,040 | 15,37 | 3,986 | — | Referência |
| MonoDracula CodeFine | `#232430` | 1,069 | 14,96 | 3,879 | −2,68% | **C**: pouca separação adicional e perda de contraste |
| MonoDracula CodeRaised | `#252633` | 1,098 | 14,56 | 3,776 | −5,26% | **B**, alternativa inferior à escura |
| **MonoDracula CodeDark** | **`#14141b`** | **1,116** | **17,84** | **4,627** | **+16,08%** | **A, recomendado** |
| Dark Modern baseline | Valor padrão resolvido | 1,254 | Ver JSON | 3,574 | Não comparável como meta | Referência funcional |

No MonoMin, preto com alfa 0,6 compõe aproximadamente `#080808` sobre a conversa `#151515`; reutiliza a família de preto já existente com outra opacidade. No Dracula, `#14141b` já existe na paleta. A superfície escura forma uma placa perceptível nas capturas sem chamar mais atenção que o conteúdo. Não foi necessário alcançar a separação do Dark Modern, que não é critério WCAG para essas duas superfícies.

**Todos os 21 tokens**, não apenas o mínimo, melhoraram de contraste nos candidatos escuros. Foregrounds, itálicos e pesos computados permaneceram idênticos ao baseline. Blocos curtos, longos e TypeScript foram inspecionados. O botão de copiar aparece no hover, inclusive no bloco TypeScript; não foi acionada escrita no clipboard.

Código inline comum permanece igual. O inline linkado passa a ter fundo escuro, com aumento de contraste: é um efeito compartilhado pequeno e explícito, agora admitido pelo escopo experimental. Não há isolamento absoluto entre bloco e inline linkado pela propriedade oficial. Editor e Side Bar nativos mantiveram os estilos computados amostrados nas variantes só de bloco.

## 3. Composer do chat nativo / Copilot Chat

### Causa demonstrada no componente real

Elemento: `.monaco-workbench .interactive-session .chat-input-container`. As regras da instalação e os estilos computados estão em [composer/source-evidence.json](composer/source-evidence.json) e nos snapshots `composer/evidence/*.json`.

```css
/* Regras relevantes do VS Code instalado, resumidas */
.interactive-session .chat-input-container {
  background: var(--vscode-input-background);
  border: var(--vscode-strokeThickness) solid var(--vscode-input-border, transparent);
}
.interactive-session .chat-input-container.focused {
  border-color: var(--vscode-focusBorder);
}
```

O composer padrão usa **`input.border` quando desfocado e `focusBorder` quando focado**. A borda é sólida de 1px; não existe shadow compensatória. O outline computado sem estilo de pintura não adiciona um contorno visível. Nos dois temas, a borda desfocada coincide com o fundo interno, explicando sua baixa percepção.

`inlineChatInput.border` **não controla esse composer**; continua controlando a borda aprovada do Claude Code. `inlineChat.border` atende outro contexto de inline chat no editor. `chat.input.border` não é uma cor registrada nesta instalação. `agentsChatInput.border` e `agentsChatInput.focusBorder` são registradas, mas o teste negativo com valores distintos no perfil temporário **não mudou esse composer padrão**: [agents-probe.cjs](composer/agents-probe.cjs) e evidências `agents-*`. Não confundir esse resultado com uma propriedade inválida ou com todos os painéis de agentes possíveis.

### Baseline e candidatos

Os fundos internos/externos são: MonoMin `#151515` / `#151515`; MonoDracula `#21222c` / `#1d1f28`; Dark Modern `#313131` / `#181818`. A composição considera o fundo real pintado sob a borda, não apenas o alfa do valor JSON.

| Tema/candidato | `input.border` desfocado | Cor pintada aproximada | Contraste interior / exterior | Classe |
|---|---|---|---:|---|
| MonoMin baseline | `#151515` | `#151515` | 1,00 / 1,00 | Problema preexistente |
| MonoMin Quiet | `#5b595c` | `#5b595c` | 2,63 / 2,63 | **B**, alternativa mais discreta, abaixo de 3 |
| **MonoMin Clear** | **`#888888ad`** | **`#636363`** | **3,05 / 3,05** | **A, recomendado na amostra** |
| MonoDracula baseline | `#21222c` | `#21222c` | 1,00 / 1,04 | Problema preexistente |
| MonoDracula Quiet | `#5e627e` | `#5e627e` | 2,65 / 2,76 | **B**, alternativa mais discreta, abaixo de 3 |
| **MonoDracula Clear** | **`#939293ad`** | **`#6f6e72`** | **3,12 / 3,25** | **A, recomendado na amostra** |
| Dark Modern | `#3c3c3c` | `#3c3c3c` | 1,18 / 1,61 | Referência funcional |

As candidatas Clear reutilizam os RGBs da borda Claude aprovada. O alfa `ad` no `input.border` do Dracula é deliberado para esta superfície; **não** substitui o `a6` do `inlineChatInput.border` definitivo. A versão Quiet é uma opção de menor destaque; Clear foi preferida pela identificação do campo nas capturas, e não por transformar contraste em objetivo isolado.

Foco permanece original em todos os candidatos: MonoMin `#888888`, 5,15 / 5,15; MonoDracula `#6272a4`, 3,36 / 3,49; Dark Modern `#0078d4`, 2,87 / 3,92. No Dracula a diferença de luminosidade é pequena, mas o foco azul e a borda neutra desfocada continuam visualmente distinguíveis. Hover não altera a borda nessa implementação.

### Estados e efeitos compartilhados executados

- Composer real vazio/desfocado, vazio/focado, preenchido/focado, preenchido/desfocado e hover: executados em três baselines e quatro variantes; conteúdo comprovado por linhas renderizadas do editor, sem envio.
- Search nativo: recebe o novo `input.border`; seu foco usa **outline** `focusBorder`, preservado. A borda de Search não muda de cor no foco, diferentemente do composer.
- Settings: campos numéricos amostrados possuem `settings.numberInputBorder` próprio e ficaram iguais; foregrounds/backgrounds também preservados. Não extrapolar a todos os campos de Settings.
- Aviso de onboarding acima do composer também consome o contorno compartilhado e fica mais delimitado. Não foram aplicadas compensações.
- Prompt Claude real desfocado: estilo computado da borda **idêntico** ao baseline em todos os candidatos; `inlineChatInput.border` permaneceu `#888888ad` / `#939293a6`.

O Copilot não estava autenticado. O composer real permitiu foco e digitação; o aviso de onboarding estava presente. Um modal inicial de confiança da fixture Claude foi cancelado, sem conceder confiança. Os snapshots preliminares bloqueados pelo modal não contam como execução dos estados. O buffer Chromium EditContext não foi tratado como fonte de verdade após limpar o modelo; as linhas renderizadas confirmam vazio/preenchido.

**Pendências:** layout autenticado sem onboarding, estado de geração, desabilitado e eventuais contornos animados. Não se afirma validação desses estados nem que a aparência com onboarding cubra todas as variantes do produto.

## 4. Decisão, propostas e integração

| Frente | MonoMin | MonoDracula | Decisão |
|---|---|---|---|
| Send | SoftError | MutedButtons | **B**: revisão visual explícita; Stop e demais consumidores não amostrados pendentes |
| Blocos copiáveis | CodeDark `#00000099` | CodeDark `#14141b` | **A**: separação com melhora de todos os tokens; aceitar fundo do inline linkado também escuro |
| Composer nativo | Clear `input.border=#888888ad` | Clear `input.border=#939293ad` | **A** na amostra: Search/onboarding ganham borda; foco e borda Claude preservados |

A = recomendado com base nos estados executados; B = compromisso visual sujeito a aprovação; C = rejeitado nesta rodada. Nenhuma classe autoriza aplicação permanente.

Diffs exatos, todos **apenas propostos** e verificados com `git apply --check`:

- [proposed-blocks.diff](proposed-blocks.diff): somente os dois fundos de bloco recomendados.
- [proposed-buttons.diff](proposed-buttons.diff): duas propriedades MonoMin e três MonoDracula para Send.
- [proposed-theme.diff](proposed-theme.diff): combinação Send + blocos, três propriedades MonoMin e quatro MonoDracula. Essa combinação foi efetivamente capturada nos estados normal, Send hover e prompt focado.
- [composer/proposed-border.diff](composer/proposed-border.diff): somente `input.border` dos dois temas.

O composer foi testado em um segundo perfil, independentemente da combinação Send + blocos. **Não houve teste real do conjunto das três frentes simultâneas**; os patches ficam separados para não representar uma integração não executada como aprovada. Antes da implementação conjunta, reproduzir esse conjunto final e validar Stop quando houver geração disponível.

Recomendação concreta: priorizar os dois fundos escuros e as bordas Clear do composer, após revisão das capturas. Para Send, usar SoftError no MonoMin se a mudança do papel de erro for aceita; no Dracula, MutedButtons é o melhor equilíbrio testado. Não repetir o foreground isolado nem o primário com hover branco. Nenhuma solução isolada para a seta existe nesses tokens compartilhados; nesta rodada seus efeitos foram administrados, medidos e expostos, não ignorados.

## 5. Preservação, reprodução e limitações

Os validadores comparam hashes dos dois temas, manifesto, settings pessoais e arquivos instalados relevantes do VS Code/Claude. Comparam também deltas das cópias, igualdade de TextMate e configuração semântica, estilos computados dos tokens, secundários, controles e amostras do editor/Side Bar. Os temas e o manifesto permanecem sem diff; a versão continua 2.3.5. Comentários `#797fa5`, bordas Claude aprovadas, busca, Search lateral e Antigravity não foram alterados nos arquivos definitivos.

Para conferir os resultados salvos sem abrir outra instância:

```powershell
node docs/contrast-investigation/claude-code-panel/theme-compromises/measure.cjs
node docs/contrast-investigation/claude-code-panel/theme-compromises/validate.cjs
node docs/contrast-investigation/claude-code-panel/theme-compromises/composer/measure.cjs
node docs/contrast-investigation/claude-code-panel/theme-compromises/composer/validate.cjs
```

Para uma nova coleta real na mesma instalação: `setup.cjs`, `prepare.cjs --fixture`, `control.cjs fixture`, `run.cjs`, medições e validação no diretório principal; o composer possui `setup.cjs`, `prepare.cjs --fixture`, `extend.cjs`, `run.cjs`, `agents-probe.cjs` e `settings-baselines.cjs` próprios. Os scripts registram em `session.json` os diretórios temporários e hashes. Inspecione os scripts antes de reproduzir em outra versão: caminhos de instalação, seletores com hash, porta CDP, disponibilidade de Auto e APIs do harness são dependências locais. A instância de teste deve ser fechada pelo seu `cdp.cjs workbench close` ao fim; não conectar os coletores à instância pessoal.

Limites adicionais: a fixture não representa todas as linguagens, renderizações ou extensões. A preservação de estilos dos 21 tokens no bloco e da amostra no editor não é uma nova auditoria universal de semantic highlighting. Nenhuma configuração semântica foi alterada. Não foram testados clipboard real, streaming, Stop, todos os consumidores nativos de erro, todos os campos compartilhados ou todos os dispositivos/escalas. O controle SCM e o label de erro são harnesses nativos declarados acima, sem simular aprovação de fluxos de produção não executados.

A investigação termina com propostas e evidências. Qualquer aplicação aos temas definitivos continua dependendo de aprovação explícita.
