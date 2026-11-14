# Diagnóstico — Antigravity e destaques de busca

**Nenhuma proposta foi aplicada.** Os dois temas, o manifesto e as configurações pessoais permaneceram idênticos aos arquivos do início desta investigação. Os comentários do MonoDracula continuam em `#797fa5`.

## Ambiente, execução e limites

Investigação no **VS Code 1.146.0**, Google Antigravity **1.12.0** e interface servida pelo backend local da extensão. Foram reutilizadas as extensões congeladas da validação anterior, com cópias atuais dos temas e um perfil temporário novo. As trocas entre MonoMin, MonoDracula e **Dark Modern original da instalação** ocorreram somente nesse perfil. Não foi usada a referência Dark Modern do repositório para substituir o tema incorporado.

Foram inspecionados o workbench, a webview e o iframe interno via DevTools, CSS computado, regras aplicáveis, fontes JavaScript/CSS e o registro local de cores. As cores de candidatos foram **calculadas**, sem alterar CSS, temas ou customizações para simulá-las. Capturas e dados estão em `evidence/`; cálculos completos, em [analysis.json](analysis.json); registro e consumidores, em [source-evidence.json](source-evidence.json).

Há duas limitações importantes:

- A captura mencionada na solicitação não acompanhou o arquivo de texto anexado. Portanto não foi possível confirmar que representa exatamente esta versão e este estado da integração.
- O Antigravity abriu um onboarding de consentimento. Não foi aceito nem contornado. A página subjacente foi medida, mas o menu **Recently opened** não foi aberto. Suas regras foram localizadas no código; seus números abaixo são **previsões de fonte**, não medições de linhas visíveis do menu. Nenhum teste visual dessa seção está aprovado.

Não foram enviados prompts, abertas conversas privadas ou alteradas preferências de telemetria. Os dados salvos selecionam elementos de interface, sem histórico de conversas. Não foi publicado screenshot do painel com projetos/conversas pessoais ao fundo. Os screenshots nativos de Search/Quick Open/editor usam somente fixtures criadas para esta investigação.

## A. Origem das cores no Antigravity

### Implementação comprovada

A contribuição `antigravity.panel` tem `type: webview`. A extensão constrói o wrapper do VS Code e nele carrega um iframe local com `extensionView=true` e `extensionVariant=vs-code`. A interface interna usa componentes próprios e estilos Tailwind; o contorno/contêiner da view continua sendo do VS Code. Logo, trata-se de uma combinação de tecnologias.

O caminho de cores foi confirmado nas três camadas:

1. Na barra lateral, o wrapper define `--vscode-agy-foreground` a partir de **`sideBar.foreground`** e `--vscode-agy-background` a partir de **`sideBar.background`**.
2. O bridge usa esses valores para substituir `foreground` e as sementes de editor enviadas ao iframe. A cor global clara de `foreground` do tema não é a cor principal final desse painel lateral.
3. O Antigravity deriva `--muted-foreground` misturando **50% do foreground com o fundo**. Os caminhos de arquivos têm ainda um seletor explícito `opacity-50`. Não é um estado disabled.

| Camada | MonoMin | MonoDracula | Dark Modern |
|---|---|---|---|
| Foreground global do workbench | `#eaeaea` | `#fcfcfa` | `#cccccc` |
| Foreground efetivo da interface Antigravity lateral | `#888888` | `#5e6886` | `#cccccc` |
| Fundo Antigravity | `#151515` | `#1d1f28` | `#181818` |
| Fundo de card/campo, composto | aproximadamente `#1b1b1b` | aproximadamente `#20232d` | aproximadamente `#212121` |

Os nomes `--vscode-agy-*` são variáveis internas do wrapper: **não são propriedades de cor registradas pela extensão**. Não proponho acrescentar `agy.foreground` ao JSON do tema. O manifesto não expõe configuração de cores por componente. O bridge também **não repassa `list.highlightForeground`**; mudar essa propriedade não corrige automaticamente os matches do Antigravity.

### Elementos e seletores

