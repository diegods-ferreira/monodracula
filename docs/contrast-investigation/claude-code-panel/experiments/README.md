# Claude Code — experimentos controlados

Execução em 16/11/2026, com **VS Code 1.146.0**, **Claude Code 2.1.325** e manifesto do projeto **2.3.5**. Nenhum tema definitivo, manifesto, configuração pessoal ou bundle foi alterado. Não houve commit, publicação, envio de prompt ou patch de CSS. Foram produzidas **89 capturas novas**, acompanhadas dos estilos computados, e **19 verificações automatizadas** passaram. A contagem é de evidências, não de soluções aprovadas.

O resultado concreto é uma candidata de borda implementável pelo tema, aprovada **na amostra experimental**, com efeitos compartilhados explícitos. Para Auto e código copiável, os caminhos oficiais testados foram rejeitados. Há propostas upstream mínimas, com previsões separadas de validação visual. **Nenhuma correção upstream foi renderizada ou aprovada nesta execução.**

## Evidências e método

- [Comparador antes/depois](compare.html): abra no navegador; permite pares e sobreposição das capturas originais.
- [Medições completas](measurements.json), [validação executada](validation.json), [registro, configurações e candidatos de fonte](source-candidates.json).
- [Baseline técnico anterior](../README.md), [consumidores compartilhados](../registry.json) e [preview anterior do ícone escuro](../evidence/monomin-auto-dark-icon-preview.png).
- [Sessão isolada e hashes](session.json); [fixture local](fixture.json). Os caminhos absolutos identificam esta execução, não uma dependência permanente do projeto.

Usou-se um perfil novo, cópias byte a byte dos temas e da extensão, um `CLAUDE_CONFIG_DIR` separado e transcript sintético já encerrado. A conversa foi aberta pelo comando da própria extensão. Os candidatos foram aplicados por `workbench.colorCustomizations` **somente no perfil descartável**, sobre os temas copiados. Isso exercita o caminho oficial de resolução de cores sem reescrever os JSONC originais nem os bundles copiados.

As capturas vêm da janela real, por CDP local. `getComputedStyle` foi usado para ler estados, variáveis, bordas e SVGs. Não houve injeção de estilos ou modificação do DOM para simular uma correção. Cliques de navegação selecionaram os modos Manual, Plan e Auto. Os rascunhos foram apagados sem envio. A inicialização resolveu Manual → Auto antes dos ensaios finais; os modos foram então selecionados explicitamente e conferidos nos dados coletados.

O contraste usa luminância sRGB/WCAG e as cores nominais computadas. Para a borda transparente, o fundo sob sua pintura é o background do fieldset (`menu.background`); o interior visível é a camada `input.background`. O hover do botão aplica brilho ao fundo **e** ao SVG; o disabled aplica opacidade ao grupo. Não se mediu antialiasing dos pixels como se fosse a cor nominal do ícone. A diferença entre superfícies de um bloco é informativa: não se impôs 3:1 a uma separação decorativa.

## 1. Prompt: solução pelo tema, com alcance compartilhado

O consumo confirmado continua sendo:

```text
inlineChatInput.border → --vscode-inlineChatInput-border
                      → --app-input-border → border: 1px solid
```

O baseline sem foco é `#151515` no MonoMin e `#21222c` no MonoDracula: 1,00:1 contra o interior em ambos. A espessura é 1 px; outline tem estilo `none`; sombra preta de 10% não delimita suficientemente. O hover não altera essa regra.

### Candidatos efetivamente renderizados

Os valores de oito dígitos reutilizam RGB da paleta com transparência nova; **não são cores já existentes byte a byte**. Isso permite reduzir o destaque do estado inativo, em vez de copiar a intensidade do foco. O VS Code serializa as alphas escolhidas em `.68`, `.92` e `.65`; os cálculos abaixo usam os valores efetivamente expostos à webview.

