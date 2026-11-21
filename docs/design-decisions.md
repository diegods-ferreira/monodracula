# Decisões dos temas na versão 2.3.6

Os temas oficiais e a fixture de regressão registram os valores aprovados. [MonoMin](../themes/MonoMinTheme.json) · [MonoDracula](../themes/MonoDraculaTheme.json) · [Fixture](../tests/fixtures/approved-themes.json)

## Arquitetura e identidade

- A hierarquia do workbench parte do Dark Modern do VS Code 1.147.0. O gerador fixa as fontes e aplica as paletas Mono por função visual. [Origem e reprodução](experiments/dark-modern/README.md)
- Os temas são autocontidos, sem `include` e sem `themes/dark-modern-ui.colors.json`.
- O MonoMin combina superfícies monocromáticas com o amarelo `#F8C66B` nos estados de interação aprovados. O MonoDracula mantém sua paleta e o acento roxo `#BD93F9`.
- Cada tema tem 187 chaves de cor explícitas. As demais cores dependem dos padrões do VS Code e das contribuições instaladas.
- O manifesto registra ambos os temas como `vs-dark` na versão `2.3.6`.

## Syntax highlighting

Cada tema mantém 161 regras TextMate, incluindo ordem, scopes, foregrounds e estilos. `semanticHighlighting` e `semanticTokenColors` estão ausentes nos dois arquivos; essa ausência é intencionalmente preservada, sem habilitar ou desabilitar os provedores. O comportamento efetivo ainda depende do VS Code, da configuração e das extensões de linguagem.

`editor.foreground` permanece `#EAEAEA` no MonoMin e `#fcfcfa` no MonoDracula. Os comentários do MonoDracula mantêm `#797fa5` e os itálicos das regras correspondentes. Não se deve alterar syntax para compensar fundos de interface.

## Valores visuais implementados

| Propriedade | MonoMin | MonoDracula |
|---|---|---|
| `button.foreground` | `#151515` | `#21222c` |
| `button.background` | `#F8C66B` | `#BD93F9` |
| `button.hoverBackground` | `#F8C66BE6` | `#BD93F9E6` |
| `focusBorder`, `activityBarBadge.background`, `tab.activeBorderTop` | `#F8C66B` | `#BD93F9` |
| `input.border` | `#939293` | `#939293` |
| `textCodeBlock.background` | `#3D3D3D` | `#37394A` |
| `editorGroupHeader.connectedTabsBackground` | `#2B2B2B` | `#37394A` |
| `editorGroupHeader.tabsBorder`, `tab.border` | `#2B2B2B` | `#303442` |
| `tab.inactiveForeground`, `panelTitle.inactiveForeground` | `#9D9D9D` | `#C1C0C0` |
| `editor.selectionBackground` | `#F8C66B26` | `#BD93F926` |
| `editor.findMatchBackground` | `#101010` | `#14141B` |
| `editor.findMatchBorder` | `#939293` | `#FFB86C` |
| `editor.findMatchHighlightBackground` | `#F8C66B26` | `#FFB86C26` |
| `terminal.background` | `#151515` | `#1D1F28` |
| `terminal.foreground` | `#EAEAEA` | `#FCFCFA` |
| `terminal.selectionBackground` | `#EAEAEA26` | `#FCFCFA26` |
| `terminal.ansiBrightBlack` | `#888888` | `#939293` |
| `terminal.tab.activeBorder`, `terminal.findMatchBorder`, `terminalOverviewRuler.findMatchForeground` | `#F8C66B` | `#BD93F9` |

## Fallbacks e limites visuais