| Elemento | Seletor/componente localizado | Origem e estado |
|---|---|---|
| Nome de arquivo | `[data-testid="menu-option-label"]` | Herda foreground da interface; componente funcional, sem atenuação própria na regra localizada |
| Caminho | `[data-testid="menu-option-description"]` | CSS Antigravity `opacity-50`; pode identificar arquivos homônimos, não equivale a disabled |
| Recently opened | `[data-testid="menu-section-header"]` | `text-muted-foreground`, derivado a 50%; cabeçalho visual, relevância funcional depende do contexto |
| Caracteres encontrados no menu | `[data-testid="fuzzy-match-highlight"]` | `font-semibold text-primary`; `--primary` vem de **`button.background`**, não de `list.highlightForeground` |
| Rótulo de workspace | Botão com `text-muted-foreground`, filho `.truncate` | Atenuação interna; identificado no DOM subjacente |
| Placeholder | `.text-foreground.opacity-60` | Foreground principal com opacidade 0,6, sobre o card |
| Borda aparente do campo | `.surface-composer.bg-card-border`, padding de 1 px envolvendo `.surface-composer-card.bg-card` | Cor derivada de `--card-border`; não consome `input.border` nesse estado |
| Ícones do menu | `text-secondary-foreground` no renderer de opções | Derivação interna; não medidos no menu aberto. Ícones habilitados e decorativos precisam ser separados antes de propor correção |

O renderer mantém classe `bg-secondary` para a opção selecionada e distingue seleção de matches. A opacidade 50% dos caminhos não desaparece ao recolorir um span filho: afeta também seu highlight.

### Medições do DOM subjacente, sem a oclusão do modal

Esses valores descrevem as cores nominais que a página usa antes de ser coberta pelo onboarding. Não caracterizam o texto sob um overlay escuro como defeito de contraste da página normal.

| Elemento | MonoMin | MonoDracula | Dark Modern |
|---|---:|---:|---:|
| Título principal | 5,15:1 | 2,97:1 | 11,06:1 |
| Rótulo funcional de workspace | 2,21:1 | 1,68:1 | 3,69:1 |
| Placeholder sobre o card | 2,59:1 | 1,85:1 | 4,52:1 |
| Rótulo Customizations | 3,44:1 | 2,25:1 | 6,71:1 |
| Delimitação do campo contra seu interior | 1,06:1 | 1,04:1 | 1,12:1 |

