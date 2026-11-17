# Claude Code versus Dark Modern — comparação causal

**A aparência diferente é produzida por propriedades oficiais dos temas, não por uma incapacidade dos JSONs.** Os testes reproduziram o par de cores da seta e as superfícies dos blocos do Dark Modern nos temas Mono, sem modificar o Claude Code. A conclusão anterior precisa desse limite: **a extensão é necessária para isolar as correções mantendo os outros consumidores intactos; não é obrigatória para produzir essas cores.**

Também se encontrou uma combinação ainda não testada que resolve o contraste da seta **e** dos botões nativos usando apenas a paleta. Ela muda a aparência global dos botões primários. Não foi aprovada como correção isolada. Para os blocos, as variantes JSON melhoram a separação, mas violam pelo menos um requisito de preservação.

Nenhuma alteração permanente em tema, borda aprovada, manifesto **2.3.5**, settings ou bundles. Sem CSS injetado, commit, tag ou publicação nesta rodada.

## Baseline e evidências

Execução em 16/11/2026, na mesma instância de **VS Code 1.146.0 / Claude Code 2.1.325**. **64 screenshots reais**, **16 verificações aprovadas** dos resultados esperados, incluindo os efeitos adversos. Isso não significa aprovação dos candidatos para implementação.

- [Comparador de três colunas](compare.html): baselines e candidatos contra o Dark Modern.
- [Valores computados, contrastes e composição](measurements.json).
- [Fonte instalada, heranças, registro e análise de luminância](source-evidence.json).
- [Verificações executadas](validation.json), [variantes JSON exatas](variants.cjs), [sessão/hashes](session.json) e [fixture](fixture.json).

O perfil, `CLAUDE_CONFIG_DIR`, workspace e transcript são descartáveis. O transcript sintético encerrado contém a mesma conversa, commit curto/longo, TypeScript e inline comum/linkado. Nos ensaios de envio há o mesmo rascunho não enviado e `disabled=false`; nos ensaios de código o rascunho está vazio nos três temas. Nenhuma mensagem foi enviada.

Os contextos coletados confirmam o mesmo viewport de webview **1082 × 804**, `devicePixelRatio=1`, `visualViewport.scale=1`, fonte de interface 13 px e mesmo user agent. Zoom não foi alterado. As versões e bundles permaneceram iguais por hash. Todos os temas são do tipo dark. As variantes são **arquivos JSON temporários registrados como temas**, sem customizações de CSS ou manipulação de `currentColor`.

O Dark Modern selecionado é o instalado em `theme-defaults/themes/dark_modern.json`, com cadeia `dark_vs.json → dark_plus.json → dark_modern.json`. As propriedades decisivas abaixo estão explicitamente em `dark_modern.json`; não resultam de um fallback secreto ou de um estilo especial pelo nome do tema.

## 1. Propriedades causais

| Propriedade oficial | Dark Modern instalado | MonoMin | MonoDracula | Consumidor relevante |
|---|---|---|---|---|
| `button.foreground` | `#ffffff` | `#939293` | `#939293` | Seta Send e foreground dos botões primários nativos |
| `errorForeground` | `#f85149` | `#f97583` | `#ff74ab` | Fundo do Send no modo Auto; outros estados de erro/foco |
| `button.background` | `#0078d4` | `#101010` | `#21222c` | Botão primário nativo; **não** determina o fundo do Send Auto |
| `button.hoverBackground` | `#026ec1` | `#1f1f1f` | `#282a36` | Hover/foco do botão primário nativo; Send Auto usa filtro de brilho |
| `textCodeBlock.background` | `#2b2b2b` | `#151515` | `#21222c` | Fundo do `pre` copiável **e** inline dentro de links |
| `sideBar.background` | `#181818` | `#151515` | `#1d1f28` | Fundo da conversa e da Side Bar nativa |
| `foreground` | `#cccccc` | `#eaeaea` | `#fcfcfa` | Texto plano dos blocos via `--app-primary-foreground` |
| `textPreformat.background` | `#3c3c3c` | Ausente no JSON; registro fornece `rgba(255,255,255,.1)` | Mesmo fallback registrado | Inline comum, não o `pre` |

