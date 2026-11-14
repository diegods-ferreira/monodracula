# Auditoria — Etapa A

Atualização específica autorizada da Etapa B: [comentários do MonoDracula `#6272a4` → `#797fa5`](stage-b-comments/README.md), com baseline, diff e validações próprios. Nenhuma outra proposta foi aplicada; o histórico da Etapa A abaixo foi preservado.

Resultado mais recente: [amostragem visual executada no renderer real](visual-results.md), com screenshots, tokens semânticos, guias, botões, agentes e estados ativos/inativos. As pendências restantes estão delimitadas nesse relatório.

Execução mais recente: [matriz de resultados e pendências](execution-report.md), com hosts reais e comparação de provedores semânticos. A validação visual no renderer permanece pendente.

Próxima etapa: [procedimento reproduzível de validação visual e semântica](visual-validation.md), com preparação isolada e capturas no editor real. A [revisão focalizada de comentários e textos funcionais](visual-review.md) qualifica os candidatos automáticos de contraste; eles não devem ser aplicados por limiar numérico isolado.

Referência: VS Code **1.146.0**, commit `69047191fc427f2f92828279aae1d90d8eeda7ab`, instalação local. Baseline dos temas: commit em `baseline.json`; os temas estavam sem alterações locais quando a execução começou. A referência Dark Modern fornecida, não rastreada, não foi modificada. Não houve alteração de `package.json`, configuração do usuário ou execução de comandos Git destrutivos.

## Mudanças aplicadas

| Categoria | Ambos os temas | Motivo e efeito |
|---|---|---|
| Compatibilidade | `editorIndentGuide.background1`, `editorIndentGuide.activeBackground1` | Mesmos valores das propriedades antigas. O registro local aponta as novas para as antigas por fallback; não altera o resultado resolvido. Os aliases antigos continuam registrados, com indicação de depreciação, na versão 1.146.0 contemplada pelo manifesto. |
| Controles | `button.secondaryBackground`, `button.secondaryForeground`, `button.secondaryHoverBackground` | Reutilizam os três valores de `button.*` do próprio tema. Evitam a superfície cinza genérica do controle secundário. Normal e hover continuam distintos. |
| Agentes | `agentsPanel.border` | Reutiliza `panel.border`. O padrão local é branco com 15% de opacidade; a inclusão alinha a borda do componente moderno às demais bordas de painel do tema. Não altera fundos, textos ou estados ativos/inativos. |
| Entradas sem uso atual | `welcomePage.buttonBackground`, `welcomePage.buttonHoverBackground` passam a comentários | Busca literal em todo `out/` e nas extensões incorporadas não encontrou registro nem consumidor. Não existe equivalência funcional comprovada: nenhum substituto foi aplicado. Valores preservados em comentários e no Git. |

No MonoMin, três nomes inválidos também passaram a comentários: `activityBar.inactiveforeground`, `editorOverviewRuler.currentContentforeground` e `editorOverviewRuler.incomingContentforeground`. Nenhum deles era reconhecido. Não foram ativadas as grafias corretas: isso mudaria a aparência. Os comentários preservam a intenção original para aprovação posterior.

Resultado: MonoMin passa de 340 para **341 propriedades ativas**; MonoDracula passa de 340 para **344**. Nenhum valor de propriedade válida preexistente foi alterado. As três remoções adicionais do MonoMin e as duas entradas Welcome em cada tema não tinham efeito na instalação auditada. Não foi executado VS Code antigo: a aparência histórica dos botões Welcome não foi comprovada. Não se afirma compatibilidade visual testada em todas as versões desde 1.49.0.

## Cobertura, validade e fallbacks

`structural.json` contém as listas completas de propriedades ausentes e excedentes em relação ao Dark Modern, adições com suas fontes de paleta e trechos dos registros locais, remoções, scopes repetidos e contagens antes/depois. Comentários não entram na comparação. A referência possui 152 cores ativas; esse número não foi usado como meta.

