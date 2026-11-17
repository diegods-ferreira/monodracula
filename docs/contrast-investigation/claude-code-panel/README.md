# Claude Code — prompt, botão de ação e blocos copiáveis

**Investigação concluída sem alterar os temas.** Foram identificados três mecanismos diferentes: borda herdada de cores de entrada, foreground do ícone dependente do modo de permissão e fundo de blocos Markdown dependente de `textCodeBlock.background`.

A extensão examinada é **Claude Code 2.1.325**; o VS Code é **1.146.0**. O manifesto encontrado no projeto está em **2.3.5**, apesar da referência a 2.3.4 na solicitação; foi preservado integralmente. A reversão dos foregrounds amarelos de busca, comentários `#797fa5`, itálicos, TextMate e configurações semânticas permanecem intactos.

Foram usados perfis temporários e uma cópia byte a byte da extensão instalada. O primeiro painel vazio apresentou modo Manual. Para testar respostas, criou-se um transcript **sintético local e já encerrado**, com blocos de commit curtos/longos, TypeScript e código inline. Ele foi aberto pelo comando real da extensão, em `CLAUDE_CONFIG_DIR` temporário, com continuação após reload desativada. Nesse perfil, o modo efetivamente exibido foi Auto. Não foram enviados prompts nem acionado o botão de envio. As capturas documentam o renderizador real da extensão, não um HTML reconstruído.

## 1. Campo de prompt

### DOM, CSS e cadeia de consumo confirmados

O painel é uma **webview isolada**, registrada como `claudeVSCodeSidebar`/`claudeVSCodeSidebarSecondary`; a extensão também abre a conversa em uma aba de editor. O wrapper é do VS Code, mas o conteúdo do prompt e os botões são HTML/CSS próprios do Claude Code. Nos casos examinados:

- `fieldset.inputContainer_cKsPxg`: contorno do prompt.
- `div.messageInput_cKsPxg[role="textbox"]`: editor `contenteditable="plaintext-only"`.
- `div.inputContainerBackground_cKsPxg`: camada de fundo, posicionada com `inset: 0`.
- `div.inputFooter_gGYT1w`: rodapé com modos e ações.

Os sufixos dos seletores são próprios desta versão, não uma API de customização. As regras relevantes estão em [source-evidence.json](source-evidence.json):

```css
--app-input-border: var(--vscode-inlineChatInput-border,
    var(--vscode-input-border, var(--vscode-widget-border, #7f7f7f66)));

.inputContainer_cKsPxg {
    background: var(--app-input-secondary-background);
    border: 1px solid var(--app-input-border);
    border-radius: var(--corner-radius-large);
    box-shadow: 0 1px 2px #0000001a;
}
.inputContainerBackground_cKsPxg {
    background: var(--app-input-background);
    position: absolute;
    inset: 0;
}
```

`inlineChatInput.border` é registrada pelo VS Code e seu default é `input.border`. Os temas não a definem explicitamente. Nesta instalação, a cadeia efetiva passa pelo **default do registro**: `input.border` → `--vscode-inlineChatInput-border` → `--app-input-border` → borda. O fallback CSS não precisa ser acionado, pois a primeira variável está definida. Um override temporário somente em `inlineChatInput.border` mudou o prompt sem mudar o campo Search nativo, comprovando o consumo da primeira variável. [Registro e consumidores](registry.json).

O fundo calculado do próprio fieldset é `menu.background`, mas a camada interna cobre sua área com `input.background`. As medições consideram essa camada; usar somente o background do fieldset produziria uma composição errada, inclusive para o botão desabilitado.

### Estados observados

| Tema | Fundo visível interno | Fundo da conversa | Borda sem foco / hover | Contraste borda–interior |
|---|---|---|---|---:|
| MonoMin | `#151515` | `#151515` | `#151515`, 1 px | **1,00:1** |
| MonoDracula | `#21222c` | `#1d1f28` | `#21222c`, 1 px | **1,00:1** |
| Dark Modern | `#313131` | `#181818` | `rgba(204,204,204,.2)`, composto aproximadamente `#424242` | 1,29:1 |

A borda existe: o problema principal é sua cor, praticamente camuflada no fundo. Não é ausência de espessura ou uma borda removida pelo estado sem foco. O hover do container não muda sua borda.

