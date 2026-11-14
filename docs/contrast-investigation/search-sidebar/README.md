# Investigação isolada — contraste do Search lateral

**Nenhum tema foi alterado.** No VS Code 1.146.0 não foi encontrada uma propriedade oficial que controle exclusivamente o foreground de `.search-view .findInFileMatch`. Esse trecho herda a cor da linha, enquanto seu fundo usa `editor.findMatchHighlightBackground`. Os três foregrounds amarelos recentemente aprovados continuam intactos e não são consumidos por esse span.

Não há uma correção exclusivamente pelo tema que seja isolada ao Search lateral e resolva os dois temas nas condições exigidas. O MonoMin tem uma alternativa compartilhada de baixa opacidade que atinge 4,60:1 na amostra; ela também altera editor e chat e não foi aplicada. No MonoDracula, somente escurecer o fundo não pode resolver o texto herdado. A recomendação para uma solução isolada nos dois temas é suporte no próprio componente do VS Code para foreground do match.

## A. Diagnóstico confirmado

Foram reproduzidos 15 resultados em três arquivos controlados (`alpha.ts`, `beta.js`, `view.html`), com `contrast` dentro de identificadores, strings, comentário e HTML. A mesma linha pode aparecer em vários resultados, cada um destacando sua própria ocorrência. O restante da linha pode conter outra ocorrência sem destaque naquele resultado; não se deve confundir isso com ausência de correspondência no arquivo.

O Search apresenta previews de texto plano nesses casos: os tipos sintáticos dos arquivos não introduziram cores TextMate distintas nas linhas da árvore. Nome do arquivo, mensagem de contagem, texto comum da linha e span do match foram coletados separadamente.

**Tabela do baseline atual.** Foreground obtido do CSS computado; background medido nos pixels planos predominantes no interior do match. A última coluna usa esses pixels, sem usar as bordas ou o antialiasing das letras. A composição CSS independente está em coluna própria para mostrar os pequenos efeitos de quantização do renderizador.

| Tema | Estado | Foreground | Background efetivo, PNG | Contraste composto CSS | Contraste medido PNG |
|---|---|---|---|---:|---:|
| MonoMin | Não selecionado | `#888888` | `#353535` | 3,46:1 | **3,46:1** |
| MonoMin | Hover, não selecionado | `#eaeaea` | `#3e3e3e` | 8,89:1 | 8,89:1 |
| MonoMin | Selecionado com foco por teclado | `#F8C66B` | `#3e3e3e` | 6,76:1 | 6,76:1 |
| MonoMin | Selecionado, foco no editor | `#F8C66B` | `#3d3d3d` | 6,95:1 | 6,87:1 |
| MonoMin | Não selecionado, Ctrl+F aberto no editor | `#888888` | `#353535` | 3,46:1 | **3,46:1** |
| MonoDracula | Não selecionado | `#5e6886` | `#3f4047` | 1,87:1 | **1,87:1** |
| MonoDracula | Hover, não selecionado | `#fcfcfa` | `#494a50` | 8,66:1 | 8,59:1 |
| MonoDracula | Selecionado com foco por teclado | `#bd93f9` | `#494a50` | 3,69:1 | **3,66:1** |
| MonoDracula | Selecionado, foco no editor | `#bd93f9` | `#46474e` | 3,84:1 | **3,83:1** |
| MonoDracula | Não selecionado, Ctrl+F aberto no editor | `#5e6886` | `#3f4047` | 1,87:1 | **1,87:1** |
| Dark Modern instalado | Não selecionado | `#cccccc` | `#5d2e10` | 6,98:1 | 7,02:1 |
| Dark Modern instalado | Hover | `#cccccc` | `#693c1f` | 5,73:1 | 5,77:1 |
| Dark Modern instalado | Selecionado com foco por teclado | `#ffffff` | `#50443f` | 9,32:1 | 9,38:1 |
| Dark Modern instalado | Selecionado, foco no editor | `#cccccc` | `#724329` | 5,12:1 | 5,13:1 |
| Dark Modern instalado | Não selecionado, Ctrl+F aberto no editor | `#cccccc` | `#5d2e10` | 6,98:1 | 7,02:1 |