As seis primeiras propriedades existem explicitamente nos três temas. Não estão ausentes, mal capitalizadas ou sem variável definida. A falta de `textPreformat.background` nos Mono explica uma diferença de **inline comum**, não a ausência de diferenciação do bloco copiável.

Refinamento importante da cadeia: `--app-primary-foreground` consome **`foreground`**, não `editor.foreground`, embora os valores coincidam nos temas examinados. A conversa consome **`sideBar.background`**, inclusive quando aberta em uma aba do editor; `editor.background` não é o fundo desse conteúdo. Esses papéis foram separados na investigação em vez de inferidos por semelhança de valores.

## 2. Botão de envio habilitado

### Elementos e cadeia completa

Alvo: `button.sendButton_gGYT1w[aria-label="Send message"][data-permission-mode="auto"] > svg.sendIcon_gGYT1w`. O path usa `fill="currentColor"`. O botão está habilitado, botão/SVG/ancestrais têm opacity 1. O controle de modo `button.footerButtonPrimary_gGYT1w`, texto **Auto**, é outro elemento. Stop não estava presente; sua regra `.stopIcon_gGYT1w` foi examinada em fonte, mas seu runtime não foi exercitado.

```text
button.foreground
  → --vscode-button-foreground → --app-button-foreground
  → .sendButton[data-permission-mode=auto] .sendIcon { color: ... }
  → path fill=currentColor → cor da seta

errorForeground
  → --vscode-errorForeground → --app-error-foreground
  → .sendButton[data-permission-mode=auto] { background-color: ... }
  → fundo do botão
```

As regras são as mesmas para os três temas. Não há necessidade de uma regra extra do Claude para o Dark Modern. Seu contraste melhora porque o par **branco/vermelho** é diferente do par **cinza/rosa**, e não porque `button.background` azul esteja sendo usado no Send.

| Tema baseline | Foreground computado | Background computado | Normal / foco sem hover | Hover `brightness(1.1)` |
|---|---|---|---:|---:|
| Dark Modern | `rgb(255,255,255)` | `rgb(248,81,73)` | **3,35:1** | **3,09:1** |
| MonoMin | `rgb(147,146,147)` | `rgb(249,117,131)` | **1,17:1** | **1,08:1** |
| MonoDracula | `rgb(147,146,147)` | `rgb(255,116,171)` | **1,23:1** | **1,11:1** |

As relações usam os estilos nominais realmente computados, incluindo o filtro sobre SVG **e** fundo, sem tratar pixels de antialiasing como a cor nominal. Foram capturados normal, hover e foco de teclado do próprio botão, sem click.

### Controles causais e candidatos JSON novos

| Variante | Delta temporário | Resultado da seta | Efeito/decisão |
|---|---|---|---|
| `Foreground` | Apenas `button.foreground=#EAEAEA` / `#fcfcfa` | **2,21 / 2,45:1** normais | Rejeitada: clarear com a paleta não atinge 3:1 sobre o rosa |
| `ReferenceSend` | `button.foreground=#ffffff` e `errorForeground=#f85149` | **3,35** normal/foco, **3,09** hover, exatamente como Dark Modern | Reprodução causal comprovada. Cores fora da paleta Mono; muda papel de erro e foco. **Controle diagnóstico, não proposta estética** |
| `Coordinated` | Foreground escuro e backgrounds primários coordenados, abaixo | **6,20 / 5,65** normais; **6,64 / 5,78** hover | Contraste da seta e dos botões nativos passa na amostra. Aparência global primária muda; não aprovada neste escopo de preservação |

O simples foreground escuro já havia sido rejeitado por prejudicar botões nativos. O novo teste não repete esse candidato isolado: coordena os três papéis necessários para manter contraste também em hover/foco.

| Propriedade | MonoMin: atual → coordenada | MonoDracula: atual → coordenada |
|---|---|---|
| `button.foreground` | `#939293` → `#1f1f1f` | `#939293` → `#282a36` |
| `button.background` | `#101010` → `#888888` | `#21222c` → `#939293` |
| `button.hoverBackground` | `#1f1f1f` → `#939293` | `#282a36` → `#fcfcfa` |

