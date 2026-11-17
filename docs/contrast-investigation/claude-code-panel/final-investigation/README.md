# Investigação final — seta de envio e blocos copiáveis

**Resultado:** as duas correções isoladas são tecnicamente viáveis na extensão e foram renderizadas na webview real. O protótipo da seta atingiu mais de 3:1 nos estados habilitados examinados. A moldura interna de 1 px delimitou os blocos sem mudar seus fundos ou o código inline. **Nenhuma das duas correções tem configuração oficial isolada disponível na versão instalada.** Não foram aplicadas permanentemente.

Execução em 16/11/2026: **VS Code 1.146.0 / Claude Code 2.1.325**, com **60 capturas reais e 19 verificações aprovadas na amostra**. Os temas, manifesto **2.3.5**, settings pessoais e bundles instalados/copiados permaneceram intactos, conferidos por hash. `inlineChatInput.border` continua **`#888888ad` / `#939293a6`**. Sem commit ou publicação.

## O que foi acrescentado à investigação

Os [experimentos anteriores](../experiments/README.md) já descartaram alterações globais de `button.foreground`, `errorForeground`, `icon.foreground`, fundos compartilhados de código e tokens de borda não consumidos. Esses candidatos **não foram repetidos**.

A lacuna era a ausência de renderização das propostas **isoladas**. A restrição desta rodada proíbe injeção permanente, permitindo o teste transitório: uma folha `<style id="claude-contrast-transient">` foi acrescentada **somente em memória na webview do perfil descartável**, removida entre variantes e no `finally` do coletor. Não houve edição de bundles, nem mesmo nas cópias, configuração de startup, customização pessoal ou mecanismo persistente de CSS. Isso é um **protótipo de uma mudança upstream**, não uma API suportada para instalar a correção.

Usou-se transcript sintético local, já encerrado, com texto curto/longo, TypeScript e inline comum/linkado. O botão foi habilitado com um rascunho local **não enviado**. O coletor esperou a disponibilidade real de Auto, sem forçar atributos, flags ou contas. A instanciação nova do baseline é necessária para comparar essas regras isoladas e já contém a borda de prompt implementada.

- [Comparador antes/depois](compare.html), com MonoMin, MonoDracula e Dark Modern.
- [Medições](measurements.json), [validação](validation.json) e [inventário técnico de fonte/configurações](source-evidence.json).
- [Sessão, versões e hashes](session.json), [fixture](fixture.json) e [comprovação da remoção final](cleanup.json).
- [Protótipos CSS exatos](prototypes/combined.css), [diff de regras representativas](upstream-proposal.diff).

## 1. Botão de envio: identidade e causa

O alvo é **a seta de envio de mensagem habilitada em uma sessão no modo Auto**. São componentes diferentes:

| Componente | Elemento observado | Função / estado |
|---|---|---|
| **Envio** | `button.sendButton_gGYT1w[aria-label="Send message"][data-permission-mode="auto"]` | Envia o rascunho; `disabled=false` nos testes da seta |
| **Seta** | `svg.sendIcon_gGYT1w`, path com `fill="currentColor"` | Ícone funcional do botão de envio |
| **Controle Auto** | `button.footerButtonPrimary_gGYT1w`, texto `Auto` | Seletor de modo/permissões; não envia a mensagem |
| **Stop** | Regra de fonte `.stopIcon_gGYT1w`; controle esperado com `aria-label="Stop response"` | Interrompe uma resposta; **não estava presente e não foi exercitado** |

O DOM e SVG completos estão, por exemplo, em [monomin-send-baseline-normal-identity.json](evidence/monomin-send-baseline-normal-identity.json). `data-permission-mode=auto` qualifica o modo da sessão; não transforma o botão de envio no seletor Auto. Os nomes com hashes são evidência da versão, não uma API pública.

### Cadeia de cores comprovada

```text
button.foreground → --vscode-button-foreground → --app-button-foreground
                  → regra explícita do SVG → path fill=currentColor

errorForeground   → --vscode-errorForeground → --app-error-foreground
                  → background do botão Send no modo Auto
```

O botão e o SVG habilitados têm opacity **1**; os ancestrais medidos também têm opacity 1. O problema não é uma atenuação de estado disabled ou um `currentColor` desconectado: a cor herdada pelo path é justamente a cor insuficiente explicitamente aplicada ao SVG. O hover aplica `brightness(1.1)` ao botão e a seu conteúdo. O foco de teclado foi capturado no próprio botão, com o ponteiro afastado e **sem acioná-lo**.

### Contrastes medidos no componente real

