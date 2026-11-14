# Etapa B — caracteres encontrados em amarelo

Implementados os três foregrounds autorizados nos dois temas. Fundos, bordas, seleções, TextMate, configurações semânticas, manifesto e versão permanecem iguais ao baseline desta tarefa. A exceção de contraste do MonoMin foi explicitamente autorizada pelo usuário: **“Autorizar a exceção de 4,04:1”**. Isso autoriza manter o amarelo nessa sobreposição; não transforma o resultado em conformidade com 4,5:1.

## Alterações efetivas

| Propriedade | MonoMin antes → depois | MonoDracula antes → depois | Motivo |
|---|---|---|---|
| `list.highlightForeground` | `#EAEAEA` → `#F8C66B` | `#fcfcfa` → `#f1fa8c` | Caracteres correspondentes no Quick Open e Quick Input |
| `editor.findMatchForeground` | ausente → `#F8C66B` | ausente → `#f1fa8c` | Foreground temporário da ocorrência atual |
| `editor.findMatchHighlightForeground` | ausente → `#F8C66B` | ausente → `#f1fa8c` | Foreground temporário das outras ocorrências |

Ausente significa que não havia override do tema, e não uma cor fixa anterior: a sintaxe continuava determinando a cor do trecho. O novo foreground de busca sobrepõe temporariamente essa cor enquanto há decoração de busca. Fora dos matches, os estilos renderizados continuam iguais.

`quickInputList.focusHighlightForeground` não foi adicionado: o fallback existente já resolveu o amarelo na linha focada. O negrito 700 permanece. O texto normal, fundos e indicadores de foco continuam distintos entre linhas focadas e não focadas. Não houve compensação por outras propriedades.

Na linha focada, o texto normal já era amarelo. O match passa a compartilhar essa cor e continua distinguível pelo **negrito 700 contra peso 400** do restante do rótulo. Portanto a distinção nessa linha depende do peso, não de diferença cromática. Nas linhas não focadas há diferença de cor e peso. Isso foi conferido no Quick Open e no comando amostrado na Command Palette; não foi alterada a seleção global.

O [diff exato](changes.diff) contém somente essas seis alterações funcionais. Os scripts gerais `audit.cjs` e `tokens.cjs` receberam o modo explícito `--yellow-approved` para validar este baseline e esta lista de foregrounds sem substituir os modos históricos. Nenhum commit, tag ou publicação foi criado.

## Ambiente e baseline

VS Code **1.146.0**, Node **24.18.0**, Windows. Uma única Extension Development Host alternou quatro temas: Before/Candidate para cada paleta. Os arquivos Candidate usados pela instância são semanticamente idênticos aos temas finais, conforme `validate.cjs`.

O [baseline](baseline/) foi copiado antes da alteração, incluindo os comentários já aprovados do MonoDracula em `#797fa5`. O [estado Git inicial](git-before.txt) continha somente `docs/contrast-investigation/` não rastreado; esse material preexistente foi preservado. O manifesto foi capturado também.

O perfil temporário herdou as configurações pessoais, com atualização e sincronização desativadas para o ensaio. Semantic highlighting foi ligado explicitamente **somente no perfil temporário**, para TypeScript e JavaScript. Não houve alteração semântica nos temas. O hash das configurações pessoais foi conferido antes/depois e permaneceu igual. Inventário de extensões, versões, hashes e diretórios em [environment.json](environment.json); diretório e porta da sessão em [session.json](session.json). As mesmas extensões congeladas foram usadas nos quatro casos. Customizações relevantes encontradas estão também no inventário dos relatórios `tokens*.json`.

O registro de cores e os consumidores foram novamente lidos nos bundles locais, sem modificá-los. [source-evidence.json](source-evidence.json) contém trechos e offsets; [investigação anterior](../../contrast-investigation/README.md) descreve os consumidores adicionais. As capturas usam o workbench real, via DevTools local, sem injeção de CSS ou screenshots simulados. O chat foi importado de um fixture local estático; nenhum prompt foi enviado a um serviço.

## Matriz dos testes executados

Todos os testes abaixo foram executados nos dois temas, comparando Before/Candidate, exceto onde indicado.