O outline do container tem estilo `none`; não se deve interpretar a largura computada de um outline sem estilo como uma linha pintada. Sem foco há apenas a sombra preta de 10%. Com `:focus-within`, a extensão adiciona uma borda colorida e dois halos: 3 px com 12% da cor e sombra de 20% da cor.

| Modo | Origem da cor de foco | MonoMin: borda / contraste interno | MonoDracula: borda / contraste interno |
|---|---|---|---|
| Manual, observado | `--app-claude-orange`, constante da extensão | `#d97757` / 5,85:1 | `#d97757` / 5,06:1 |
| Auto, observado | `--app-error-foreground` → `errorForeground` | `#f97583` / 6,87:1 | `#ff74ab` / 6,27:1 |
| Plan, identificado em fonte; não exercitado | `focusBorder`, com fallback de botão | Não aprovado visualmente | Não aprovado visualmente |

`inputOption.activeBorder` alimenta outro token interno, `--app-input-active-border`, usado por componentes da extensão; não é a regra de foco efetiva desse prompt nos modos Manual/Auto. `inlineChatInput.focusBorder` também não é consumida por essa regra. O fieldset não esteve desabilitado nos ensaios; não foi gerado um turno de modelo para forçar estado ocupado.

### Candidato oficial mais estreito, com efeitos colaterais

| Tema | Propriedade | Atual herdada | Proposta | Contraste previsto e observado, interior / exterior |
|---|---|---|---|---|
| MonoMin | `inlineChatInput.border` | `#151515` | `#888888` | 5,15:1 / 5,15:1 |
| MonoDracula | `inlineChatInput.border` | `#21222c` | `#6272a4` | 3,36:1 / 3,49:1 |

Os valores pertencem às paletas atuais. Foram renderizados por customizações oficiais **somente no perfil temporário**. A borda focada Auto continuou usando a cor de erro e os halos existentes. O campo Search nativo manteve seus estilos com esse override. O ensaio alternativo em `input.border` mudou também o campo nativo, confirmando sua abrangência maior.

**O candidato não é exclusivo do prompt.** A extensão reutiliza `--app-input-border` em 94 regras localizadas, incluindo divisores, diálogos, tabelas e outros contornos. O divisor do rodapé também mudou na captura. O token oficial afeta ainda os consumidores nativos de inline chat; estes foram identificados em fonte, mas não receberam validação visual completa.

Recomendação: `inlineChatInput.border` é o menor override oficial demonstrado, se seus efeitos compartilhados forem aceitos. Para alterar **somente o contorno externo do prompt**, é necessário suporte upstream a um papel de borda próprio do componente. Não se recomenda clarear `input.border` globalmente. Não há uma configuração Claude Code de cor/borda do prompt no schema inspecionado.

## 2. Ícone do botão inferior direito

### Identificação e estados

O botão observado é `button.sendButton_gGYT1w[aria-label="Send message"]`. Seu SVG `sendIcon_gGYT1w` tem um `path` com **`fill="currentColor"`**. Não é um ícone nativo do VS Code. O mesmo componente troca para Stop quando há resposta em andamento, mas esse estado não foi acionado.

O prompt vazio desabilita o botão: `opacity: .4`, sem filtro de hover. Ao preencher um rascunho sem enviá-lo, o botão fica habilitado, com opacidade 1. O hover habilitado aplica `filter: brightness(1.1)` ao conjunto de fundo e ícone; o foco foi efetivamente exercitado. A regra de clique ativo aplica `brightness(.9)`, mas não foi acionada para evitar envio: esse estado permanece apenas analisado em fonte.

As cores mudam conforme `data-permission-mode`:

```css
/* Manual */
color: var(--app-claude-ivory); /* #faf9f5 */
background-color: var(--app-claude-clay-button-orange); /* #c6613f */

/* Auto e bypassPermissions */
color: var(--app-button-foreground); /* button.foreground */
background-color: var(--app-error-foreground); /* errorForeground */
```

O seletor do SVG também define seu `color` nesses modos. Alterar apenas a herança de cor do botão não basta se o filho continuar com seu override. Em Accept edits, a extensão já utiliza `--app-tool-background` no ícone; Plan usa os tokens compartilhados de botão. Esses dois modos foram examinados em fonte, não aprovados por teste visual.

### Contrastes medidos em estilos reais