A referência para texto normal funcional é 4,5:1; o título principal medido tem 24 px e requer avaliação como texto grande. Componentes não textuais relevantes usam 3:1 quando aplicável. O limiar não justifica recolorir decoração ou uniformizar estados. O cálculo usa cores nominais, não pixels antialiasados, conforme a [orientação WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### Recently opened — previsões de fonte, não confirmação visual

Os números usam o card nominal calculado em cada tema. Nome herda o foreground; caminho é composto com opacidade 0,5; cabeçalho usa a mistura muted; match usa o primary.

| Elemento previsto | MonoMin | MonoDracula | Dark Modern |
|---|---:|---:|---:|
| Nome | 4,87:1 | 2,84:1 | 10,03:1 |
| Caminho | 2,18:1 | 1,65:1 | 3,60:1 |
| Cabeçalho | 2,11:1 | 1,62:1 | 3,35:1 |
| Match, sobre card normal | 1,10:1 | 1,00:1 | 3,56:1 |

O match tem um problema de integração tecnicamente claro: **a extensão usa uma cor de fundo de botão como cor de texto**. Os temas usam botões escuros intencionalmente (`#101010` e `#21222c`), resultando em texto potencialmente indistinguível nesse componente. O Dark Modern fornece um azul mais claro, mas isso não torna correta essa equivalência de papéis. A confirmação do defeito na captura do usuário exige abrir o menu real.

### Candidatos pontuais para discussão, não alterações atuais de tema

Todos os hexadecimais propostos já existem nas respectivas paletas. As três primeiras linhas de cada tema dependem de confirmação do menu aberto. As demais usam medições nominais do DOM subjacente. **A abrangência pretendida é somente o componente do Antigravity; a rota é correção upstream/suporte oficial da extensão, hoje não exposto no tema.** Não sugerir CSS injetado, patch do bundle ou mudança global de `sideBar.foreground`/`button.background`.

| Tema | Componente / origem | Cor atual efetiva | Fundo | Atual | Candidato | Proposto | Impacto / abrangência |
|---|---|---|---|---:|---|---:|---|
| MonoMin | Nome / foreground herdado | `#888888` | `#1b1b1b` | 4,87 | `#C1C0C0` | 9,51 | Médio; **não é correção isoladamente necessária**. Apenas candidato conjunto se os caminhos forem clareados, preservando hierarquia |
| MonoMin | Caminho / opacity .5 | `#515151` | `#1b1b1b` | 2,18 | `#939293` opaco | 5,57 | Médio; remover atenuação forçada somente do texto funcional, mantendo nome mais destacado |
| MonoMin | Cabeçalho / muted | `#4f4f4f` | `#1b1b1b` | 2,11 | `#939293` | 5,57 | Médio; somente se o cabeçalho comunicar contexto necessário |
| MonoMin | Placeholder / opacity .6 | `#888888` com .6 | `#1b1b1b` | 2,59 | `#888888` opaco | 4,87 | Médio; texto instrutivo do campo, não toda interface |
| MonoMin | Campo / card-border interno | aprox. `#202020` | `#1b1b1b` | 1,06 | `#888888` | 4,87 | Médio; contorno específico; foco deve continuar mais destacado, por exemplo com o amarelo existente |
| MonoDracula | Nome / foreground herdado | `#5e6886` | `#20232d` | 2,84 | `#C1C0C0` | 8,66 | Médio; nomes funcionais. Perde parte do azul, sem atingir o brilho do texto principal `#fcfcfa` |
| MonoDracula | Caminho / opacity .5 | `#3f4559` | `#20232d` | 1,65 | `#939293` opaco | 5,07 | Médio; mantém subordinação ao nome proposto |
| MonoDracula | Cabeçalho / muted | `#3e4457` | `#20232d` | 1,62 | `#939293` | 5,07 | Médio; necessidade funcional ainda a confirmar |
| MonoDracula | Placeholder / opacity .6 | `#5e6886` com .6 | `#20232d` | 1,85 | `#939293` opaco | 5,07 | Médio; instrução específica do campo |
| MonoDracula | Campo / card-border interno | aprox. `#232631` | `#20232d` | 1,04 | `#6272a4` | 3,34 | Médio; foco precisaria permanecer mais forte, com um acento existente como `#bd93f9` |

As relações são `:1`. As cores compostas exibidas foram arredondadas a hexadecimal para leitura; `analysis.json` mantém as medições e relações numéricas. Esses candidatos não constituem uma recomendação de clarear todas as legendas/ícones. Não há proposta para ícones cujo papel e estado não foram confirmados.

Existe no código da UI Antigravity um controle oficial **Appearance → Contrast: Default / Strong**. A configuração Strong aumenta alguns percentuais de superfícies e bordas, mas **não remove a mistura fixa de 50% do muted nem a opacidade dos caminhos**. Sua disponibilidade após o onboarding e seu efeito visual não foram testados; não apresentá-la como solução completa. Nenhuma preferência foi alterada.

## B. Amarelo nos caracteres encontrados

### Consumidores comprovados e efeitos colaterais

Todas as propriedades abaixo foram verificadas no registro do VS Code instalado. Sua existência não significa que todos os componentes as consumam. A [referência oficial de cores](https://code.visualstudio.com/api/references/theme-color) complementa o registro; os consumidores efetivos foram conferidos no CSS/DOM local.

| Componente | Consumo comprovado | Consequência |
|---|---|---|
| Quick Open e infraestrutura Quick Input | `.monaco-highlighted-label .highlight`: `list.highlightForeground`; opção focada usa `quickInputList.focusHighlightForeground` | Texto encontrado em negrito. O CSS explicitamente limpa o fundo do highlight |
| Focus de Quick Input | `quickInputList.focusHighlightForeground` → `list.focusHighlightForeground` → `list.highlightForeground` no dark | A troca do highlight base pode propagar por fallback; não acrescentar chaves redundantes só para cobertura |
| Árvores/listas de arquivos, incluindo Explorer quando há ranges de filtro | `.file-icon-themable-tree … .highlight` e `.pane-body .monaco-tl-contents … .highlight` | Usam `list.filterMatchBackground/Border` e **`color: unset !important`**. Não assumir que `list.highlightForeground` recolore esses trechos |
| Search lateral, corpo dos resultados | `.search-view .findInFileMatch` | Background/border vêm de `editor.findMatchHighlightBackground/Border`; foreground é herdado da linha |
| Busca no editor | `.findMatch`, `.currentFindMatch` e spans `findMatchInline` | Background, foreground e border atuais/demais são propriedades separadas; não alteram `tokenColors` permanentemente |
| Autocomplete | CSS específico `editorSuggestWidget.highlightForeground` e focus correspondente | Não assumir que uma mudança de listas substitui esses valores dedicados, já explicitados nos temas |
| Busca em chat nativo | `::highlight(chat-find-current-match/other-match)` também usa os foregrounds de busca do editor | Possível efeito global adicional de `editor.findMatch*Foreground`; não é a UI interna do Antigravity |
| Antigravity | `fuzzy-match-highlight` usa `text-primary`, com bridge limitado | Nenhuma das propriedades de highlight de listas investigadas controla diretamente esses spans nesta versão |

**Problema confirmado de tema na busca lateral:** o texto normal das correspondências, habilitado e não selecionado, tem contraste de **3,46:1 no MonoMin** (`#888888` sobre `#353535` composto) e **1,87:1 no MonoDracula** (`#5e6886` sobre `#3e4048` composto). No Dark Modern, o mesmo cenário mede **6,98:1** (`#cccccc` sobre aproximadamente `#5d2e10`). A sobreposição clara atual agrava a relação com o texto herdado. Esse caso não é um controle disabled.

### Paletas e alternativas

Amarelos confirmados nos próprios temas: **MonoMin `#F8C66B`**, MonoDracula **`#f1fa8c`**, inclusive nas bordas atuais de busca. Não são o mesmo hexadecimal.

| Tema e contexto | A — texto amarelo | B — fundo amarelo com texto escuro existente |
|---|---|---|
| MonoMin, Quick Open nos dois estados de linha amostrados | 10,35–11,55:1 sobre os fundos reais | `#1f1f1f` sobre `#F8C66B`: 10,42:1 **matemático**, mas Quick Input não consome esse fundo via `list.filterMatchBackground` |
| MonoDracula, Quick Open | 12,79–14,69:1 | `#282a36` sobre `#f1fa8c`: 12,74:1, com a mesma limitação técnica |
| MonoMin, outras ocorrências no editor | 6,82:1 sobre o highlight atual composto `#3d3d3d` | 10,42:1 com texto escuro. Exige os foregrounds específicos do editor, além do background |
| MonoDracula, outras ocorrências no editor | 7,94:1 sobre `#484a53` composto | 12,74:1 com texto escuro. Mesma necessidade de separar atual/demais |

Os valores de A são **previsões calculadas sobre os fundos medidos**, não previews aprovados de uma cor já aplicada. A proposta menor para Quick Input é mudar `list.highlightForeground`; no editor, seriam candidatos `editor.findMatchForeground` e `editor.findMatchHighlightForeground`. Os backgrounds e bordas de seleção/foco permaneceriam independentes. O item atual já tem borda amarela nos dois temas; não seria necessário inventar outra cor.

**Limites de A:**

- No Quick Open de um tema cuja linha selecionada já usa amarelo, match e texto normal podem compartilhar a cor. O negrito de correspondência permanece, mas a diferenciação por cor pode diminuir. Isso exige validação do estado selecionado antes de aprovar uma alteração global.
- A regra específica das árvores pode ignorar o foreground proposto. O Search lateral não tem foreground dedicado do match entre as propriedades verificadas. Portanto A **não entrega amarelo em todos esses componentes só com `list.highlightForeground`**.
- Alterar foreground de busca do editor também afeta consumidores nativos de chat; é impacto médio, não uma mudança estritamente local do Antigravity.

**Limites de B:**

- Quick Input declara `background-color: unset`; um fundo amarelo de filtro não seria aplicado ali. Não proponho CSS injetado para forçá-lo.
- Alterar `editor.findMatchHighlightBackground` também colore o Search lateral. Ali, o texto **não recebe automaticamente** o foreground escuro do editor: no MonoMin, `#888888` sobre amarelo cairia para **2,24:1**. No MonoDracula, o texto normal daria **4,95:1**, mas isso não comprova os estados selecionados, acentuados e descrições. Não aprovar B globalmente com base somente no editor.
- Em árvores, o foreground herdado de cada estado e a regra `color: unset !important` também impedem garantir um texto escuro apenas nas correspondências.

**Antigravity, previsão condicionada:** sobre o card normal, A amarelo teria 10,92:1/14,07:1. Porém, dentro do caminho com `opacity-50`, cairia para aproximadamente **3,69:1/4,57:1**. B com texto escuro, também sujeito à opacidade do pai, resultaria em aproximadamente **3,61:1/4,35:1**. Essa previsão demonstra por que recolorir só o span não resolve a atenuação do caminho. Requer uma correção do componente e da ponte de tema, com seleção mantendo seu próprio fundo.

### Recomendação técnica para aprovação posterior

1. **Antigravity:** confirmar o menu sem onboarding e encaminhar correção específica da extensão: papéis de texto adequados, opacidade de caminhos funcionais e highlight independente de fundo de botão. Não mudar `button.background` globalmente para tentar corrigir `text-primary`.
2. **Quick Input:** A é o candidato mais simples e compatível, por usar o consumidor existente e conservar os fundos de seleção. Avaliar sua propagação em listas e a distinção da linha focada antes de aplicar.
3. **Editor:** A evita o problema de texto escuro herdado em outros componentes e mantém a distinção atual/demais por bordas e fundos. Pode ser uma proposta separada das listas, com os foregrounds específicos e aprovação dos efeitos no chat nativo.
4. **Explorer e Search lateral:** não prometer uma solução unificada por foreground. B possui efeitos globais e conflitos de foreground. Esses componentes precisam de um escopo aprovado separadamente, eventualmente suporte do próprio componente; não mudar seleção ou todo o texto da lista como atalho.

## Classificação e próximas evidências

| Achado | Classificação |
|---|---|
| Contraste das correspondências no Search lateral medido abaixo de 4,5:1 nos dois temas | **Problema confirmado do tema**, na combinação de foreground herdado e overlay atual |
| Derivação muted, caminhos a 50%, placeholder a 60% e match usando button.background no Antigravity | **Implementação confirmada da extensão**; o problema específico da captura/Recently opened permanece **hipótese não confirmada visualmente** |
| Atenuação nominal também aparece no Dark Modern | Evidência de que não basta atribuir tudo aos temas; não comprova bug preexistente do VS Code |
| Ícones sem papel/estado confirmados e cabeçalhos potencialmente decorativos | **Hipótese não confirmada**; não clarear em massa |
| Ícones/abas realmente inativos, fora dos elementos funcionais investigados | **Comportamento intencional de estado inativo** até evidência contrária; nenhuma alteração proposta |
| Quick Input e árvores consumirem mecanismos diferentes | Comportamento do VS Code confirmado, **não classificado como defeito** |

Para concluir o Antigravity, o usuário precisa finalizar o onboarding de acordo com suas próprias escolhas. Depois, no mesmo painel, digitar `@` no campo (sem enviar prompt) e abrir o seletor que contém **Recently opened**; repetir com os três temas, mesmo conteúdo e tamanho. São necessárias capturas ou estilos de `menu-option-label`, `menu-option-description`, `menu-section-header`, `fuzzy-match-highlight` e do campo em normal/hover/foco. Informe também a versão da captura original. Se a tela for outra, essa associação deve ser corrigida antes de qualquer alteração.

Reprodução dos resultados atuais: `node docs/contrast-investigation/prepare.cjs`, depois `control.cjs`/`cdp.cjs` e `collect-native.cjs`; `analyze.cjs` refaz os cálculos e verifica hashes de temas, manifesto e settings pessoais. A preparação lança somente o perfil temporário. Assets locais do Antigravity foram apenas lidos e guardados no diretório temporário para análise, não editados nem incluídos no repositório.

**A investigação termina aqui. Nenhuma cor, propriedade de tema ou regra de sintaxe foi alterada. Todas as propostas dependem de aprovação explícita, e as partes dependentes do Antigravity ainda exigem as evidências indicadas.**