| Tema / candidato | Valor temporário de `inlineChatInput.border` | Borda composta aproximada | Contraste interno / externo | Resultado |
|---|---|---|---|---|
| MonoMin sólido, ensaio anterior | `#888888` | `#888888` | 5,15 / 5,15 | Não selecionado: igual à cor do foco Plan; contornos mais intensos |
| MonoMin neutro baixo | `#5b595c` | `#5b595c` | 2,63 / 2,63 | Rejeitado como preferência: separação menor que a candidata selecionada |
| **MonoMin neutro suavizado** | **`#888888ad`** | **`#666666`** | **3,20 / 3,20** | **Aprovado na amostra**, pendente de autorização permanente |
| MonoDracula azul sólido, ensaio anterior | `#6272a4` | `#6272a4` | 3,36 / 3,49 | Não selecionado: reproduz a cor do foco Plan |
| MonoDracula azul suavizado | `#6272a4eb` | `#5d6c9b` | 3,08 / 3,21 | Renderizado; não selecionado: hue semelhante ao foco Plan |
| **MonoDracula neutro suavizado** | **`#939293a6`** | **`#6e6e72`** | **3,09 / 3,22** | **Aprovado na amostra**, pendente de autorização permanente |

Os dois candidatos selecionados mantêm 1 px, radius 8 px e sombra normal existentes. O MonoMin reutiliza o RGB de `activityBar.foreground`; o MonoDracula, `descriptionForeground`. Não se clarearam textos inativos nem se alteraram cores de foco.

### Hierarquia observada

| Estado | MonoMin: cor / contraste interno | MonoDracula: cor / contraste interno |
|---|---|---|
| Desfocado e hover | `rgba(136,136,136,.68)` / **3,20** | `rgba(147,146,147,.65)` / **3,09** |
| Manual focado | `#d97757` / **5,85** | `#d97757` / **5,06** |
| Plan focado | `#888888` / **5,15** | `#6272a4` / **3,36** |
| Auto focado | `#f97583` / **6,87** | `#ff74ab` / **6,27** |

Todos os focos mantiveram a borda de 1 px e o halo colorido de 3 px a 12%, além da sombra a 20%. No Plan do MonoDracula, a diferença de luminância é pequena, mas há mudança de cinza para azul e adição de halo. A inspeção das capturas confirmou essa distinção; não se buscou contraste idêntico entre estados. O foco Manual correspondeu ao baseline e o Auto à cor de erro original. Os valores não corrigem o ícone Auto.

### Efeitos compartilhados efetivamente verificados

`--app-input-border` aparece em 94 regras na versão examinada. No DOM desta conversa foram encontrados sete consumidores renderizados; seis mudaram a borda computada. As capturas e [inventários](evidence/monodracula-shared-candidate.json) mostram:

- Contorno do prompt e linha superior do rodapé mais visíveis.
- Contorno da mensagem do usuário mais visível.
- Borda dos três controles de copiar código mais visível. O controle de copiar resposta tem borda de 0 px e permaneceu igual.
- Fundo, padding e syntax highlighting dos blocos preservados por essa candidata de borda. Ela **não cria borda no `pre`** e não resolve o terceiro problema.

O campo Search nativo foi comparado com ambas as candidatas selecionadas: seus estilos ficaram iguais. O Inline Chat nativo real foi aberto no editor `example.ts`; os seis elementos amostrados permaneceram iguais antes/depois nos dois temas. Esta instalação usa `inline-chat-2`; isso não prova ausência de efeitos em outros implementadores. A folha nativa contém um consumidor explícito de `inlineChatInput.border` no **chat de célula de notebook**, não exercitado.

Permissões, tabelas e demais consumidores latentes do Claude Code continuam pendentes. Assim, a candidata é segura quanto aos invariantes e à amostra verificada, mas **não é exclusiva do prompt nem está aprovada para todos os diálogos da extensão**. A aceitação do contorno adicional da mensagem/rodapé deve fazer parte da decisão visual.

### Diff proposto, não aplicado

O [patch completo](proposed-theme.diff) passou por `git apply --check`. Sua aplicação foi simulada em memória com JSONC e igualdade profunda: somente duas propriedades novas; zero mudanças em cores existentes, TextMate ou configuração semântica.

```diff
// themes/MonoMinTheme.json — dentro de colors
+ "inlineChatInput.border": "#888888ad",

// themes/MonoDraculaTheme.json — dentro de colors
+ "inlineChatInput.border": "#939293a6",
```