Todos esses valores já existem nas respectivas paletas. O fundo rosa do Send e o seletor Auto permanecem iguais. `button.background`/`button.hoverBackground` não alteram esse fundo rosa, mas tornam legível o foreground escuro nos botões nativos que compartilham o papel.

| Botão primário nativo real | Baseline normal | Baseline hover/foco | Coordenado normal | Coordenado hover/foco |
|---|---:|---:|---:|---:|
| MonoMin | 6,14 | 5,32 | **4,65** | **5,32** |
| MonoDracula | 5,09 | 4,59 | **4,59** | **13,86** |
| Dark Modern, referência | **4,53** | **5,25** | — | — |

O botão secundário nativo permaneceu igual nas três posições de interação. O primário passou de texto cinza/fundo escuro para texto escuro/fundo claro. No MonoDracula o hover ficou muito mais destacado. **Não foi constatada regressão de contraste nesses estados nativos**, mas há uma mudança de aparência/hierarquia que contraria preservar os demais botões como estão. Disabled, outros controles primários e Stop não foram validados; o token compartilhado também mudaria a cor do Stop pela regra de fonte, impedindo aprovar sua preservação apenas por inferência.

Mudar foreground e background primário, mas manter o hover original, deixaria texto `#1f1f1f`/`#282a36` sobre o mesmo valor no hover: **1:1**. Por isso o conjunto coordenado testado tem três propriedades, e não duas.

### Por que uma troca isolada de foreground não resolve os dois alvos

Com fundos atuais fixos e foreground opaco, a luminância necessária para texto nativo normal/hover é pelo menos **0,2367 / 0,2818**. Para a seta escura atingir 3:1 sobre o rosa, ela precisa ser no máximo **0,0817 / 0,0890**. As faixas não se sobrepõem. A alternativa de foreground muito claro exigiria luminância acima de 1; nem branco puro basta sobre o rosa atual. [Cálculo completo](source-evidence.json).

O Dark Modern evita esse conflito mudando também o fundo que envolve a seta: vermelho mais escuro. Seus botões nativos usam outro par, branco/azul. Copiar apenas o branco não copia essa combinação.

Transferir o vermelho também muda a cor de erro e o foco Auto. Como avaliação complementar, `#f85149` sobre `editor.background=#282a36` do MonoDracula daria **4,25:1**, abaixo de 4,5 para texto normal. Esse é um **contraste calculado de um papel compartilhado, não uma captura de texto de erro renderizado**. É mais um consumidor a validar, não uma alegação de regressão visual já executada nesse componente.

## 3. Blocos copiáveis

### DOM, propriedades e superfícies

```text
textCodeBlock.background → --vscode-textCodeBlock-background
 → --app-code-background → .codeBlockWrapper_-a7MRw pre { background: ... }

sideBar.background → --vscode-sideBar-background
 → --app-primary-background → fundo da conversa

foreground → --vscode-foreground
 → --app-primary-foreground → texto plano do pre
```

O wrapper `div.codeBlockWrapper_-a7MRw` é transparente nos três temas. A superfície pintada é o `pre`. Não há borda física: **0 px** em todos os baselines. Radius **4 px**, padding **8 px**, margin do wrapper **8px 0**, sem moldura especial do Dark Modern. Sua aparência melhor vem da diferença de fundos, não de uma borda escondida.

| Baseline | Background computado do `pre` | Fundo efetivo da conversa | Contraste entre superfícies | Texto plano | Menor token TypeScript |
|---|---|---|---:|---:|---:|
| Dark Modern | `rgb(43,43,43)` / `#2b2b2b` | `#181818` | **1,254:1** | 8,82 | 3,57 |
| MonoMin | `rgb(21,21,21)` / `#151515` | `#151515` | **1,000:1** | 15,18 | 4,61 |
| MonoDracula | `rgb(33,34,44)` / `#21222c` | `#1d1f28` | **1,040:1** | 15,37 | 3,99 |

Todos definem explicitamente `textCodeBlock.background` e `sideBar.background`. O fallback CSS `--app-code-background: var(--vscode-textCodeBlock-background,#7f7f7f26)` **não é acionado**: a variável oficial está definida. Não há diferença de borda, extensão, gramática, zoom ou seletor de tema que explique o resultado melhor do Dark Modern.

### Inline é um consumidor diferente, com acoplamento importante