| Teste | Resultado e classificação | Evidência |
|---|---|---|
| JSONC, duplicatas, cores e propriedades registradas | Aprovado | `structural.json`, `audit/structural.json` |
| Diff limitado aos foregrounds autorizados; manifesto e demais valores | Aprovado | `validate.cjs`, `changes.diff` |
| 161 regras TextMate por tema, scopes e fontStyle; configuração semântica | Aprovado, igualdade profunda e textual das regras | `audit/structural.json`, `structural.json` |
| Estilos TextMate resolvidos em seis linguagens, grammars incorporadas e instaladas | Aprovado: 24 combinações tema/linguagem/conjunto de grammars iguais | `tokens.json`, `tokens-installed.json` |
| Quick Open: linha focada e não focada, parcial, fuzzy em múltiplos trechos e navegação por teclado | Aprovado; amarelo é mudança deliberada; restante dos estilos comparados igual | `*-quick*.json/png` |
| Quick Open: hover e perda de foco | Aprovado no estado observado; hover preservado; blur fecha o picker nas duas versões | `*-quick-hover.*`, `*-quick-blur.*` |
| Command Palette: comando local “Contrast Demo Command” | Aprovado na única linha correspondente; match amarelo em negrito | `*-palette.*` |
| Editor TypeScript, JavaScript e HTML: atual, outras, múltiplas na linha e próxima ocorrência | Aprovado; amarelo deliberado; bordas e fundos iguais; atual mantém borda distinta | `*-ts-find.*`, `*-js-find.*`, `*-html-find.*`, `*-next.*` |
| Editor: seleção de texto com busca | Executado; exceção MonoMin abaixo descrita; sem ajuste compensatório | `*-ts-selection.*`, `*-selection-background*` |
| Editor sem busca: todos os caracteres visíveis dos fixtures TS/JS/HTML | Aprovado, estilos idênticos | `*-clean.*` |
| Syntax highlighting fora dos matches durante a busca | Aprovado na amostra renderizada; itálico e peso preservados dentro dos matches também | `visual-comparison.json` |
| Inspetor nativo: variável TypeScript `contrastValue` | Aprovado; token semântico `variable`, modificadores `declaration readonly`, scopes e foreground iguais | `*-inspector.json/png` |
| Chat nativo: ocorrência atual, outras e mudança para próxima | Efeito indireto deliberado: amarelo herdado; fundos iguais; contraste da amostra acima de 4,5:1 | `*-chat.*`, `*-chat-next.*` |
| Search lateral: texto correspondente nos resultados do fixture | Comportamento preexistente; estilos computados iguais na amostra. Não foi corrigido | `*-search.*` |
| Editor de atalhos, resultado do comando do fixture | Comportamento preexistente; override do componente manteve os estilos amostrados iguais | `*-shortcuts.*` |

[visual-comparison.json](visual-comparison.json) registra as asserções e as medições. A comparação usa texto e estilos computados por caractere/estado, em vez de exigir identidade binária das imagens, que incluem cursor, foco e elementos dinâmicos. As capturas complementam as medições; não foi calculado um índice global de similaridade de pixels.

No inspetor nativo, a variável resolve para `#B392F0` no MonoMin e `#BD93F9` no MonoDracula, antes e depois. A presença explícita de tipo e modificadores semânticos comprova o provedor nessa amostra; apenas ligar uma opção não seria suficiente. Isso não é certificação de todos os tokens ou provedores das extensões.

## Contraste e exceção autorizada

Relações calculadas com luminância relativa sRGB. Transparências de busca/seleção são compostas sobre o fundo correspondente. Para a sobreposição mais complexa, o fundo foi medido nos pixels planos predominantes de regiões internas do screenshot PNG; foreground veio do CSS computado, sem usar pixels antialiasados das letras. Dados e quantidade de pixels estão nos arquivos `*-selection-background-pixels.json`.

| Situação amostrada | MonoMin | MonoDracula |
|---|---:|---:|
| Quick Open focado | 10,35:1 | 12,25:1 |
| Quick Open não focado | 11,55:1 | 14,13:1 |
| Busca do editor sobre fundo normal, composição simples | 6,82:1 | 7,94:1 |
| Menor contraste medido com Search + Ctrl+F + seleção | **4,04:1 — exceção autorizada** | 4,63:1 |
| Menor contraste medido no chat nativo | 4,72:1 | 5,51:1 |

No MonoMin, o match selecionado no comentário ficou sobre **`#5f5f5f`**, com `#F8C66B`, relação **4,038435:1**. A combinação de decorações e seu fundo é preexistente; o foreground amarelo é a mudança deliberada. O resultado fica abaixo da referência de 4,5:1 para texto normal e constitui uma limitação conhecida da alteração, aceita explicitamente pelo usuário. [Registro da autorização](contrast-exception.json). Não se declara aprovação WCAG desse caso. Não foram clareados estados inativos nem alterados fundos/bordas para compensar.