| Tema | Baseline: seta / fundo normal | Baseline normal e foco | Baseline hover | Protótipo: seta normal / fundo mantido | Protótipo normal e foco | Protótipo hover |
|---|---|---:|---:|---|---:|---:|
| MonoMin | `#939293` / `#f97583` | **1,17** | **1,08** | `#1f1f1f` / `#f97583` | **6,20** | **6,64** |
| MonoDracula | `#939293` / `#ff74ab` | **1,23** | **1,11** | `#282a36` / `#ff74ab` | **5,65** | **5,78** |
| Dark Modern | `#ffffff` / `#f85149` | **3,35** | **3,09** | `#1f1f1f` / `#f85149` | **4,92** | **5,15** |

No hover, a seta/fundo efetivos são, respectivamente: MonoMin `#222222`/`#ff8190`; MonoDracula `#2c2e3b`/`#ff80bc`; Dark Modern `#222222`/`#ff5950`. As relações foram calculadas com sRGB a partir dos estilos computados, incluindo o filtro de brilho. Não são amostras de antialiasing das bordas do desenho.

No baseline Mono, o foreground global foi escolhido para botões escuros, mas é reaproveitado sobre uma cor de erro clara usada como fundo. No Dark Modern, branco sobre o vermelho original já atende à referência de 3:1. Essa diferença explica por que a combinação falha especificamente nos temas Mono sem exigir mudança no rosa.

### Candidato isolado testado

```css
/* Regra-fonte equivalente; no ensaio foram usados os hashes reais. */
.sendButton[data-permission-mode="auto"] .sendIcon {
  color: var(--app-tool-background);
}
```

`--app-tool-background` já consome **`editor.background`**. O candidato reutiliza essa tonalidade escura, alterando apenas a cor do SVG da seta. Background, foreground do próprio botão, opacity, filtro, foco do prompt e controle Auto ficaram exatamente iguais. O envio Manual foi exercitado com e sem a regra e permaneceu igual. Os botões nativos primário/secundário de um diálogo real também ficaram iguais, nos três temas.

**O protótipo não inclui `.stopIcon`.** Isso refina a proposta anterior que agrupava Send/Stop: nesta investigação não há evidência de runtime que autorize tratar o Stop como se fosse a mesma captura. Nenhum click de envio/active ou turno de modelo foi produzido.

**Efeito deliberado no Dark Modern:** a mesma regra troca sua seta branca por escura, embora o baseline já tenha contraste suficiente. Não é perda de contraste, mas é uma mudança visual adicional; o patch não deve ser apresentado como universalmente neutro. Um upstream que queira preservar todos os casos já adequados deve condicionar a troca à insuficiência do contraste resolvido. Esse mecanismo adaptativo **não foi implementado nem testado** nesta rodada. A regra CSS simples é a menor mudança comprovada para a amostra, não uma garantia para temas claros, alto contraste ou qualquer valor possível de `editor.background`/`errorForeground`.

**Recomendação mínima:** corrigir upstream o foreground **somente da seta de envio Auto**, mantendo o fundo rosa e demais controles. Portar a regra testada ao módulo-fonte do componente, separando o caso Auto da regra compartilhada com Plan/bypass ou aplicando-a depois dela. Validar outros temas suportados antes de distribuir. Nenhum papel oficial específico para a seta, opção de aparência ou token privado configurável pelo usuário foi encontrado no manifesto/consumidores instalados. Alterar apenas o tema continua sem um caminho isolado seguro.

## 2. Blocos copiáveis: container e candidatos exclusivos

Alvo: `div.codeBlockWrapper_-a7MRw > pre > code`. O botão de copiar é irmão de `pre`, dentro do wrapper. Inline comum e `a code` não descendem desse `pre`.

O baseline tem padding **8 px**, radius **4 px**, wrapper margin **8px 0**, overflow horizontal automático, borda **0 px** e box-shadow **none**. O background vem de `--app-code-background` → **`textCodeBlock.background`**. Os fundos efetivos continuam `#151515` no MonoMin, `#21222c` no MonoDracula e `#2b2b2b` no Dark Modern; as conversas usam `#151515`, `#1d1f28` e `#181818`.

Os ensaios anteriores já demonstraram que mudar `textCodeBlock.background` também atinge inline dentro de links e pode reduzir contraste de tokens. Não se repetiu esse caminho nem se usou essa propriedade como correção final. Tampouco se repetiram os overrides de `widget.border`, `editorWidget.border` e `textBlockQuote.border`, que não criam uma borda neste `pre`.

### Candidatos renderizados nesta rodada

```css
/* Preferência: moldura interna de 1 px, exclusiva do bloco. */
.codeBlockWrapper > pre {
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--app-secondary-foreground) 55%, transparent);
}
```