O inline comum usa `--app-inline-code-background` → `textPreformat.background`. No Mono, a propriedade está ausente no JSON, mas o registro fornece branco a 10%; portanto também não se chega ao fallback literal do CSS. No Dark Modern o valor é explicitamente `#3c3c3c`.

Entretanto, a extensão aplica **`a code { background: var(--app-code-background) }`**. Inline dentro de link compartilha o fundo do bloco, mesmo que `textPreformat.background` seja definido separadamente. Por isso preencher essa propriedade ausente não isola o inline linkado nem corrige o problema do `pre`.

### Variantes JSON e efeitos reais

| Variante | MonoMin | MonoDracula | Resultado |
|---|---|---|---|
| `CodeAlpha` | `textCodeBlock.background=#303030cc`, RGB já na paleta | `textCodeBlock.background=#303442cc`, RGB já na paleta | Separação próxima do Dark Modern; muda inline linkado e reduz contraste de tokens |
| `Conversation` | Só `sideBar.background=#303030` | Só `sideBar.background=#37394a` | Mantém o fundo e contraste do código; muda conversa inteira, Side Bar nativa e composição do inline comum |
| `ReferenceCode` | `textCodeBlock.background=#2b2b2b`, `sideBar.background=#181818` | Mesmo par | Reproduz **exatamente** as superfícies Dark Modern nos dois temas. Controle diagnóstico com cores externas, não proposta de paleta |

Os candidatos com alpha reutilizam RGB da paleta e introduzem apenas transparência na cópia. Permitem testar separação próxima da referência sem repetir os fundos opacos mais claros anteriormente rejeitados.

| Experimento | Fundo efetivo do bloco / conversa | Separação | Menor token TypeScript |
|---|---|---:|---:|
| MonoMin `CodeAlpha` | aprox. `#2b2b2b` / `#151515` | **1,283** | **3,59**, antes 4,61 |
| MonoDracula `CodeAlpha` | aprox. `#2c303d` / `#1d1f28` | **1,247** | **3,32**, antes 3,99 |
| MonoMin `Conversation` | `#151515` / `#303030` | **1,384** | **4,61**, preservado |
| MonoDracula `Conversation` | `#21222c` / `#37394a` | **1,389** | **3,99**, preservado |
| Ambos `ReferenceCode` | `#2b2b2b` / `#181818` | **1,254**, igual ao Dark Modern | **3,57** |

As **21 partes de tokens TypeScript** mantiveram exatamente seus foregrounds e estilos, assim como os textos dos blocos e os controles de copiar. A perda de contraste vem do novo fundo, não de mudança TextMate/semântica. O contraste já baixo de alguns tokens no próprio Dark Modern demonstra que copiar sua separação de superfícies não garante preservar a legibilidade de todos os tokens nos temas Mono.

`CodeAlpha` preservou inline comum, mas mudou a pintura do inline linkado. `Conversation` preservou a pintura do `pre`, mas alterou a Side Bar inteira e, por composição do branco a 10%, o fundo efetivo do inline comum. `ReferenceCode` mudou ambos os papéis compartilhados. As capturas incluem commit curto, commit longo, TypeScript e hover de copiar; o clipboard não foi acionado.

**Nenhuma variante de bloco foi aprovada**: a primeira viola preservação do inline/contraste, a segunda viola evitar mudanças globais de fundo, e a terceira reúne efeitos globais e cores externas. Isso não significa que JSONs sejam incapazes de reproduzir o visual; os controles provam o contrário.

## 4. Alterações mínimas e aprovação

Não foi gerado um diff de implementação apresentado como seguro, pois nenhum candidato cumpre simultaneamente todos os requisitos de isolamento/preservação. Os deltas efetivamente testados estão em [variants.cjs](variants.cjs); foram aplicados exclusivamente às cópias temporárias.

Para uma decisão futura, há duas opções distintas:

- **Somente tema, aceitando maior alcance visual:** o conjunto coordenado de três propriedades resolve o contraste da seta sem falhar o texto nativo na amostra. Exige aprovar botões primários claros e validar seus outros estados/consumidores, incluindo Stop. Não há razão técnica para dizer que essa alternativa é impossível, nem para chamá-la de regressão de contraste onde os testes passaram.
- **Preservar a aparência dos demais componentes:** o tema não distingue consumidores do mesmo token. Uma correção somente da seta e um fundo/moldura somente do bloco exigem alterar o mapeamento/escopo na extensão ou ela expor tokens próprios. Os [protótipos isolados anteriores](../final-investigation/README.md) já validaram essa direção; não foram repetidos nem instalados nesta rodada.

## 5. Respostas objetivas

1. **Por que a seta melhora no Dark Modern?** Porque `button.foreground=#ffffff` é pintado sobre `errorForeground=#f85149`, dando 3,35:1, enquanto os Mono pintam cinza sobre rosa, dando 1,17/1,23:1. O azul `button.background` não é o fundo do envio Auto.
2. **Por que o bloco se distingue?** Porque `textCodeBlock.background=#2b2b2b` difere de `sideBar.background=#181818`. Não há borda especial, variável ausente ou fallback não reconhecido nos Mono: eles definem fundos iguais ou muito próximos.
3. **É reproduzível apenas pelo tema?** **Sim.** Os controles de referência reproduziram exatamente as cores/contrastes da seta e as superfícies do Dark Modern. **Não há, nos candidatos verificados, reprodução isolada que preserve todos os outros consumidores pedidos.**
4. **Quais mudanças mínimas?** Para paridade cromática da seta, duas propriedades (`button.foreground` e `errorForeground`); para a alternativa da paleta com contraste nativo mantido, três papéis de botão. Para destacar o bloco, uma propriedade de fundo já basta; para reproduzir exatamente seu par de superfícies, duas (`textCodeBlock.background`/`sideBar.background`). Cada opção tem o alcance demonstrado acima.
5. **O que bloqueia a implementação neste escopo?** Mudança global de aparência dos botões primários e Stop não validado; alteração do papel de erro ao copiar o vermelho; redução do contraste de tokens e mudança do inline linkado ao elevar o fundo do bloco; mudança global de conversa/Side Bar ao alterar seu fundo. O candidato coordenado não é bloqueado por contraste na amostra, e sim pela necessidade de uma decisão visual mais ampla e de validação adicional.

A recomendação é manter os arquivos definitivos intactos e decidir explicitamente se a nova aparência global dos botões é aceitável. Para os blocos, manter o requisito de exclusividade continua favorecendo uma correção no componente da extensão. Isso é uma escolha de escopo e preservação, sustentada pelas comparações, não uma limitação genérica da API de temas.

## Validação e limites

As 16 verificações em [validate.cjs](validate.cjs) comprovam os baselines equivalentes, somente os deltas declarados nas 12 cópias, reprodução causal, resultados positivos da combinação coordenada, efeitos adversos dos blocos, ausência de CSS injetado e integridade dos originais. Hashes confirmam manifesto 2.3.5, bundles instalados/copiados, settings pessoais e bordas aprovadas `#888888ad` / `#939293a6` intactos. Nenhuma regra TextMate ou configuração semântica mudou.

Não foram gerados Stop/ocupado, disabled dos botões nativos, todos os widgets primários ou erros de texto reais. Esses estados continuam pendentes; não foram classificados como aprovados. O botão Auto de seleção de modo permaneceu igual na combinação coordenada. Os rótulos de tema e sua mudança fazem parte do experimento; o restante do ambiente, conversa e estado-alvo foi mantido constante e registrado em `*-context.json`.

## Reproduzir

Da raiz do projeto, na instalação registrada. Preserve esta pasta antes de refazer, pois a execução substitui seus próprios artefatos. Os diretórios temporários são novos a cada preparação; nenhum setting pessoal é escrito.

```powershell
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/prepare.cjs --fixture
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/control.cjs fixture
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/control.cjs layout
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/control.cjs search
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/run.cjs
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/source.cjs
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/measure.cjs
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/validate.cjs
node docs/contrast-investigation/claude-code-panel/dark-modern-comparison/cdp.cjs workbench close
```

O coletor espera a disponibilidade real de Auto. Se o modo não aparecer, registre a pendência; não force flags ou DOM. A instância descartável foi encerrada ao terminar. Não há diff aplicado aos temas definitivos nem proposta silenciosamente promovida a implementação.
