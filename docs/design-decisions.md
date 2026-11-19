# Decisões definitivas dos temas

Esta consolidação descreve o estado implementado antes da limpeza. Não aprova novos candidatos nem cria novas escolhas visuais. Os objetos completos aprovados estão no fixture proposto `tests/fixtures/approved-themes.json`; esta tabela é um resumo, não sua substituição.

## Arquitetura e identidade

- Dark Modern é referência de hierarquia de componentes, não uma base de cores importada.
- Os temas são autocontidos, sem `include` e sem `themes/dark-modern-ui.colors.json`.
- MonoMin utiliza sua identidade monocromática; MonoDracula utiliza sua paleta Dracula. Coincidência de um RGB com Dark Modern não constitui dependência.
- Defaults nativos do VS Code continuam existindo. Independência da base antiga não significa congelar todos os defaults do editor.
- O manifesto permanece em `2.3.5`, com os dois temas registrados como `vs-dark`.

## Syntax highlighting

Cada tema mantém 161 regras TextMate, incluindo ordem, scopes, foregrounds e estilos. `semanticHighlighting` e `semanticTokenColors` estão ausentes nos dois arquivos; essa ausência é intencionalmente preservada, sem habilitar ou desabilitar os provedores. O comportamento efetivo ainda depende do VS Code, da configuração e das extensões de linguagem.

`editor.foreground` permanece `#EAEAEA` no MonoMin e `#fcfcfa` no MonoDracula. Os comentários do MonoDracula mantêm `#797fa5` e os itálicos das regras correspondentes. Não se deve alterar syntax para compensar fundos de interface.

## Valores visuais implementados

| Propriedade | MonoMin | MonoDracula |
|---|---|---|
| `button.foreground` | `#151515` | `#21222c` |
| `button.background` | `#939293` | `#bd93f9` |
| `button.hoverBackground` | `#c1c0c0` | `#bd93f9e6` |
| `inlineChatInput.border` | `#888888ad` | `#939293a6` |
| `input.border` | `#888888ad` | `#939293ad` |
| `textCodeBlock.background` | `#1f1f1f` | `#121319` |
| `editorGroupHeader.connectedTabsBackground` | `#3D3D3D` | `#37394a` |
| `tab.inactiveForeground` | `#c1c0c0` | `#c1c0c0` |
| `tab.unfocusedInactiveForeground` | `#c1c0c0` | `#c1c0c0` |
| `panelTitle.inactiveForeground` | `#c1c0c0` | `#c1c0c0` |
| `editor.selectionBackground` | `#c1c0c026` | `#14141b` |
| `editor.findMatchBackground` | `#303030` | `#303442` |
| `editor.findMatchHighlightBackground` | `#000000` | `#121319` |
| `editor.findMatchHighlightBorder` | `#888888CC` | `#bd93f9CC` |
| `list.filterMatchBorder` | `#00000000` | `#00000000` |
| `searchEditor.findMatchBorder` | `#00000000` | `#00000000` |
| `chat.findMatchBackground` | `#EAEAEA18` | `#fcfcfa18` |

Esses fundos dos blocos são os da migração posterior para paletas Mono; os antigos `#00000099`/`#14141b` pertencem a uma implementação anterior e não devem ser restaurados pela consolidação.

O override `menu.selectionBorder` foi removido; `menu.border` foi preservado (`#505050` / `#4b4f66`). O fundo mantém a indicação do item selecionado. O efeito compartilhado conhecido é a retirada do mesmo contorno de Code Actions/Quick Fix; não houve mudança de `focusBorder` global.

Os foregrounds amarelos de busca foram revertidos. `editor.findMatchForeground` e `editor.findMatchHighlightForeground` não devem ser reintroduzidos pela limpeza. Estados inativos continuam menos destacados; não se busca igualdade artificial com os ativos.

## Histórico e limites

As fontes estão no [índice externo](history/archive-index.json), especialmente:

- `docs/theme-modernization/dark-modern-design-system/README.md`;
- `docs/theme-modernization/menu-and-search-refinement/README.md`;
- `docs/theme-modernization/connected-tabs-147/README.md`;
- `docs/theme-modernization/search-highlight-outline/README.md`;
- `docs/theme-modernization/search-outline-opacity/README.md`;
- `docs/theme-modernization/yellow-revert/README.md`.

As medições anteriores pertencem às versões e estados registrados nesses relatórios. Não representam uma nova execução visual nesta preparação. Stop durante geração autenticada, indicador distante de edição inline e alguns estados de símbolos mantêm as limitações históricas; não são declarados aprovados por igualdade estrutural.
