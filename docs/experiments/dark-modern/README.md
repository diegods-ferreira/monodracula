# Mono Themes sobre Dark Modern

## Fonte e reprodução

A base é o VS Code Stable **1.147.0 x64**, commit **`8a14f0cc1b08d531eb83255ea3764ae22aa932b5`**, build de 17/11/2026. Os três JSONs em `upstream/` foram copiados, byte a byte, do diretório `8a14f0cc1b/resources/app/extensions/theme-defaults/themes` da instalação Windows que fornece o comando `code`. [Proveniência e SHA-256](upstream/source.json) · [Referência pública do Dark Modern](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json) · [Licença MIT do código-fonte do VS Code](extension/LICENSE-VSCODE.txt)

A cadeia é `dark_modern.json → dark_plus.json → dark_vs.json`. O gerador lê os ancestrais primeiro, aplica as substituições de interface e acumula as regras TextMate e semânticas na ordem do carregador. A base resolvida tem 152 cores explícitas, 65 regras TextMate e oito entradas semânticas ordenadas para quatro seletores, com semantic highlighting ativo. [Carregador de temas do VS Code](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/colorThemeData.ts)

Execute na raiz do repositório com Node.js.

```powershell
node docs/experiments/dark-modern/generate.cjs --check
node docs/experiments/dark-modern/generate.cjs --check --official
node docs/experiments/dark-modern/validate.cjs
```

O gerador usa as chaves do Dark Modern e mapeia seus valores por função visual. Chaves que compartilham um RGB na base podem receber papéis diferentes. Os RGBs vêm das paletas Mono. As opacidades ajustam a composição de seleção, hover, divisórias, validação de inputs e busca. Cada variante recebe integralmente os 161 registros TextMate da respectiva fonte Mono. Ambos os originais têm comentários em itálico e deixam `semanticHighlighting` e `semanticTokenColors` ausentes. Os arquivos gerados preservam essa configuração e carregam sem `include` ou arquivo de regras externo.

As entradas de paleta e sintaxe em [`originals/`](originals/) são cópias dos temas oficiais anteriores à integração, do commit `54051be13c6ac9618ebe517b136c971a4f216bf5`. Remover `--check` regenera as variantes experimentais. Com `--official`, o gerador promove diretamente os JSONs experimentais aprovados para `themes/`, ajustando apenas `name`. Os dois modos aceitam opcionalmente `MonoMin` ou `MonoDracula`. A geração utiliza apenas os arquivos do repositório e o Node.js. O [aviso MIT específico do código derivado do VS Code](../../../LICENSE-VSCODE.txt) acompanha os temas no VSIX.

Os entregáveis são [MonoMin Experimental](extension/themes/MonoMinExperimental.json), [MonoDracula Experimental](extension/themes/MonoDraculaExperimental.json), o [manifesto de teste](extension/package.json), o [gerador](generate.cjs), o [validador](validate.cjs) e as [fontes fixadas](upstream/source.json). Para testar manualmente, abra a extensão como extensão de desenvolvimento em um perfil descartável.

```powershell
$experiment = (Resolve-Path 'docs/experiments/dark-modern/extension').Path
$profile = Join-Path $PWD '.artifacts/dark-modern-manual/profile'
$extensions = Join-Path $PWD '.artifacts/dark-modern-manual/extensions'
code --new-window --user-data-dir "$profile" --extensions-dir "$extensions" --extensionDevelopmentPath="$experiment"
```

## Comparação técnica

| Tema | Chaves de cor | TextMate | Semântica no tema | Chaves novas / removidas / recoloridas em relação ao original |
|---|---:|---:|---|---:|
| Dark Modern | 152 | 65 | Ativa, 4 seletores | — |
| MonoMin anterior à integração | 376 | 161 | Ausente | — |
| MonoMin 2.3.6 e variante experimental | 187 | 161 | Ausente | 29 / 218 / 93 |
| MonoDracula anterior à integração | 378 | 161 | Ausente | — |
| MonoDracula 2.3.6 e variante experimental | 187 | 161 | Ausente | 29 / 220 / 80 |