- O renderer do VS Code 1.147.0 usa `editor.findMatchHighlightBackground` tanto no painel Search quanto nas ocorrências secundárias da busca local. Quando as buscas coincidem, as camadas se sobrepõem. Na amostra auditada, o contraste do comentário caiu para 2,29:1 no MonoMin e 1,93:1 no MonoDracula. As cores aprovadas continuam vigentes.
- Na mesma build, o Search Editor usa seu próprio token, que herda 66% da opacidade de `editor.findMatchHighlightBackground`. `list.filterMatchBackground` também deriva do preenchimento secundário do editor, mas corresponde à filtragem de listas e árvores.
- O terminal tem 16 cores ANSI explícitas em cada tema. A seleção sem foco usa metade da opacidade da seleção ativa na build validada. O cursor herda o texto e o fundo do terminal. Os preenchimentos da busca no terminal herdam os do editor, enquanto o contorno da ocorrência atual e os marcadores secundários da régua têm cores explícitas.
- As decorações de Git que o tema omite e outras cores indiretas dependem do VS Code ou da extensão que registra o token. O tema não fixa a aparência dessas superfícies em todas as versões.

## Compatibilidade com o VS Code

| Aspecto | Evidência e limite |
|---|---|
| Sintaxe do tema | O carregador da 1.49.0 lê as entradas de `colors` como hexadecimais e aceita os temas `vs-dark`. Uma chave desconhecida pode ficar no mapa de cores sem efeito se o workbench e as extensões da versão não a consumirem. Componentes disponíveis continuam usando suas chaves reconhecidas e os fallbacks daquela versão. |
| Instalação | `engines.vscode: ^1.49.0` declara instalação a partir da 1.49.0 dentro da série 1.x. O pacote é declarativo e contém os dois temas autocontidos. A instalação e a ativação do VSIX na 1.49.0 não foram executadas. |
| Aparência | A 1.49.0 registra as cores ANSI, o fundo, o texto e a seleção do terminal. As abas conectadas modernas, as cores de chat e os indicadores de busca do terminal dependem de componentes mais recentes. O terminal como aba de editor chegou na 1.58 e os destaques de ocorrências no terminal na 1.66. A validação visual desta integração cobre a 1.147.0. |

A comparação estática com a tag `1.49.0` encontrou 151 dos 187 IDs atuais nos registros de cores do código, na tabela ANSI ou nas contribuições das extensões embutidas. Entre os 36 sem registro localizado estão `editorGroupHeader.connectedTabsBackground`, os IDs numerados das guias de indentação, `terminal.findMatchBorder` e `terminalOverviewRuler.findMatchForeground`. Isso limita a reprodução desses estados. É uma comparação de registros, não um teste de renderização.

O mínimo declarado permanece em `^1.49.0` na 2.3.6. O código histórico sustenta a expectativa de carregamento básico, com aparência reduzida. A evidência disponível não confirma instalação ou fidelidade visual na versão mínima. Para uma versão futura, escolha o mínimo após testar a versão mais antiga que cubra a experiência que o projeto pretende oferecer. Se o requisito passar a incluir a aparência validada das abas conectadas em editores e painéis, a 1.147.0 é a referência testada.

[Carregador de temas 1.49.0](https://github.com/microsoft/vscode/blob/1.49.0/src/vs/workbench/services/themes/common/colorThemeData.ts) · [Registro de cores do terminal 1.49.0](https://github.com/microsoft/vscode/blob/1.49.0/src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts) · [Manifesto de extensões](https://code.visualstudio.com/api/references/extension-manifest) · [VS Code 1.58](https://code.visualstudio.com/updates/v1_58) · [VS Code 1.66](https://code.visualstudio.com/updates/v1_66) · [VS Code 1.147](https://code.visualstudio.com/updates/v1_147)

## Histórico e limites

As fontes estão no [índice externo](history/archive-index.json), especialmente:

- `docs/theme-modernization/dark-modern-design-system/README.md`;
- `docs/theme-modernization/menu-and-search-refinement/README.md`;
- `docs/theme-modernization/connected-tabs-147/README.md`;
- `docs/theme-modernization/search-highlight-outline/README.md`;
- `docs/theme-modernization/search-outline-opacity/README.md`;
- `docs/theme-modernization/yellow-revert/README.md`.

Os caminhos acima pertencem ao arquivo histórico externo. As medições desses relatórios descrevem os estados registrados em cada etapa. A validação visual da 2.3.6 foi realizada no VS Code 1.147.0. Os fluxos autenticados do chat ficaram fora da cobertura visual.