| Estado | Tema | Ícone efetivo | Fundo efetivo do botão | Contraste |
|---|---|---|---|---:|
| Manual habilitado normal/foco | Todos os três | `#faf9f5` | `#c6613f` | **3,85:1** |
| Manual habilitado hover | Todos os três | branco, após filtro | aproximadamente `#da6b45` | **3,41:1** |
| Manual desabilitado, composto | MonoMin | aproximadamente `#71706f` | `#5c3326` | 2,17:1 |
| Manual desabilitado, composto | MonoDracula | aproximadamente `#78787c` | `#633b34` | 2,16:1 |
| Auto habilitado normal/foco | MonoMin | `#939293` | `#f97583` | **1,17:1** |
| Auto habilitado hover | MonoMin | aproximadamente `#a2a1a2` | `#ff8190` | **1,08:1** |
| Auto habilitado normal/foco | MonoDracula | `#939293` | `#ff74ab` | **1,23:1** |
| Auto habilitado hover | MonoDracula | aproximadamente `#a2a1a2` | `#ff80bc` | **1,11:1** |
| Auto habilitado normal/foco | Dark Modern | `#ffffff` | `#f85149` | **3,35:1** |
| Auto habilitado hover | Dark Modern | `#ffffff` | `#ff5950` | **3,09:1** |

O problema funcional foi confirmado no **Auto habilitado**, não apenas em um controle desabilitado. A combinação vem do uso de um foreground global pensado para botões escuros sobre uma cor de erro clara. No Manual habilitado, o valor medido supera a referência de 3:1; a atenuação do botão vazio é um estado disabled real e não justifica equipará-lo visualmente ao habilitado. A [WCAG 2.2, contraste não textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) distingue esses casos e orienta o uso das cores nominais, sem medir o antialiasing das bordas do SVG.

### Candidatos e recomendação

| Tema | Mudança de foreground avaliada | Fundo mantido | Contraste previsto / renderizado no Auto | Efeito colateral do caminho global |
|---|---|---|---|---|
| MonoMin | `#939293` → `#1f1f1f`, cor já usada em `editor.background` | `#f97583` | 6,20:1 / 6,20:1 | Texto de botão nativo caiu de 5,32:1 para **1,00:1** |
| MonoDracula | `#939293` → `#282a36`, cor já usada em `editor.background` | `#ff74ab` | 5,65:1 / 5,65:1 | Texto de botão nativo caiu de 4,59:1 para **1,00:1** |

A aparência do ícone escuro foi testada por `button.foreground` no perfil descartável, com rascunho não enviado. O controle nativo foi um diálogo local do VS Code, com renderer customizado somente nesse perfil. O botão primário estava no estado de foco/default mostrado nas capturas. **Esse preview prova o contraste do ícone, não a validade de uma alteração global. O caminho global foi rejeitado.**

Recomendação de menor impacto: corrigir upstream somente o foreground do SVG de envio/stop do Auto, usando um papel escuro apropriado, como `--app-tool-background`, já utilizado pela própria extensão em outro modo. Manter o fundo, as cores dos demais botões, a atenuação disabled e os filtros existentes. A implementação isolada upstream **não foi realizada nem validada**; o preview foi obtido pelo token compartilhado e seus efeitos negativos foram medidos.

Não basta clarear o ícone: até branco puro daria apenas 2,66:1 no fundo Auto MonoMin e 2,52:1 no MonoDracula. Alterar `errorForeground` também mudaria diagnósticos e o foco Auto, sem isolamento. Nenhuma propriedade oficial específica do VS Code para esse SVG, nem opção de contraste correspondente do Claude Code, foi encontrada.

## 3. Blocos de código copiáveis

### Componente real, distinto do inline

O fixture contém um bloco `text` curto, outro longo e um bloco TypeScript colorizado. O renderer real cria:

```text
div.codeBlockWrapper_-a7MRw
  button.copyButton_CEmTFw.copyButton_-a7MRw
    aria-label="Copy code to clipboard"
  pre
    code.language-text ou code.language-typescript
```

O componente JavaScript cria o botão e fornece `pre.textContent` ao mecanismo de cópia. O botão aparece no hover do wrapper. Não foi clicado, para preservar o clipboard; foram verificados presença, label, estado habilitado, cores e opacidade 1 em hover, antes/depois dos candidatos.

As regras efetivas são:

```css
.codeBlockWrapper_-a7MRw { position: relative; margin: 8px 0; }
.codeBlockWrapper_-a7MRw pre {
    color: var(--app-primary-foreground);
    background: var(--app-code-background);
    border-radius: 4px;
    margin: 0;
    padding: 8px;
    white-space: pre;
    overflow-x: auto;
    box-sizing: border-box;
}
--app-code-background: var(--vscode-textCodeBlock-background, #7f7f7f26);
```

Não há borda pintada no `pre`: a largura computada é 0. Blocos curtos e longos usam a mesma regra; linhas longas conservam scroll horizontal. O token oficial **é consumido**, comprovado pela alteração temporária de `textCodeBlock.background` e pelo novo background computado no `pre` real.

O inline comum usa `--app-inline-code-background` → `textPreformat.background`, com padding 2/4 px e raio 3 px. O `code` dentro de `pre` zera esse background/padding e herda a cor, evitando uma segunda superfície sobre o bloco. Portanto não se deve corrigir o bloco alterando `textPreformat.*`.

### Comparação confirmada

| Tema | Fundo da conversa | Background dos blocos | Relação entre superfícies | Texto dos blocos de commit |
|---|---|---|---:|---:|
| MonoMin | `#151515` | `#151515` | **1,00:1** | 15,18:1 |
| MonoDracula | `#1d1f28` | `#21222c` | **1,04:1** | 15,37:1 |
| Dark Modern | `#181818` | `#2b2b2b` | **1,25:1** | 8,82:1 |

O MonoMin define explicitamente o mesmo fundo para a conversa e `textCodeBlock.background`. No MonoDracula, as superfícies são muito próximas. Sem borda no renderer, a separação depende sobretudo de margem e tipografia. É uma interação entre escolhas do tema e estrutura da extensão, não falta de consumo da propriedade. A relação entre essas superfícies descreve sua diferenciação; **não é uma exigência automática de 3:1 para toda área de código**.

### Candidatos renderizados e motivos para não aplicá-los

| Tema | `textCodeBlock.background`, atual → candidato da paleta | Relação prevista / observada entre superfícies | Texto do commit, depois | Comentário TypeScript, antes → depois |
|---|---|---|---:|---:|
| MonoMin | `#151515` → `#303030` | 1,38:1 / 1,38:1 | 10,97:1 | **4,61:1 → 3,33:1** |
| MonoDracula | `#21222c` → `#282a36` | 1,15:1 / 1,15:1 | 13,86:1 | **3,99:1 → 3,59:1** |

Os três blocos preservaram texto, padding, raio, foregrounds e os 21 spans colorizados do TypeScript. Porém, **preservar os valores das cores não preserva o contraste quando se muda o fundo**. A referência para [texto normal é 4,5:1 na WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). No MonoMin, também as keywords caíram de 6,19:1 para 4,48:1. O comentário da extensão é `#608b4e`, presente na paleta embarcada do renderer, igual nos temas examinados. Não é a regra `#797fa5` dos comentários do MonoDracula no editor, que permaneceu intacta. No Dark Modern, esse comentário do bloco já mede 3,57:1, limitação preexistente que não foi corrigida nesta tarefa.

Há ainda uma exceção de isolamento importante:

```css
.root_-a7MRw a code {
    color: inherit;
    background: var(--app-code-background);
}
```

**Código inline dentro de links também usa o token de blocos.** Isso foi reproduzido com um link local de teste apontando para o domínio reservado `example.invalid`, sem abri-lo. `git status`, inline comum, manteve todos os estilos; `git diff`, inline dentro do link, mudou de fundo junto com os blocos. Logo, uma troca global de `textCodeBlock.background` nesta versão não atende integralmente ao requisito de preservar as cores de inline.

Os candidatos foram rejeitados para aplicação: melhoraram a separação visual, mas reduziram a legibilidade da sintaxe e alteraram inline vinculado. Também afetariam outros consumidores do token, como resultados de ferramentas e previews de código, identificados em fonte; não são exclusivos dos fences de resposta.

### Recomendação de menor impacto

Para satisfazer simultaneamente isolamento, inline preservado e ausência de piora de contraste, recomendar upstream um **delimitador discreto apenas no `pre`/wrapper do bloco**, conservando os fundos e foregrounds atuais. Uma borda opcional de 1 px é justificável porque o caminho de fundo testado tem os conflitos acima.