As variantes preservam 151 das 152 chaves explícitas do Dark Modern. A omissão de `terminal.inactiveSelectionBackground` recupera o fallback do terminal. As 36 chaves adicionais incluem três decorações do editor, doze cores do workbench, o contorno da ocorrência atual no editor, 16 cores ANSI, o fundo e a seleção do terminal e os dois indicadores da busca no terminal.

- **Abas e superfícies.** A aba ativa usa a superfície do editor. No MonoMin, a faixa conectada e as divisórias usam `#2B2B2B`, com texto inativo de abas e painéis em `#9D9D9D`. As bordas de foco e da aba ativa usam o acento do tema.
- **Controles e chat.** Botões primários e badges de atividade usam texto escuro sobre amarelo no MonoMin e roxo no MonoDracula. A seleção usa uma camada translúcida. Os comandos de chat usam amarelo ou ciano sobre um fundo derivado do acento.
- **Busca do editor.** O resultado atual mantém fundo escuro e contorno cinza no MonoMin e laranja no MonoDracula. O painel Search e a busca local compartilham o preenchimento secundário. No teste com ambas abertas para o mesmo termo, o contraste do comentário caiu para 2,29:1 no MonoMin e 1,93:1 no MonoDracula. A aba Search Editor herda uma versão com 66% da opacidade na build validada.
- **Terminal.** A paleta ANSI, o fundo e a seleção ativa são explícitos. O terminal deriva a seleção sem foco da seleção ativa e o cursor do texto e do fundo. O preenchimento da busca herda as cores do editor. O contorno da ocorrência atual e os marcadores secundários da régua usam amarelo no MonoMin e roxo no MonoDracula.
- **Estados.** Sucesso, erro e aviso usam as cores correspondentes das paletas. A modificação no gutter e os arquivos editados no chat usam a família de aviso. Como os temas dependem mais dos padrões do workbench, superfícies menos comuns e componentes de extensões ainda podem mostrar cores padrão.

## Resultados

A verificação dedicada passou para os dois temas. Ela checa hashes das fontes, conteúdo regenerado, chaves oficiais e adições, RGBs da paleta, integridade da ordem e do conteúdo das 161 regras, semântica e contraste com composição alfa. Os pares selecionados ficaram acima de 4,5:1 para texto e de 3:1 para indicadores e bordas testados.

| Par medido | MonoMin Experimental | MonoDracula Experimental |
|---|---:|---:|
| Texto do botão primário | 11,55:1 | 6,55:1 |
| Texto do botão em hover | 9,65:1 | 5,65:1 |
| Texto sobre seleção de menu parametrizada | 7,31:1 | 8,70:1 |
| Foco do agente sobre input | 6,87:1 | 4,71:1 |
| Indicador da aba ativa | 10,42:1 | 5,90:1 |
| Comando de chat | 7,33:1 | 7,86:1 |
| Contorno da busca contra o editor | 5,32:1 | 8,36:1 |
| Comentário no resultado atual | 5,37:1 | 4,71:1 |

Os cinco temas foram carregados no mesmo VS Code com perfil e extensões isolados. Foram conferidos as abas conectadas, o menu contextual com navegação por teclado, o botão primário em repouso e hover nas duas variantes, a busca e a tela inicial do chat. Essa tela estava sem autenticação. Os comandos de barra e a renderização de conversas do chat ficaram limitados à validação de tokens. Há duas capturas locais em `.artifacts/dark-modern-experiment/`.

O teste do pacote valida os temas e o manifesto byte a byte, confere o aviso MIT e, com `CLEAN_VSIX=1`, exige a lista exata de entradas. O empacotamento exclui este experimento via `docs/**`. [Comandos para validação](../../validation.md)

## Manutenção e decisão

A base fixada e o mapeamento compartilhado tornam as mudanças reproduzíveis. Atualizar a base exige copiar os três arquivos da mesma build, atualizar os hashes e revisar as chaves novas, os valores reutilizados em papéis diferentes e os padrões em tempo de execução. A redução de 376/378 para 187 cores explícitas torna os temas mais dependentes dos fallbacks do workbench nas superfícies que ficaram sem override. [Limites de compatibilidade](../../design-decisions.md#compatibilidade-com-o-vs-code)

As variantes aprovadas foram integradas aos caminhos oficiais na versão 2.3.6. Os fluxos autenticados do chat permanecem fora da validação visual realizada.