**Recomendação:** considerar esse patch após aceitar os efeitos compartilhados fotografados. Se for obrigatório mudar exclusivamente o contorno do prompt, o tema não oferece esse isolamento; a extensão precisaria de um token próprio para o container, separado de `--app-input-border`.

## 2. Auto: alternativas oficiais exercitadas e correção upstream mínima

O botão é `button.sendButton_gGYT1w[data-permission-mode=auto][aria-label="Send message"]`. Seu SVG usa `currentColor`, mas `.sendIcon_gGYT1w` recebe explicitamente `--app-button-foreground`; por isso a herança genérica de ícones não resolve. Não se encontrou atenuação indevida do SVG habilitado: opacity 1. O botão vazio é realmente disabled, com opacity .4.

| Ensaio no componente real | MonoMin: ícone / fundo / contraste normal | MonoDracula: ícone / fundo / contraste normal | Classificação |
|---|---|---|---|
| Baseline Auto habilitado | `#939293` / `#f97583` / **1,17** | `#939293` / `#ff74ab` / **1,23** | Problema preexistente confirmado |
| `icon.foreground` escuro | Token `#1f1f1f`; SVG continua `#939293`, **1,17** | Token `#282a36`; SVG continua `#939293`, **1,23** | **Rejeitado:** não controla este SVG |
| `errorForeground` escuro | `#939293` / `#1f1f1f` / **5,32** | `#939293` / `#282a36` / **4,59** | **Rejeitado:** papel compartilhado inadequado |

O hover baseline continua abaixo de 3:1: **1,08 / 1,11**. O foco de teclado do **próprio botão**, sem hover e sem acioná-lo, foi capturado: mantém **1,17 / 1,23**. O candidato de ícone genérico permaneceu igual também em hover. O candidato de erro escuro deu ícone legível, mas reduziu a borda de foco Auto contra o interior para **1,11:1 nos dois temas**, incluindo o halo escuro. A cor de erro também é consumida em outros erros da extensão e no VS Code; essas superfícies não foram todas renderizadas. Esse efeito já basta para rejeitar a troca compartilhada.

O preview anterior via `button.foreground` foi reutilizado como evidência da tonalidade escura, **não como solução**: o mesmo ensaio deixou botão primário nativo com 1:1. Não foi necessário repetir um caminho já demonstrado inadequado. Nem foreground branco resolve estes fundos claros: os contrastes calculados são inferiores a 3:1.

O manifesto instalado foi revisado novamente: não oferece configuração de cor/contraste por botão. `claudeCode.initialPermissionMode`, `useTerminal` e `preferredLocation` mudam comportamento ou localização, não são correções de aparência. Tokens privados `--app-*` não constituem uma API de customização do usuário. Não há propriedade oficial específica encontrada para esse SVG. Aumentar a opacidade habilitada não é possível: ela já é 1; remover a atenuação disabled seria um ajuste do estado errado.

### Menor alteração upstream necessária

Na folha-fonte do componente de envio, **separar Auto de Plan/bypass nas regras de ícone** e usar o papel escuro já empregado por AcceptEdits. A regra equivalente, antes de gerar os hashes CSS, seria:

```css
/* Proposta para o código-fonte da extensão; não é override para instalação. */
.sendButton[data-permission-mode="auto"] .sendIcon,
.sendButton[data-permission-mode="auto"] .stopIcon {
  color: var(--app-tool-background);
}
```

Os seletores reais têm sufixos gerados. Essa regra deve substituir o caso Auto das regras compartilhadas ou vir depois delas. Não muda background, foreground global do botão, Plan, bypass, opacity ou filtros. Os `<path fill="currentColor">` passam a herdar a cor do próprio SVG. `--app-tool-background` é `editor.background`: já existe e foi renderizado no preview anterior, mas **o isolamento desta regra não foi implementado**.

| Previsão da regra isolada | Foreground / background normais | Normal | Hover `brightness(1.1)` | Active `brightness(.9)` |
|---|---|---:|---:|---:|
| MonoMin | `#1f1f1f` / `#f97583` | 6,20 | 6,64 | 5,25 |
| MonoDracula | `#282a36` / `#ff74ab` | 5,65 | 5,78 | 4,89 |