| Proposta upstream, ainda não renderizada | Atual | Valor candidato existente | Relação prevista com a conversa | Impacto esperado |
|---|---|---|---:|---|
| Borda do bloco MonoMin | Sem borda | `#5b595c`, 1 px | 2,63:1 | Delimita sem clarear o bloco; contraste do texto permanece igual |
| Borda do bloco MonoDracula | Sem borda | `#5b595c`, 1 px | 2,37:1 | Mesmo papel discreto, sem tocar inline ou sintaxe |

Essas relações são descritivas para um delimitador do conteúdo, não uma declaração de conformidade de um controle interativo. O botão de copiar e o foco têm seus próprios critérios. Os valores pertencem às paletas atuais, mas **não há hoje uma propriedade consumida pelo componente que permita acrescentar essa borda**. A extensão precisaria expor um papel específico suportado ou implementar a diferenciação internamente. Não se inventou uma chave de tema para isso.

Corrigir a regra de inline dentro de links também seria uma decisão upstream separada: mudá-la automaticamente alteraria o próprio inline, contrariando o escopo atual. A proposta de delimitador evita essa alteração. Não se recomenda injeção CSS, patch de bundle nem alteração de cores de syntax highlighting para compensar o fundo.

## Alternativas e alcance

| Caminho | Situação técnica | Decisão |
|---|---|---|
| Propriedade oficial exclusiva do Claude Code | Nenhuma cor própria registrada no manifesto examinado | Indisponível nesta versão |
| `inlineChatInput.border` | Consumida e renderizada; mais estreita que `input.border`, mas compartilhada com outros contornos e inline chat | Candidato real para avaliação de alcance; não é isolamento absoluto |
| `input.border` global | Mudou campo Search e prompt no teste | Evitar para corrigir só o Claude |
| `button.foreground` global | Corrigiu ícone Auto e tornou botão nativo ilegível | Rejeitado |
| Configuração de aparência do Claude Code | Schema/documentação inspecionados não expõem cor de borda, SVG ou fence. `focusView` organiza conteúdo; `useTerminal` muda de interface | Nenhuma correção específica suportada encontrada |
| `textCodeBlock.background` | Consumida, mas afeta inline em links e contraste dos tokens do renderer | Rejeitar os candidatos testados sob os critérios atuais |
| Correção upstream por componente | Permite isolar SVG e delimitador dos blocos; prompt pode receber papel próprio | Caminho recomendado quando isolamento estrito for obrigatório |

**Não existe, nesta combinação de versões, uma solução exclusivamente por propriedades oficiais do tema que corrija os três problemas com isolamento completo.** A borda tem um candidato oficial compartilhado comprovado. Ícone Auto e blocos precisam de ajustes na extensão para cumprir todos os limites demonstrados. Não foi aberta issue nem enviada mensagem externa.

## Evidências e matriz de execução

Foram produzidas **81 capturas reais**, estilos computados e cálculos. As imagens são do workbench real; não foram alteradas ou simuladas. Para o corpo das respostas, a origem dos dados é o transcript sintético descrito acima. A captura original mencionada na solicitação não foi comparada diretamente; seu modo e estado de preenchimento não foram confirmados. O diagnóstico distingue os estados efetivamente reproduzidos.

| Teste | Classificação |
|---|---|
| Prompt sem foco, hover e foco, nos três temas | Executado; borda de 1 px e cadeia de variáveis comprovadas |
| Prompt disabled/ocupado | Não exercitado; não se enviou prompt para produzir esse estado |
| Botão Manual vazio/habilitado, hover e foco | Executado; enabled supera 3:1, disabled tem atenuação explícita |
| Botão Auto vazio/habilitado, hover e foco | Executado; falha de 3:1 confirmada nos dois temas habilitados |
| Clique ativo / Stop durante resposta | Somente regras de fonte inspecionadas; não aprovado como teste visual |
| Plan, Accept edits e bypassPermissions | Fonte analisada; não classificados como validação visual desses modos |
| Campos e botões nativos compartilhados | Executado com Search e diálogo de controle local; efeitos colaterais confirmados |
| Inline chat nativo e todos os 94 consumidores de borda | Inventário de fonte; cobertura visual completa pendente |
| Blocos curtos, longos e TypeScript | Executado no renderer real, com overrides temporários oficiais |
| Inline comum e inline em link | Executado; isolamento apenas do primeiro confirmado |
| Copiar código | Controle visível/habilitado e hover verificados; clipboard não acionado |
| Propostas upstream isoladas | Não implementadas; contraste do ícone tem preview por token global, borda do bloco tem apenas previsão |
| Integridade dos temas, manifesto, settings pessoais e bundles | Aprovada por SHA-256; reversão dos amarelos também verificada |