Todas as propriedades ativas resultantes foram localizadas no registro de cores do bundle, nas contribuições da extensão Git incorporada ou na paleta ANSI gerada pelo terminal. Essa verificação é estática, não uma exportação do schema em execução. Não há propriedades ativas sem reconhecimento identificado, chaves duplicadas ou formatos hexadecimais inválidos.

Não foram adicionadas propriedades de menus, Quick Input ou foco do campo de agentes que já herdam cores gerais pertinentes. `agentsChatInput.focusBorder`, por exemplo, herda `focusBorder`; explicitar o mesmo valor seria redundante. Os fundos e textos de agentes também têm fallbacks para componentes existentes. Não copiamos definições comentadas do Dark Modern.

`tab.activeBorderTop`, abas selecionadas, `modernActivityBar.*`, Command Center, novos indicadores de merge e outras propriedades não foram explicitados: não foi demonstrada necessidade de substituir os fallbacks. Acrescentar uma borda superior às abas seria uma decisão visual. O terminal, diagnósticos, autocomplete, hover e diff mantêm suas definições atuais. Ausência no Dark Modern não motivou remoções; `extensionButton.prominent*`, por exemplo, continua registrado.

## Syntax highlighting

As **161 regras por tema** foram preservadas integralmente: igualdade profunda, ordem, scopes, cores e estilos; o trecho textual de `tokenColors` também é igual após normalizar CRLF/LF do checkout e do Git.

`tokens.json` contém os exemplos completos de TS, JS, HTML, CSS, SCSS e JSON, stacks TextMate por trecho e metadados de cores e estilos resolvidos pelo motor real **vscode-textmate + vscode-oniguruma da instalação local**. A comparação antes/depois passou nas seis linguagens para os dois temas. Exemplos incluem comentários, keywords, funções, métodos, classes, interfaces, propriedades, variáveis, constantes, strings, números e operadores, além de código embutido em HTML.

Uma segunda execução, em `tokens-installed.json`, acrescentou as grammars das extensões locais e suas injeções, incluindo PostCSS (que contribui `source.css`) e Tailwind em CSS/SCSS. A comparação antes/depois também passou. Essa execução combina contribuições instaladas; não prova quais extensões estão habilitadas no perfil ativo nem a ordem de ativação real.

Achados preservados, pendentes de qualquer correção:

- `entity.name.function` aparece nas regras 24, 34 e 42; `support.function`, em 42 e 133 (índices a partir de zero). As cores repetidas são iguais; não foram deduplicadas.
- Scopes Rust se repetem com cores diferentes nas regras 59/119 e 118/119. O desempate de seletores iguais favorece a regra posterior; Rust não integra os exemplos de regressão desta entrega.
- O MonoMin contém `markup.igno#ffab70` e um seletor descendente equivalente. São indícios de corrupção preexistente de scopes, preservados para revisão. Não foi comprovada uma grammar que os emita.
- Regras não atingidas pelos exemplos não foram declaradas mortas: grammars e extensões podem emitir outros scopes.

Os temas continuam sem `semanticHighlighting` e `semanticTokenColors`. Pelo [guia oficial](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide), tokens semânticos se sobrepõem ao TextMate; a opção do editor e contribuições de linguagem podem habilitá-los mesmo sem opt-in do tema. O arquivo principal de configurações do usuário examinado não contém overrides relevantes explícitos. Perfis alternativos, settings remotos e provedores semânticos em execução não foram inspecionados. **A equivalência semântica efetiva no editor permanece pendente de validação manual**, não foi inferida da igualdade dos JSONs.

## Contraste e decisões da Etapa B

`contrast.json` registra cores, fundos, composição alfa, relações sem arredondamento e contexto de cada cálculo. `proposals.md` apresenta as propostas com os campos solicitados. Nenhuma foi aplicada. A análise usa luminância relativa sRGB após composição alfa em sRGB, referências de 4,5:1 para texto e 3:1 para indicadores não textuais avaliados; guias decorativas são medidas sem impor mínimo.