Os números anteriores de 3,46/1,87/6,98 foram reproduzidos pela composição CSS. O PNG do Dark Modern produz 7,02:1 pela quantização dos canais; não é uma mudança de tema. Valores abaixo de 4,5:1 não são classificados como conformes. A exceção de 4,04:1 do editor MonoMin não foi aplicada ao Search.

O hover pode mascarar o problema ao mudar o foreground da linha. A seleção do MonoDracula tem outro foreground, roxo, e ainda fica abaixo de 4,5:1 no interior do match. São comportamentos preexistentes da combinação de cores, não regressões introduzidas nesta investigação.

## B. Propriedades, CSS e consumidores

Regra efetiva na instalação, também localizada no [código upstream do Search](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/search/browser/media/searchview.css):

```css
.search-view .findInFileMatch {
  background-color: var(--vscode-editor-findMatchHighlightBackground);
  border: 1px solid var(--vscode-editor-findMatchHighlightBorder);
}
```

Essa regra não declara `color`. O renderer cria um `span.findInFileMatch` dentro de `a.plain.match`; a regra `.monaco-workbench a.plain` usa `color: inherit`. O container lateral tem `color` inline correspondente a `sideBar.foreground`. A cadeia foi observada do container ao span, com os mesmos valores RGB. Hover, seleção ativa e seleção sem foco substituem a cor da linha pelas propriedades de listas. [Cadeia de herança e regras](inheritance-evidence.json).

| Propriedade | Consumo e abrangência comprovados |
|---|---|
| `editor.findMatchHighlightBackground` | Fundo do span do Search; outras ocorrências do editor; defaults do chat nativo e do Search Editor. Não é específica da barra lateral |
| `editor.findMatchHighlightBorder` | Borda do span do Search e das outras ocorrências do editor; default de borda do Search Editor. Não muda o contraste do interior do texto por si só |
| `sideBar.foreground` | Origem herdada do texto normal das linhas não selecionadas; também abrange outras views laterais. Não é proposta de alteração |
| `list.hoverForeground/Background` | Linha em hover; infraestrutura compartilhada de listas e árvores |
| `list.activeSelectionForeground/Background`, `list.inactiveSelectionForeground/Background` | Cores da linha selecionada conforme foco; compartilhadas com outras listas/árvores |
| `list.focusForeground/Background` | Estados de foco de listas, conforme composição com seleção; não são controles exclusivos dos matches do Search |
| `list.highlightForeground` | Não é consumida pelo `span.findInFileMatch` investigado; os temas já fornecem amarelo e o span continua cinza/azul/roxo conforme a linha |
| `editor.findMatchForeground`, `editor.findMatchHighlightForeground` | Foregrounds no editor e chat nativo; não são aplicados ao span do Search atual |
| `search.resultsInfoForeground` | Somente mensagem de conclusão/contagem; o ensaio confirmou mudança nessa mensagem e nenhuma mudança nos matches |
| `searchEditor.findMatchBackground/Border` | Resultados dentro de um Search Editor, que é outra interface; não são overrides do painel Search lateral |