```css
/* Alternativa efetivamente testada: delimitador lateral de 2 px. */
.codeBlockWrapper > pre {
  box-shadow: inset 2px 0 0 0
    color-mix(in srgb, var(--app-secondary-foreground) 55%, transparent);
}
```

Os valores são os já propostos anteriormente, agora **renderizados**, em vez de apenas calculados. `--app-secondary-foreground` consome `descriptionForeground`: `#939293` nos temas Mono e `#9d9d9d` no Dark Modern. A sombra é interna e não altera o box model; os 8 px de padding mantêm o texto afastado da moldura. Os estilos computados comprovam suporte a `color-mix` neste runtime, sem inferir compatibilidade com toda versão antiga.

| Tema | Fundo bloco / conversa | Separação das superfícies original | Moldura efetiva aproximada | Moldura contra bloco / conversa | Texto plano original e preservado | Menor contraste TypeScript preservado |
|---|---|---:|---|---:|---:|---:|
| MonoMin | `#151515` / `#151515` | 1,00 | `#5a5a5a` | **2,64 / 2,64** | 15,18 | 4,61 |
| MonoDracula | `#21222c` / `#1d1f28` | 1,04 | `#606065` | **2,51 / 2,61** | 15,37 | 3,99 |
| Dark Modern | `#2b2b2b` / `#181818` | 1,25 | `#6a6a6a` | **2,61 / 3,27** | 8,82 | 3,57 |

A moldura/delimitador é separação decorativa, não um ícone funcional; não se impôs a ela uma meta automática de 3:1. A inspeção das capturas mostrou o container delimitado com ambas as variantes, sem a troca de superfícies ou destaque cromático novo. A moldura completa é a preferência na amostra porque mostra o limite do bloco inteiro, inclusive commits longos; a lateral também funciona e oferece uma apresentação mais leve, mas sinaliza somente a margem inicial. Essa preferência é uma avaliação visual, não um resultado deduzido exclusivamente da relação de contraste.

### Preservação comprovada

- Os três blocos — commit curto, commit longo e TypeScript — mantiveram texto, foreground, background, padding, radius, largura, altura, scrollWidth e clientWidth.
- As **21 partes de tokens TypeScript** permaneceram idênticas em estilo; seus contrastes também. O verde de comentários da webview é o do renderizador da extensão, não a regra TextMate `#797fa5` do MonoDracula. O contraste já baixo em parte do baseline não foi corrigido nem agravado.
- Inline comum (`git status`) **e inline linkado** (`git diff`) permaneceram iguais, incluindo todos os estilos capturados. Isso resolve o problema de isolamento observado com o token de fundo compartilhado.
- Os botões de copiar preservaram todos os estilos, rótulos e estados medidos. Foi feito hover tanto no bloco de commit quanto no TypeScript: opacity 1. O clipboard não foi acionado; não se afirma teste funcional da cópia.
- Ao remover a folha transitória, a sombra voltou a `none` e os estilos dos blocos voltaram ao baseline em todos os temas.

**Recomendação mínima:** upstream, acrescentar a moldura interna exclusivamente ao `pre` do componente copiável, preservando o background atual. Não são necessários padding extra, mudança no código inline ou um background mais claro. A moldura usa uma tonalidade neutra derivada de um papel existente, com mudança de uma propriedade CSS. Uma borda física exigiria considerar largura/padding; a sombra interna evita esse custo. O delimitador lateral é uma alternativa testada, não uma configuração a aplicar junto da moldura.

Hoje o componente não expõe uma propriedade oficial para essa moldura. `descriptionForeground` é oficial, mas **o bloco só passa a consumi-la para o contorno após uma alteração no CSS da extensão**. Um futuro token próprio poderia permitir ajustes sem compartilhar esse papel, porém ele ainda não existe como API de aparência do componente.

## Diff e classificação de implementação

O [diff proposto](upstream-proposal.diff) compara [trechos de regras originais extraídos](baseline-rules.css) com [as mesmas regras acrescidas das duas correções](proposed-rules.css). Usa os seletores **realmente testados**, com hashes desta versão. É uma demonstração precisa do delta CSS, **não um patch para aplicar em bundles instalados nem um caminho de arquivo-fonte upstream adivinhado**. O repositório-fonte original desses componentes não está disponível na instalação. No upstream, as regras precisam ser portadas aos módulos que geram essas classes, preservando ordem/especificidade.