As medições simples em [contrast.json](contrast.json) não representam o pior caso de todas as sobreposições. Os números acima descrevem os estados efetivamente capturados, sem garantia para toda combinação possível de extensões ou decorações.

## Capturas comparativas selecionadas

| Amostra | Baseline | Atual |
|---|---|---|
| Quick Open MonoMin | [antes](evidence/monomin-before-quick.png) | [depois](evidence/monomin-candidate-quick.png) |
| Quick Open fuzzy MonoDracula | [antes](evidence/monodracula-before-quick-multi.png) | [depois](evidence/monodracula-candidate-quick-multi.png) |
| Busca TS MonoDracula | [antes](evidence/monodracula-before-ts-find.png) | [depois](evidence/monodracula-candidate-ts-find.png) |
| Token semântico MonoMin | [antes](evidence/monomin-before-inspector.png) | [depois](evidence/monomin-candidate-inspector.png) |
| Chat MonoMin | [antes](evidence/monomin-before-chat.png) | [depois](evidence/monomin-candidate-chat.png) |

Sobreposição excepcional: [MonoMin](evidence/monomin-selection-background.png), [MonoDracula](evidence/monodracula-selection-background.png).

## Propagação e limites

O chat nativo compartilha os foregrounds do editor: sua mudança foi efetivamente renderizada e avaliada. O Search lateral usa estilos próprios na amostra e ficou igual, incluindo o problema de contraste previamente registrado. O editor de atalhos também manteve seus overrides na linha testada. Nenhuma propriedade adicional foi alterada para corrigir consumidores indiretos.

Explorer, autocomplete, seletores de ícones/IA e todos os demais consumidores possíveis de listas **não receberam aprovação visual nesta execução**. O inventário de fonte indica compartilhamentos e overrides, mas não substitui abrir cada interface. A ausência de regressão identificada nas amostras executadas não cobre todos os componentes do VS Code.

Antigravity não foi retestado ou corrigido. Seu highlight interno usa outra implementação; o onboarding não foi aceito ou contornado. Bundles, CSS e variáveis da extensão não foram alterados. Botões secundários, guias, borda de agentes, Activity Bar e abas não receberam alterações nesta tarefa nem nova auditoria visual completa.

Pendências para ampliar a cobertura: abrir Quick Inputs de extensões com os mesmos termos e observar matches focados/não focados; abrir filtro do Explorer e autocomplete para confirmar os overrides no estado desejado; testar outros provedores semânticos e decorações sobrepostas em arquivos reais. Registrar captura, tema, versão, termo e estado antes de classificar qualquer resultado. Os refinamentos de contraste do Search/Antigravity e quaisquer outras propostas da Etapa B continuam sem autorização para implementação.

## Reprodução

Execute na raiz do repositório. Os scripts usam a instalação e o inventário local registrados em `session.json`; para outra máquina, ajuste os caminhos em uma cópia dos scripts. Não edite os baselines. `prepare.cjs` cria novo perfil temporário e lança somente a instância de teste; não deve ser executado enquanto outra sessão de teste ocupa a porta 9371. Requer acesso autorizado ao Electron e à depuração local.

```powershell
node docs/theme-modernization/yellow-highlights/prepare.cjs
node docs/theme-modernization/yellow-highlights/collect.cjs
node docs/theme-modernization/yellow-highlights/collect-clean.cjs
node docs/theme-modernization/yellow-highlights/collect-extra.cjs
node docs/theme-modernization/yellow-highlights/collect-palette.cjs
node docs/theme-modernization/yellow-highlights/collect-selection-pixels.cjs
node docs/theme-modernization/yellow-highlights/collect-inspector.cjs
node docs/theme-modernization/yellow-highlights/compare.cjs
node docs/theme-modernization/yellow-highlights/validate.cjs
node docs/theme-modernization/yellow-highlights/environment.cjs
node docs/theme-modernization/yellow-highlights/source.cjs
node docs/theme-modernization/audit.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --yellow-approved
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --yellow-approved
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --yellow-approved --installed
git diff --check
node docs/theme-modernization/yellow-highlights/cdp.cjs workbench close
```

Os coletores abrem fixtures, alternam os temas temporários e regeneram evidências. `validate.cjs` sem flags de aplicação apenas verifica e regenera relatórios; não edita temas. A comparação exige o registro explícito da exceção quando encontra o contraste abaixo de 4,5:1. Preservação estrutural e inspeção visual têm resultados separados; estados não executados continuam pendentes.
