# Etapa B — autorização exclusiva para comentários do MonoDracula

Foi aplicada somente a troca **`#6272a4` → `#797fa5`** nas três regras abaixo. A autorização não abrange os demais candidatos da Etapa B. O baseline anterior à edição está em `baseline/`; corresponde ao estado aprovado da Etapa A, incluindo suas alterações de interface. Nenhum commit foi criado.

## Auditoria e regras modificadas

Índices abaixo começam em zero. A coleção continua com **161 regras**, na mesma ordem.

| Índice | Scopes preservados | Alteração |
|---|---|---|
| 0 | `comment`, `comment keyword`, `comment markup.underline.link`, `comment string`, `comment punctuation.definition`, `comment punctuation`, `comment text` | Somente `settings.foreground`; `fontStyle: italic` permanece |
| 1 | `comment storage.type` | Somente `settings.foreground`; demais estilos continuam herdados |
| 90 | `punctuation.definition.comment` | Somente `settings.foreground`; demais estilos continuam herdados |

Não existem regras independentes `comment.line`, `comment.block` ou `comment.block.documentation` a acrescentar ou alterar. Esses scopes específicos herdam a regra geral quando emitidos pelas grammars. A regra 1 especifica storage dentro de comentários; a regra 90 trata sua pontuação. As regras mais específicas já intencionais foram preservadas: `comment entity.name.type`, `comment variable`/`comment variable.other` (`#C1C0C0`), codetags (`#bd93f9`) e os comentários de Git com cores próprias. Nenhum conflito impediu determinar o conjunto autorizado.

O [diff exato em relação ao baseline anterior à edição](change.diff) contém apenas três linhas removidas e três adicionadas:

```diff
 tokenColors[0].settings.foreground
-#6272a4
+#797fa5
 tokenColors[1].settings.foreground
-#6272a4
+#797fa5
 tokenColors[90].settings.foreground
-#6272a4
+#797fa5
```

Não houve substituição global. A edição utilizou as posições dos três nós `settings.foreground` na AST JSONC e a validação exige igualdade textual com o baseline após aplicar exatamente essas três substituições.

## Validações automatizadas executadas

- JSONC válido, sem chaves duplicadas; cores e nomes verificados pela auditoria existente.
- Mesmo número de regras, scopes, nomes, ordem e estilos; nenhum campo de `colors` ou configuração semântica alterado.
- MonoMin e manifesto idênticos em bytes aos baselines anteriores à edição.
- Nenhuma mudança de cor fora dos três nós autorizados. As demais ocorrências de `#6272a4` na interface permanecem intactas.
- Testes existentes com TextMate e Oniguruma do VS Code 1.146.0: TS, JS, HTML, CSS, SCSS e JSON, em dois conjuntos de grammars — incorporadas e com PostCSS/Tailwind locais. Foram incluídos exemplos adicionais de bloco, documentação e comentário ao final de expressão.
- Em cada conjunto, o MonoMin manteve **1.034 caracteres resolvidos iguais**. No MonoDracula, **148 caracteres de comentários** tiveram exclusivamente a troca autorizada, e **886 caracteres** ficaram iguais. Scopes, metadados de linguagem/tipo/estilo, backgrounds e todos os foregrounds não autorizados foram comparados. Os números representam as fixtures, não uma contagem de todas as linguagens possíveis.

A comparação decodifica as cores dos metadados do TextMate antes de comparar: índices numéricos do color map podem mudar quando a paleta de tokens muda. Isso evita confundir uma renumeração interna com mudança visual e mantém a verificação de fontes, cores efetivas e scopes. A validação estrutural separada exige o delta exato das regras, impedindo que a permissão por cor/scopes mascare outra edição.

Comandos executados, a partir da raiz:

```powershell
node docs/theme-modernization/validate-comments.cjs
node docs/theme-modernization/audit.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --comments-approved --installed
node docs/theme-modernization/compare-comments-renderer.cjs
git diff --check
```

`--comments-approved` habilita exclusivamente o delta autorizado, sem flexibilizar o modo histórico da Etapa A. Os resultados novos são gravados nesta pasta, incluindo `audit/`, `tokens.json` e `tokens-installed.json`; as evidências históricas da Etapa A não foram sobrescritas.

## Validação visual efetivamente executada

Foram abertas duas instâncias reais do VS Code 1.146.0, com o pacote da Etapa A anterior à edição e o pacote atual. Usaram a mesma cópia de extensões da validação anterior, a mesma fonte/tamanho, o mesmo arquivo e fundo `#282a36`. Somente os perfis temporários ficaram com semântica ligada; os temas continuam sem alteração de configuração semântica.

| Caso visual | Resultado |
|---|---|
| Comentário de linha | Nova cor aplicada, itálico preservado |
| Comentário de bloco | Nova cor aplicada, itálico preservado |
| JSDoc e tags | Nova cor aplicada nos trechos antes azulados; o nome `value` mantém seu override `#C1C0C0` |
| Comentário ao final da expressão | Somente o trecho comentado mudou; a expressão anterior ficou igual |
| Keywords, função, parâmetros, variáveis, operadores e strings | Estilos computados iguais antes/depois |
| Semantic highlighting ligado | Mesmas configurações efetivas, legenda e dados do provedor; sem mudança inesperada no renderer |

O comparador do renderer validou **235 caracteres alterados exclusivamente nos comentários autorizados**, mantendo itálico e peso; **159 caracteres visíveis permaneceram iguais**. O texto, foreground dos demais tokens e demais estilos foram confrontados por posição, independentemente da segmentação dos spans. As cores derivadas de `currentColor` dos spans acompanham o foreground, sem introduzir bordas/outline visíveis de sintaxe.

Evidências: [antes](visual/before.png), [depois](visual/after.png), [inspetor antes](visual/before-inspect.png), [inspetor depois](visual/after-inspect.png) e [comparação computada](visual/comparison.json). Os screenshots foram inspecionados. Os comentários ficaram moderadamente mais claros, continuam azulados e visualmente secundários ao código principal. Não foi ajustada nenhuma outra categoria.

O inspetor real sobre o comentário de linha confirmou os mesmos scopes `comment.line.double-slash.ts` e `source.ts`, a regra geral `comment` e `font style: italic`. O contraste mostrado passou de **3,03:1 para 3,66:1**; continua abaixo de 4,5:1, conforme a escolha autorizada. Nenhum ajuste adicional foi realizado para atingir esse limiar.

## Limites e conclusão

Não foram observadas diferenças inesperadas nos testes executados. A inspeção visual específica cobriu TypeScript com semântica ligada; as demais linguagens tiveram comparação TextMate automatizada, sem extrapolar uma aprovação visual completa para todas as grammars ou perfis remotos. A percepção no monitor habitual do usuário pode variar, mas não foi usada para inventar novas alterações.

Os demais refinamentos da Etapa B continuam pendentes de aprovação explícita. Não foram alterados os temas de interface, o MonoMin, o manifesto, scopes, itálico, ordem de regras ou configurações semânticas. O baseline anterior à edição permite revisar ou reproduzir este delta independentemente das alterações preexistentes no Git.