Esses números são **previsões**, não capturas da regra isolada. O Stop compartilha a regra de fonte, mas não foi produzido um turno para renderizá-lo. Uma correção distribuída pela extensão precisa validar também temas claros, outros temas escuros e outras cores de erro; `editor.background` não garante contraste em todo tema possível. Para uma implementação geral, a extensão deve escolher um foreground acessível para o background resolvido ou disponibilizar um papel próprio com fallback adequado.

**Recomendação:** levar a alteração restrita de SVG ao código-fonte da extensão, validar normal/hover/focus/active/Stop em build de desenvolvimento e manter os temas atuais para esse componente. Sem suporte upstream, não foi encontrada solução estável e isolada usando as APIs existentes. Nenhum bundle foi modificado, nem sequer na cópia descartável.

## 3. Blocos copiáveis: fundos, bordas e alternativas

O alvo é `.codeBlockWrapper_-a7MRw > pre > code`; copiar é um botão irmão de `pre`. Código inline comum e `a code` são caminhos separados. Baseline real: padding **8 px**, radius **4 px**, margin do wrapper **8px 0**, borda do `pre` **0 px**, overflow horizontal automático. Esses valores permaneceram iguais nos candidatos de tema.

| Tema / ensaio | Fundo do bloco / conversa | Diferença de superfícies | Contraste texto plano | Menor contraste TypeScript | Resultado |
|---|---|---:|---:|---:|---|
| MonoMin baseline | `#151515` / `#151515` | 1,00 | 15,18 | 4,61 | Delimitação ausente |
| MonoMin escuro | `#101010` / `#151515` | 1,04 | 15,82 | 4,80 | Rejeitado: separação muito sutil e efeito no inline linkado |
| MonoMin elevado | `#303030` / `#151515` | 1,38 | 10,97 | 3,33 | Rejeitado: perda de contraste de tokens e efeito no inline linkado |
| MonoDracula baseline | `#21222c` / `#1d1f28` | 1,04 | 15,37 | 3,99 | Delimitação insuficiente |
| MonoDracula escuro | `#1d1f28` / `#1d1f28` | 1,00 | 15,99 | 4,14 | Rejeitado: elimina a diferença de superfície e afeta inline linkado |
| MonoDracula elevado | `#282a36` / `#1d1f28` | 1,15 | 13,86 | 3,59 | Rejeitado: reduz contraste de tokens e afeta inline linkado |
| Dark Modern baseline | `#2b2b2b` / `#181818` | 1,25 | 8,82 | 3,57 | Comparação de referência, sem propor sua paleta |

Os fundos foram aplicados por `textCodeBlock.background`, todos reutilizando cores existentes no tema correspondente. Blocos curtos e longos sem highlighting e o TypeScript foram examinados. As **21 partes de tokens** mantiveram exatamente seus foregrounds e estilos; a mudança de contraste foi produzida pelo fundo. O verde `#608b4e` é do renderizador de código da extensão e não corresponde à regra de comentários `#797fa5` do tema. O baixo contraste de parte do código já existe no baseline; a candidata elevada o piora, enquanto a candidata escura não resolve o enquadramento.

O inline comum (`git status`) permaneceu igual. O inline dentro de link (`git diff`) mudou de fundo em **todos** os candidatos de `textCodeBlock.background`, confirmando o efeito colateral da regra `a code { background: var(--app-code-background) }`. Portanto essa propriedade não foi promovida a solução definitiva.

### Outras alternativas verificadas

| Alternativa | Experimento / cadeia de consumo | Resultado |
|---|---|---|
| `widget.border`, `editorWidget.border`, `textBlockQuote.border` | Overrides temporários oficiais; screenshot e estilos de todos os três blocos | **Rejeitado:** `pre` continua com border-width 0 px; nenhum consumo nessas regras |
| Borda de copiar via `inlineChatInput.border` | Capturada na candidata do prompt | Afeta o botão, não o container. Não resolve o enquadramento do conteúdo |
| Mais padding | Fonte e estilos já usam 8 px | Sem configuração oficial para variar o padding deste componente. Sem diferença de superfície, espaço adicional não cria contorno. Alteração upstream permanece pendente |
| Delimitador lateral de 2 px | Nenhum token oficial específico consumido | **Pendente upstream**, não renderizado; seria uma alteração de CSS-fonte, sem mexer em inline |
| Moldura interna de 1 px, fundo original | Nenhum token específico exposto atualmente | **Preferência upstream**, pendente de build/capturas; mantém contraste dos tokens e geometria |