O inventário de registro do workbench não contém um foreground dedicado aos matches da árvore Search. A [referência oficial de cores](https://code.visualstudio.com/api/references/theme-color#editor-colors) também separa a mensagem de contagem e as propriedades do Search Editor. CSS custom properties internas, incluindo `--vscode-surface-foreground`, não são novas chaves de tema.

No chat, `chat.findMatchHighlightBackground` herda por default o background das outras ocorrências do editor; `chat.findMatchBackground` duplica sua opacidade. Os seletores `::highlight(chat-find-current-match)` e `::highlight(chat-find-other-match)` consomem esses fundos e os foregrounds amarelos do editor. Quando o background-base é opaco, ambos os defaults ficam opacos e iguais. Esse efeito foi observado nos ensaios.

O Search Editor herda defaults relacionados ao editor, atenuados por fator 0,66 na instalação. Isso foi identificado no registro, mas **não foi validado visualmente** no Search Editor. O alcance de uma propriedade compartilhada não termina nos componentes aqui capturados.

## C. Alternativas avaliadas

Todos os valores dos candidatos já existem nas respectivas paletas. Foram criados oito candidatos em cópias temporárias: quatro por tema. Nenhuma alteração foi aplicada nos arquivos do projeto.

Na tabela, previsão significa composição sobre os estilos computados; medição significa background efetivamente pintado no PNG, com o foreground computado. A linha normal não selecionada é o caso de referência; os demais estados estão nos JSONs.

| Alternativa / tema | Propriedade e valor temporário | Contraste previsto no Search | Contraste medido no Search | Impacto observado | Viabilidade |
|---|---|---:|---:|---|---|
| A — foreground específico | Nenhuma chave oficial localizada | — | Não executável pelo tema | Exige suporte do componente | Melhor isolamento, indisponível hoje |
| B — fundo escuro MonoMin | `editor.findMatchHighlightBackground: #101010` | 5,37:1 | 5,37:1 | Editor e chat mudam; no chat atual/outras passam a ter o mesmo fundo | Rejeitado como correção isolada |
| B — fundo escuro MonoDracula | `editor.findMatchHighlightBackground: #1d1f28` | 2,97:1 | 2,97:1 | Não atinge 4,5; muda editor e chat | Rejeitado |
| B — fundo claro MonoMin | `editor.findMatchHighlightBackground: #EAEAEA` | 2,95:1 | 2,95:1 | Não resolve Search; amarelo no editor/chat cai a 1,31:1 | Rejeitado |
| B — fundo claro MonoDracula | `editor.findMatchHighlightBackground: #fcfcfa` | 5,38:1 | 5,38:1 | Amarelo no editor/chat cai a 1,09:1; estados selecionados não ficam todos conformes | Rejeitado |
| B — baixa opacidade MonoMin | `editor.findMatchHighlightBackground: #EAEAEA0c` | 4,62:1 | **4,60:1** | Textos legíveis na amostra; fundos dos matches do editor/chat ficam menos destacados | Possível compromisso compartilhado, não isolado; exige aprovação específica |
| B — baixa opacidade MonoDracula | `editor.findMatchHighlightBackground: #fcfcfa0c` | 2,59:1 | **2,58:1** | Seleção melhora, mas a linha normal continua insuficiente | Rejeitado como solução completa |
| C — mensagem de contagem MonoMin | `search.resultsInfoForeground: #C1C0C0` | 3,46:1 no match | 3,46:1 | Só a mensagem de contagem muda | Não resolve |
| C — mensagem de contagem MonoDracula | `search.resultsInfoForeground: #C1C0C0` | 1,87:1 no match | 1,87:1 | Só a mensagem de contagem muda | Não resolve |
| D — foreground do match no próprio componente, usando amarelos existentes | Mudança upstream; nenhum override disponível no tema atual | 7,76:1 MonoMin / 9,23:1 MonoDracula no estado normal | **Não renderizado** | Proposta restrita aos spans do Search, sem alterar fundos | Rota recomendada para isolamento; precisa de implementação upstream e validação |

### Por que o background não resolve os dois temas

No MonoMin, `#888888` sobre o fundo lateral original tem 5,15:1; o overlay claro do match reduz essa relação. Diminuir sua opacidade pode recuperar a legibilidade. O candidato `#EAEAEA0c` usa a mesma cor já presente em `list.hoverBackground`, com aproximadamente 5% de opacidade no CSS emitido pelo VS Code.

No MonoDracula, `#5e6886` sobre o fundo lateral original tem apenas 2,97:1, antes de qualquer overlay. Até sobre preto atinge no máximo **3,80:1**. Para atingir 4,5:1 mantendo esse foreground, o fundo precisaria de luminância relativa de pelo menos **0,8051**. O amarelo `#f1fa8c`, por sua vez, precisa de fundo com luminância de no máximo **0,1588** para 4,5:1. Os intervalos não se intersectam. Esses limites são matemáticos para os foregrounds fixados, não uma afirmação de que todos os layouts compõem os mesmos fundos. Os ensaios claro/escuro confirmaram o conflito no renderizador.

Mudar somente a borda não altera o foreground nem o background interior, portanto não resolve a relação de contraste dos caracteres. Usar a borda amarela em todas as outras ocorrências ainda ampliaria o efeito ao editor e reduziria uma distinção que hoje depende da borda da ocorrência atual. Nenhuma borda foi alterada, nem nas cópias de teste.

### Editor, chat e estados do candidato de baixa opacidade

No MonoMin `LowAlpha`, os pixels da busca do editor com Ctrl+F e Search simultâneos apresentaram mínimo de **6,76:1** entre os trechos amostrados. Com seleção de texto sobre o comentário, esse trecho ficou em **6,98:1**. No Search, a linha em hover mediu **11,93:1**, a selecionada com foco **9,08:1** e a selecionada sem foco **9,32:1**. A cor do texto normal, o foreground amarelo, a borda da ocorrência atual, as seleções e o outline da árvore não foram modificados pelo candidato.

No chat MonoMin, a composição computada passou a 9,30:1 na ocorrência atual e 10,35/9,55:1 nas outras, conforme o fundo da mensagem. **Essas relações do chat são composições de CSS efetivamente renderizado, não medições de pixels do texto do chat.** A diferença de fundo entre atual e outras permaneceu, porém menor: aproximadamente `#282828` contra `#202020`, antes `#555555` contra `#353535`. A saliência dos destaques diminui; contraste de texto maior não basta para declarar ausência de regressão perceptiva. A aprovação visual desse compromisso permanece pendente.

Os fundos opacos, em contraste, tornaram os dois tipos de highlight do chat iguais nos estados capturados. Os fundos claros prejudicaram diretamente o amarelo nas buscas do editor e do chat. A documentação oficial também orienta que `editor.findMatchHighlightBackground` preserve transparência para não ocultar outras decorações. Esses candidatos serviram para testar a hipótese e foram rejeitados, não são propostas de produção.

### Foreground herdado

`search.resultsInfoForeground` foi a candidata oficial suficientemente local que foi testada; sua finalidade não é o corpo dos resultados. Não foi encontrado um controle local equivalente para o foreground de todas as linhas de resultados. `sideBar.foreground` e as cores gerais de listas têm alcance amplo e não foram alterados nem recomendados. Clarear toda a barra lateral corrigiria uma parte do sintoma ao custo de mudar outros componentes e hierarquia; isso está fora do objetivo.

O texto comum fora do match continua em aproximadamente 2,97:1 no MonoDracula sobre o fundo lateral. Uma futura correção exclusiva do foreground dos matches não corrige automaticamente esse outro texto funcional. Essa limitação deve ser tratada em decisão separada, sem usar o problema como justificativa para uma alteração global nesta tarefa.

## D. Recomendação técnica e decisões dependentes de aprovação

**Para os dois temas, recomendar suporte upstream ao foreground de matches do Search, mantendo os temas atuais até existir um consumidor oficial apropriado.** Não existe hoje uma alteração JSON isolada que eu possa recomendar como correção completa dentro das restrições.

A menor mudança conceitual no componente seria fazer o span consumir o foreground de outras ocorrências já registrado, com fallback à herança quando não definido. Isso passaria a usar os amarelos atuais, sem acrescentar propriedades aos temas. Uma solução upstream com papel de cor próprio para o Search permitiria maior independência; o nome e os fallbacks precisariam ser definidos pelo projeto VS Code. **Nenhum nome novo é apresentado aqui como chave válida do tema atual.**

| Proposta upstream, somente texto do match | Valor exato | Contraste previsto, normal | Menor previsão entre os estados de Search capturados | Contraste renderizado com a proposta |
|---|---|---:|---:|---|
| MonoMin, amarelo já existente | `#F8C66B` | 7,76:1 | 6,76:1 | Não testado; exige mudança do componente |
| MonoDracula, amarelo já existente | `#f1fa8c` | 9,23:1 | 7,97:1 | Não testado; exige mudança do componente |
| MonoMin, alternativa neutra de menor destaque | `#C1C0C0` | 6,76:1 | 5,89:1 | Não testado; decisão visual separada |
| MonoDracula, alternativa neutra de menor destaque | `#C1C0C0` | 5,68:1 | 4,90:1 | Não testado; decisão visual separada |

Essas previsões usam os backgrounds compostos medidos no workbench, sem injetar foregrounds por CSS. O texto fora do match, fundos de seleção, hover, foco e bordas permaneceriam próprios de cada estado. Igualar a cor dos matches entre estados não exige igualar o texto normal nem a hierarquia das linhas. A distinção final deve ser verificada no componente implementado, especialmente no MonoMin selecionado, onde o texto normal já é amarelo e o background precisa continuar identificando o match.

Não há mecanismo oficial estável para uma extensão de tema aplicar seletor CSS arbitrário ao DOM do workbench. `workbench.colorCustomizations` usa os mesmos papéis registrados, sem um escopo por span do Search. A [documentação de capacidades](https://code.visualstudio.com/api/extension-capabilities/overview#restrictions) explica a restrição de acesso ao DOM da interface por extensões. Não se recomenda injeção de CSS, patch de bundle ou alteração interna de extensão. Nenhuma issue ou mensagem externa foi enviada nesta investigação.

O conjunto mínimo de decisões pendentes é:

1. **Solução isolada para ambos:** decidir se deseja encaminhar uma proposta upstream e preferir amarelo ou neutro como direção visual; implementação e validação do componente permanecem necessárias. Nenhuma alteração de tema disponível hoje entrega isso.
2. **Compromisso somente MonoMin, se o escopo compartilhado for aceito:** uma propriedade, `editor.findMatchHighlightBackground`, de `#EAEAEA26` para `#EAEAEA0c`. Resolve as amostras do Search, mas reduz os fundos de destaque no editor/chat e afeta defaults do Search Editor. Requer autorização explícita para modificar esse background; não foi implementado. A margem normal é de apenas cerca de 0,10 acima de 4,5:1 e não garante outros perfis/estados.
3. **MonoDracula:** não há proposta aprovada ou recomendada de simples background. Evitar tentar resolver com fundos claros, cores globais ou mudança do amarelo do editor.

## E. Evidências, reprodução e limites

| Amostra | Baseline | Candidato |
|---|---|---|
| Search normal MonoMin | [captura](evidence/monomin-baseline-normal.png) | [baixa opacidade](evidence/monomin-lowalpha-normal.png) |
| Search normal MonoDracula | [captura](evidence/monodracula-baseline-normal.png) | [baixa opacidade, insuficiente](evidence/monodracula-lowalpha-normal.png) |
| Seleção com foco MonoDracula | [captura](evidence/monodracula-baseline-keyboard.png) | [fundo claro](evidence/monodracula-lightbackground-keyboard.png) |
| Editor e seleção MonoMin | [captura](evidence/monomin-baseline-selection.png) | [baixa opacidade](evidence/monomin-lowalpha-selection.png) |
| Editor e chat MonoMin | [captura](evidence/monomin-baseline-chat.png) | [baixa opacidade](evidence/monomin-lowalpha-chat.png) |
| Editor e chat MonoDracula | [captura](evidence/monodracula-baseline-chat.png) | [regressão com fundo claro](evidence/monodracula-lightbackground-chat.png) |
| Referência Dark Modern | [normal](evidence/dark-modern-normal.png) | [seleção e foco](evidence/dark-modern-keyboard.png) |

Dados reproduzíveis:

- [diagnostic-tables.json](diagnostic-tables.json): células das tabelas, composição CSS e contraste com pixels do PNG.
- [measurements.json](measurements.json), [candidate-summary.json](candidate-summary.json), [state-summary.json](state-summary.json): foregrounds, fundos, linhas normais, nomes, estados, editor, chat e previsões.
- [source-evidence.json](source-evidence.json): registro e trechos da instalação local, com versão, offsets e hashes dos bundles. O código upstream `main` foi consultado como complemento; a versão instalada é a autoridade para esta investigação.
- [validation.json](validation.json): arquivos protegidos e settings pessoais idênticos por SHA-256; candidatos temporários limitados aos deltas declarados, sem mudanças em sintaxe, semântica ou foregrounds amarelos.
- [session-initial.json](session-initial.json) e [session.json](session.json): duas sessões descartáveis, mesma instalação, inventário de 15 extensões congeladas e mesmas configurações de origem. A segunda acrescentou `LowAlpha`. Semantic highlighting ligado somente nos perfis temporários para TS/JS. Customizações de cor relevantes do usuário registradas nesses arquivos.
- `evidence/*-regions-pixels.json`: pixels predominantes por região e relações de contraste. `*-regions.json` registra as coordenadas; os demais JSONs contêm estilos computados, classes e foco. A extração lê os PNGs, não edita imagens.

Os temas do repositório, incluindo `#797fa5` nos comentários do MonoDracula, `tokenColors`, configurações semânticas, os três foregrounds amarelos, cores de seleção/foco e manifesto foram preservados byte a byte. Bundles JS/CSS do VS Code também tiveram hashes conferidos. Não houve instalação ou edição de extensão, alteração de configuração pessoal, envio de prompt, modificação do Antigravity, commit ou publicação. Somente este diretório de investigação foi criado no projeto.

Reprodução na raiz, usando os caminhos locais registrados pelos scripts:

```powershell
node docs/contrast-investigation/search-sidebar/source.cjs
node docs/contrast-investigation/search-sidebar/prepare.cjs
node docs/contrast-investigation/search-sidebar/collect.cjs --baseline
node docs/contrast-investigation/search-sidebar/collect.cjs
node docs/contrast-investigation/search-sidebar/collect.cjs --alpha
node docs/contrast-investigation/search-sidebar/measure.cjs
node docs/contrast-investigation/search-sidebar/pixels.cjs
node docs/contrast-investigation/search-sidebar/summarize.cjs
node docs/contrast-investigation/search-sidebar/tables.cjs
node docs/contrast-investigation/search-sidebar/validate.cjs
node docs/contrast-investigation/search-sidebar/cdp.cjs workbench close
```

`prepare.cjs` cria novo perfil e cópias de temas; requer acesso autorizado ao Electron. A porta local 9381 precisa estar livre. Nesta execução houve duas sessões: preserve a primeira como `session-initial.json` antes de uma segunda preparação. O validador compara seus hashes e inventários; em uma reprodução com uma única sessão, copie o primeiro `session.json` para `session-initial.json`. Não sobrescreva arquivos de evidências históricos sem antes guardar a execução que deseja comparar. Para outra instalação, ajuste os caminhos dos scripts em uma cópia.

**Limites:** resultados válidos para VS Code 1.146.0, perfil e fixtures registrados; outros consumidores do background compartilhado, incluindo Search Editor, não receberam aprovação visual. A proposta upstream de foreground foi calculada, não aplicada/renderizada, porque injeção CSS e patches estão proibidos. Opacidade, clipping e antialiasing exigem cautela na leitura de pixels: as tabelas usam uma região representativa por estado com sua contagem de pixels, não um índice global de similaridade de screenshots. Seleção/foco foram classificados pelas classes, `aria-selected` e elemento ativo reais, e não apenas pelo nome do arquivo de captura. Ctrl+F, Search e seleção simultâneos foram testados, sem extrapolar a exceção do editor ao painel.

O contraste segue a luminância relativa sRGB e a referência de [4,5:1 da WCAG 2.2 para texto normal](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Linhas não selecionadas continuam funcionais e não foram tratadas como controles desabilitados. A investigação termina com essas evidências; qualquer correção depende de aprovação explícita.