Os contextos de abas e listas consideram suas superfícies compostas. Breadcrumbs usam o editor como fundo por fallback; números de linha usam o fundo do editor. A comparação sintática é por regra sobre o fundo do editor sem overlays, não por todo pixel renderizado. `constant.numeric.line-number.find-in-files` requer o fundo real da área de resultados: sua medição sobre o editor é apenas um cenário, não um defeito comprovado.

Achados principais: texto do debug do MonoMin em `#EAEAEA` sobre `#888888` tem **2,95:1**; placeholder do MonoDracula, `#6272a4` sobre `#21222c`, **3,36:1**; comentários do MonoDracula sobre o editor ficam em cerca de **3,03:1**. Comentários e demais regras sintáticas não foram clareados. O refinamento de comentários exigiria autorização para alterar TextMate, com possível uso de `#939293` já existente na paleta, sujeito a revisão visual.

As propostas de números de linha ativos/inativos devem ser analisadas em conjunto para preservar destaque relativo. Estados inativos não foram tratados como desabilitados nem clareados na implementação. Atender a um limiar numérico não basta para aprovar uma alteração estética.

Decisões adicionais pendentes:

| Tema | Propriedade correta | Valor anteriormente ignorado | Impacto se ativada |
|---|---|---|---|
| MonoMin | `activityBar.inactiveForeground` | `#888888` | Alto: igualaria a cor dos ícones ativos, eliminando a atenuação por opacidade do fallback. Recomenda-se manter o fallback atual. |
| MonoMin | `editorOverviewRuler.currentContentForeground` | `#888888` | Médio: substituiria o indicador colorido derivado do merge por cinza. Não ativar sem avaliação visual. |
| MonoMin | `editorOverviewRuler.incomingContentForeground` | `#888888` | Médio: mesma mudança para o conteúdo recebido, diminuindo a distinção entre lados. |

## Reprodução e roteiro manual

Executado com Node 24.18.0:

```powershell
node docs/theme-modernization/audit.cjs
node docs/theme-modernization/tokens.cjs
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --installed
git diff --check
```

Os scripts não editam temas; regeneram os relatórios. O caminho da instalação pode ser fornecido como argumento. O baseline fixado exige o commit local disponível. Não foram instaladas dependências nem alteradas configurações.

Validações passaram: JSONC, duplicatas, formatos de cor, reconhecimento estático, paleta das adições, remoções limitadas à lista autorizada, valores existentes, TextMate profundo e textual, configuração semântica, registro de temas e 24 combinações de tema/linguagem/grammars. As verificações de preservação não equivalem a uma certificação visual completa.

Não há ferramenta disponível nesta sessão para controlar a interface do editor. Roteiro pendente:

1. Abrir uma Extension Development Host com o baseline em uma cópia temporária e outra com o checkout atual; usar o mesmo perfil e extensões em ambas.
2. Selecionar cada tema e abrir os exemplos de `tokens.json`. Inspecionar tokens representativos com **Developer: Inspect Editor Tokens and Scopes**, anotando cor, estilo, scope TextMate e classificação semântica.
3. Repetir com a configuração semântica efetiva do perfil e com extensões de linguagem habilitadas; registrar qualquer divergência como possível regressão. Não mudar configurações persistentes para executar o teste.
4. Conferir abas ativas/inativas e janelas sem foco; Explorer e seleções; busca, cursor e diagnósticos; terminal ANSI e seleção; IntelliSense, hover e botões secundários normal/hover/foco; debug, diff e merge.
5. Abrir chat e janela de agentes, quando disponíveis. Conferir borda do painel e foco do campo; comparar fundos, texto e estados inativos. Funcionalidades indisponíveis devem constar como não testadas.

Na auditoria inicial não houve validação visual de chat, Explorer, terminal ou widgets, nem execução de provedores semânticos. A execução posterior dos provedores está em [execution-report.md](execution-report.md). A ausência de regressões visuais nesses componentes ainda requer o roteiro manual. Nenhuma alteração da Etapa B foi executada.