### Capturas selecionadas

| Caso | Referência | Comparação |
|---|---|---|
| Prompt MonoMin | [sem foco](evidence/monomin-empty-normal.png) | [focado](evidence/monomin-empty-focus.png) |
| Prompt MonoDracula | [original](evidence/monodracula-auto-empty-normal.png) | [borda candidata e efeitos locais](evidence/monodracula-border-candidate.png) |
| Ícone MonoMin | [Manual habilitado](evidence/monomin-enabled-normal.png) | [Auto habilitado](evidence/monomin-auto-enabled-normal.png) |
| Ícone Auto MonoDracula | [original](evidence/monodracula-auto-enabled-normal.png) | [preview escuro por token global](evidence/monodracula-auto-dark-icon-preview.png) |
| Controle nativo MonoMin | [foreground original](evidence/monomin-dialog-baseline.png) | [efeito negativo do foreground escuro](evidence/monomin-dialog-dark-foreground.png) |
| Blocos MonoMin | [original](evidence/monomin-code-baseline-long.png) | [fundo candidato rejeitado](evidence/monomin-code-candidate-long.png) |
| Blocos MonoDracula | [original](evidence/monodracula-code-baseline-long.png) | [fundo candidato rejeitado](evidence/monodracula-code-candidate-long.png) |
| Dark Modern | [Auto habilitado](evidence/dark-modern-auto-enabled-normal.png) | [blocos originais](evidence/dark-modern-code-baseline-long.png) |

Dados: [measurements.json](measurements.json), [validation.json](validation.json), [registry.json](registry.json), [source-evidence.json](source-evidence.json), [fixture.json](fixture.json), [session-prompt.json](session-prompt.json) e [session.json](session.json). Os JSONs em `evidence/` registram SVG, opacidade, filtro, borda, sombras, camadas e estilos dos tokens.

Os contrastes são calculados com luminância relativa sRGB a partir dos estilos efetivamente computados, com transparências e grupos de opacidade sobre o fundo real. Brightness do botão afeta ícone e background. Não são relações medidas em pixels antialiasados. Valores completos, sem arredondamento, estão nos JSONs; as tabelas arredondam apenas para leitura.

## Reprodução e limites

Scripts usam os caminhos da instalação registrada e a porta local 9401. `prepare.cjs` cria um perfil e cópias descartáveis; requer acesso autorizado ao Electron. Nunca execute duas sessões na mesma porta. Para outra máquina/versão, ajuste os caminhos e confira novamente os seletores e o registro.

```powershell
# Painel vazio, modo Manual no perfil temporário:
node docs/contrast-investigation/claude-code-panel/prepare.cjs --manual
node docs/contrast-investigation/claude-code-panel/control.cjs open
node docs/contrast-investigation/claude-code-panel/collect.cjs
node docs/contrast-investigation/claude-code-panel/cdp.cjs workbench close
Copy-Item docs/contrast-investigation/claude-code-panel/session.json docs/contrast-investigation/claude-code-panel/session-prompt.json

# Conversa local sintética; Auto foi o modo observado neste ensaio:
node docs/contrast-investigation/claude-code-panel/prepare.cjs --fixture
node docs/contrast-investigation/claude-code-panel/control.cjs fixture
node docs/contrast-investigation/claude-code-panel/collect.cjs --auto
node docs/contrast-investigation/claude-code-panel/candidates.cjs
node docs/contrast-investigation/claude-code-panel/source.cjs
node docs/contrast-investigation/claude-code-panel/registry.cjs
node docs/contrast-investigation/claude-code-panel/measure.cjs
node docs/contrast-investigation/claude-code-panel/validate.cjs
node docs/contrast-investigation/claude-code-panel/cdp.cjs workbench close
```