O hover real fez o botão de copiar aparecer com opacity 1 em todos os candidatos de fundo. Seu rótulo e o callback de cópia identificado na fonte permaneceram preservados; o clipboard não foi acionado. Não há alegação de teste funcional da cópia.

### Menor alteração upstream recomendada

Manter os backgrounds e o highlighting existentes e acrescentar uma moldura **somente no `pre` do componente copiável**. Uma sombra interna evita consumir padding ou alterar dimensões de blocos curtos/longos:

```css
/* Proposta para a folha-fonte da extensão, não aplicada nem injetada. */
.codeBlockWrapper pre {
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--app-secondary-foreground) 55%, transparent);
}
```

`--app-secondary-foreground` consome `descriptionForeground`, `#939293` nos dois temas. A composição **prevista** resulta em aproximadamente `#5a5a5a` no MonoMin e `#606065` no MonoDracula, com diferença para a conversa de **2,64 / 2,61**. A referência de 3:1 de ícones funcionais não é uma meta automática para essa moldura decorativa; estes números não demonstram aprovação perceptiva. Uma alternativa usando a cor já existente `#5b595c` daria **2,63 / 2,37** contra a conversa, mas hardcode dessa cor na extensão não seria adequado para todos os temas.

A moldura proposta preserva padding 8 px, radius 4 px, fundo e foreground; não alcança inline, link inline ou botão irmão de copiar. Isso é consequência prevista do escopo do seletor, **não um resultado de teste do patch**. Em build upstream, verificar halos nas quinas, scroll horizontal, blocos longos e o hover/cópia antes de aprovar. Pode-se expor futuramente um token próprio para a moldura, evitando reaproveitar a borda de entrada. Um delimitador lateral de 2 px seria o segundo candidato, caso a moldura completa pareça excessiva; também depende de teste visual upstream.

**Recomendação:** moldura interna restrita ao bloco, em build da extensão; nenhuma troca global de fundo no tema. Não há caminho isolado para moldura/padding desse container pelas propriedades oficiais consumidas na versão instalada.

## Matriz consolidada

| Categoria | Resultado comprovado | Estado |
|---|---|---|
| Tema: borda neutra do prompt | Identificável em repouso; foco mais destacado em Manual/Plan/Auto; campos nativos amostrados preservados | **Aprovado experimentalmente na amostra**; aplicação permanente aguarda usuário |
| Efeito compartilhado da borda | Mensagem do usuário, divisória e copiar também ganham contorno | **Mudança deliberada do candidato**, precisa ser aceita junto com o diff |
| Tema: `icon.foreground` para Auto | SVG não muda | **Rejeitado** |
| Tema: erro escuro para Auto | Ícone melhora, foco cai a 1,11 e papel de erro muda | **Rejeitado por regressão do candidato** |
| Tema: foreground global de botão | Preview anterior já demonstrou dano ao botão primário | **Rejeitado**, evidência anterior reutilizada |
| Tema: fundos escuros/elevados dos blocos | Sem solução simultânea para delimitação, contraste de tokens e inline linkado | **Rejeitados** |
| Tema: tokens de borda para blocos | Sem borda no `pre` | **Rejeitados** |
| Extensão: foreground exclusivo de Auto | Regra mínima definida; valores escuros com preview anterior, isolamento não exercitado | **Pendente upstream** |
| Extensão: moldura interna / delimitador / padding | Escopo e previsões documentados; sem API estável atual | **Pendente upstream**, não aprovado visualmente |
| Preservação definitiva | Hashes de temas, manifesto, settings e bundles; cópias de bundles idênticas | **Aprovado** |
| Cobertura além da amostra | Notebook cell chat, permissões e consumidores latentes; active/Stop/ocupado; clipboard | **Pendente**, não classificado como aprovado |