```diff
+ .sendButton[data-permission-mode="auto"] .sendIcon {
+   color: var(--app-tool-background);
+ }
+ .codeBlockWrapper > pre {
+   box-shadow: inset 0 0 0 1px
+     color-mix(in srgb, var(--app-secondary-foreground) 55%, transparent);
+ }
```

Este resumo usa nomes-fonte sem hashes para comunicação. O arquivo de diff mantém os hashes observados. O patch de envio não inclui Stop; o de bloco não inclui código inline. A folha combinada foi carregada também enquanto um diálogo nativo estava aberto, sem alterar os estilos dos seus controles. Isso verifica o isolamento em relação aos controles nativos; os ensaios individuais verificam os alvos próprios da webview.

| Caminho | Envio | Blocos | Classificação |
|---|---|---|---|
| Somente propriedades/configurações oficiais atuais | Cores consumidas são compartilhadas; caminhos globais anteriores rejeitados | Não há papel consumido para moldura; fundo compartilhado afeta inline linkado | **Sem solução isolada segura pelo tema** |
| Ajuste no código-fonte da extensão | Foreground exclusivo de `.sendIcon` no envio Auto | Moldura de 1 px exclusiva de `pre` | **Menor solução recomendada; protótipos aprovados na amostra** |
| Distribuição permanente | Requer portar/testar a regra no projeto da extensão | Requer portar/testar a regra no projeto da extensão | **Dependente de upstream**, build e validação de regressão |
| CSS transitório via DevTools | Foi usado para validar a hipótese | Foi usado para validar a hipótese | **Instrumento experimental**, não configuração persistente recomendada |

## Verificações, limites e estado final

As 19 verificações de [validate.cjs](validate.cjs) passaram: identidade/enabled/contraste da seta, separação do Auto/Stop, preservação de Manual, exclusividade de moldura/lateral, geometria, tokens, inline, copiar, botões nativos, restauração e integridade dos arquivos protegidos. Os estilos são computados no componente real e as capturas acompanham cada variante. **A aprovação é do protótipo e da amostra, não de uma implementação upstream já integrada.**

Não foram acionados Send, Stop, active/pressed, estado ocupado ou cópia para o clipboard. Não foram testados temas claros/alto contraste, outros renderizadores de código ou uma build upstream. O Dark Modern já tinha contraste adequado para a seta; sua mudança no protótipo foi registrada como deliberada. Compatibilidade de `color-mix` fora do runtime examinado e escolha adaptativa de foreground para qualquer tema continuam pendentes.

Não se reauditaram syntax highlighting do editor, Search, Quick Open ou Antigravity: os JSONC definitivos e o manifesto permaneceram byte a byte iguais ao baseline registrado. Também se verificou que a cópia da extensão continuou idêntica nos bundles relevantes. O teste terminou com `transient=null`, os fundos originais e a instância descartável encerrada. Nenhum mecanismo de persistência dos estilos foi instalado.

## Reproduzir de forma isolada

Da raiz do projeto, com a instalação e Node registrados no harness. Uma nova execução substitui somente os artefatos desta subpasta; preserve os resultados se precisar comparar rodadas.

```powershell
node docs/contrast-investigation/claude-code-panel/final-investigation/prepare.cjs --fixture
node docs/contrast-investigation/claude-code-panel/final-investigation/control.cjs fixture
node docs/contrast-investigation/claude-code-panel/final-investigation/control.cjs layout
node docs/contrast-investigation/claude-code-panel/final-investigation/run.cjs
node docs/contrast-investigation/claude-code-panel/final-investigation/measure.cjs
node docs/contrast-investigation/claude-code-panel/final-investigation/validate.cjs
node docs/contrast-investigation/claude-code-panel/final-investigation/cdp.cjs workbench close
```

`run.cjs` remove a folha entre variantes e no `finally`. Se o processo for interrompido, rode `cdp.cjs claude prototype none` na instância descartável antes de encerrá-la; fechar essa instância também descarta o DOM. Não aplique os protótipos ou o diff a instalações pessoais. A decisão final de integração/solicitação upstream permanece com o usuário.

## Qualificação posterior — comparação Dark Modern

A [rodada comparativa com JSONs](../dark-modern-comparison/README.md) demonstrou que os pares de cores e superfícies do Dark Modern podem ser reproduzidos sem alterar a extensão. A necessidade upstream discutida acima aplica-se ao requisito de **isolamento e preservação dos demais consumidores**, não à possibilidade de obter essas cores. Também foi testada uma combinação coordenada que passa contraste em seta e botões nativos, mas muda a aparência global dos primários e não foi aprovada como ajuste isolado. As evidências deste relatório permanecem como registro dos protótipos transitórios; a nova comparação usa somente temas temporários.