A primeira execução original observou Manual sem impor o modo; a opção `--manual` torna explícita essa condição para reprodução. Os coletores e o validador conferem os modos reais, sem aprovar um rótulo apenas pelo nome do arquivo. O suporte a Auto pode depender do ambiente da extensão; se o modo não estiver disponível, não force um atributo DOM: registre a pendência. O transcript local é uma amostra, não um mecanismo de importação de produção ou uma conversa gerada por um modelo.

Não há override CSS injetado, alteração de bundles ou propriedade de tema inventada. Os testes de candidatos usaram `workbench.colorCustomizations` apenas dentro do perfil temporário e terminaram sem overrides. Os settings pessoais do VS Code foram conferidos por hash; o transcript e suas configurações Claude ficaram no diretório descartável. Nenhum histórico pessoal foi usado como fixture. Nenhum arquivo de tema, regra TextMate, configuração semântica, comentário, cor de busca, Search lateral, Antigravity ou manifesto do projeto foi editado. Nenhum commit ou publicação foi criado.

Fontes primárias complementares: [integração oficial Claude Code/VS Code](https://code.claude.com/docs/en/vs-code), [configuração de diretório temporário por variável de ambiente](https://code.claude.com/docs/en/env-vars), [cores oficiais do VS Code](https://code.visualstudio.com/api/references/theme-color). A autoridade para seletores e consumidores neste relatório é a instalação local examinada.

As três investigações encerram-se aqui. Qualquer alteração de cor, configuração persistente ou regra visual depende de aprovação explícita e, para os caminhos isolados indicados, de suporte upstream ainda não implementado.

## Complemento experimental — 16/11/2026

A etapa posterior autorizada está em [experiments/README.md](experiments/README.md), com 89 novas capturas reais, 19 verificações automatizadas, [comparador visual](experiments/compare.html) e [diff de borda proposto, não aplicado](experiments/proposed-theme.diff). Ela refina a candidata do prompt e testa alternativas oficiais para Auto e blocos. Os resultados anteriores acima permanecem como registro histórico; a aprovação permanente continua pendente.

## Investigação final — envio habilitado e blocos copiáveis

A borda do prompt foi posteriormente implementada e validada em [claude-code-prompt-border](../../theme-modernization/claude-code-prompt-border/README.md), preservando `#888888ad` / `#939293a6`. A [investigação final](final-investigation/README.md) trata somente dos problemas restantes e distingue a seta de **Send** do seletor **Auto** e do **Stop**. Ela acrescenta 60 capturas reais e 19 verificações de protótipos isolados: foreground somente da seta, moldura e delimitador lateral somente do bloco. Nesta rodada autorizou-se CSS **transitório em memória na webview descartável**, removido ao final; os relatos anteriores sem injeção permanecem históricos. [Comparador](final-investigation/compare.html) e [diff representativo upstream](final-investigation/upstream-proposal.diff). Nenhum tema ou bundle foi alterado nesta investigação; a integração das correções isoladas depende da extensão/upstream.

## Comparação causal com Dark Modern

A [comparação Dark Modern](dark-modern-comparison/README.md) acrescenta 64 capturas e 16 verificações usando **somente cópias JSON**, sem CSS injetado. Ela qualifica a conclusão anterior: as cores da seta e as superfícies do Dark Modern **podem ser reproduzidas pelo tema**. A limitação é preservar os demais consumidores dos tokens compartilhados. Uma combinação coordenada da paleta também passa contraste na seta e nos botões nativos, mas altera a aparência dos primários e deixa Stop/outros estados pendentes. [Comparador](dark-modern-comparison/compare.html), controles de referência exatos e efeitos colaterais documentados. Nenhuma alteração permanente foi aplicada.

## Compromissos pelos temas e composer nativo — 17/11/2026

A [nova rodada experimental](theme-compromises/README.md) acrescenta **63 capturas reais e 39 verificações automatizadas**, com candidatos intermediários para Send, fundos escuros que melhoram o contraste dos tokens nos blocos e bordas para o composer do chat nativo. Os experimentos usam somente JSONs temporários, sem injeção de CSS. O composer consome `input.border` / `focusBorder`, independentemente da borda Claude já aprovada. Há propostas separadas, classificações A/B/C, efeitos compartilhados e pendências explícitas, incluindo Stop. [Comparador lado a lado](theme-compromises/compare.html). Nenhuma proposta foi aplicada aos temas definitivos.