São implementáveis apenas pelo tema as cores dos papéis oficiais já consumidos, com os alcances registrados. Isolar Auto e criar uma moldura específica exigem alteração no Claude Code. Alterar somente essas partes por configurações oficiais atuais **é inviável na versão examinada**; escrever um nome novo de propriedade no tema não cria suporte. CSS injetado, patches em bundles e configurações não suportadas foram excluídos dos ensaios.

## Reproduzir

Execute da raiz do repositório em Windows, na mesma instalação indicada em `prepare.cjs`. O harness requer Node com `fetch`/`WebSocket`. Os comandos de preparação/depuração precisam de acesso a uma sessão gráfica e localhost. Nenhuma etapa pede para mudar settings pessoais. Uma execução nova cria outro diretório descartável e substitui **apenas os arquivos de evidência desta subpasta**; preserve esta pasta antes de refazer se precisar manter os dois conjuntos.

```powershell
node docs/contrast-investigation/claude-code-panel/experiments/prepare.cjs --fixture
node docs/contrast-investigation/claude-code-panel/experiments/control.cjs fixture
node docs/contrast-investigation/claude-code-panel/experiments/run.cjs prompt
node docs/contrast-investigation/claude-code-panel/experiments/run.cjs auto
```

Espere a inicialização do CLI antes de `auto`: o modo precisa estar disponível no menu real. Se não estiver, registre o ensaio como pendente; não edite flags, contas ou bundles para forçá-lo. `ui.js` lista os controles reais. Os seletores com hashes são evidência desta versão; outra versão exige nova inspeção.

Para obter a área larga da conversa e testar blocos:

```powershell
node docs/contrast-investigation/claude-code-panel/experiments/cdp.cjs workbench layout 'View: Join All Editor Groups'
# Se as barras estiverem abertas, fechar somente as barras da janela temporária:
node docs/contrast-investigation/claude-code-panel/experiments/cdp.cjs workbench layout 'View: Toggle Secondary Side Bar Visibility'
node docs/contrast-investigation/claude-code-panel/experiments/cdp.cjs workbench layout 'View: Toggle Primary Side Bar Visibility'
node docs/contrast-investigation/claude-code-panel/experiments/run.cjs code
node docs/contrast-investigation/claude-code-panel/experiments/cdp.cjs workbench fixtureTab example.ts
node docs/contrast-investigation/claude-code-panel/experiments/cdp.cjs workbench inlineStart
node docs/contrast-investigation/claude-code-panel/experiments/run.cjs inline
node docs/contrast-investigation/claude-code-panel/experiments/run.cjs refine
node docs/contrast-investigation/claude-code-panel/experiments/run.cjs native
node docs/contrast-investigation/claude-code-panel/experiments/source.cjs
node docs/contrast-investigation/claude-code-panel/experiments/measure.cjs
node docs/contrast-investigation/claude-code-panel/experiments/build-proposal.cjs
node docs/contrast-investigation/claude-code-panel/experiments/validate.cjs
node docs/contrast-investigation/claude-code-panel/experiments/cdp.cjs workbench close
```

Não execute `git apply` para aplicar o patch nesta etapa. `build-proposal.cjs` faz somente `--check` e comparação em memória. As variantes são desfeitas entre grupos de ensaios; a janela isolada foi encerrada ao final desta execução. Os arquivos temporários foram conservados para inspeção, sem remover diretórios pessoais.

## Limitações e decisão necessária

Há validação real dos caminhos de tema testados, e há alternativas upstream concretas que ainda precisam de build de desenvolvimento. Não se produziram capturas de uma correção isolada do SVG ou de uma moldura inexistente na extensão, pois isso exigiria modificar os bundles copiados ou injetar CSS. Os exemplos de fonte acima são propostas para desenvolvimento upstream, não instruções de override local.

A aprovação experimental do prompt é limitada aos estados e consumidores capturados. O patch depende da aceitação visual do cinza com alpha e dos contornos compartilhados, além de eventual verificação dos diálogos/notebook fora da amostra. A política de manter elementos inativos menos destacados foi preservada. Os problemas preexistentes dos comentários/código da webview não foram confundidos com regressões nos temas do editor. Comentários `#797fa5`, itálicos, TextMate, tokens semânticos, Quick Open, busca do editor, Search lateral e Antigravity continuam byte a byte preservados nos arquivos definitivos.
