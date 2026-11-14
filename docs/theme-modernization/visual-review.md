# Revisão visual focalizada — Etapa B não autorizada

Atualização posterior: o usuário autorizou exclusivamente a alternativa de comentários do MonoDracula em `#797fa5`. Sua execução e evidências estão em [stage-b-comments/README.md](stage-b-comments/README.md). As propostas originais abaixo permanecem como histórico; nenhuma outra alternativa foi autorizada ou aplicada.

Esta revisão substitui a interpretação das sugestões numéricas anteriores como recomendações automáticas. A tabela gerada em `proposals.md` é um inventário exploratório de candidatos, não uma lista de alterações a aplicar. Nenhuma cor ou regra TextMate foi modificada nesta etapa.

## Comentários do MonoDracula

Os comentários principais usam `#6272a4`, com itálico na regra geral, sobre `editor.background = #282a36`: **3,03:1**. As regras `comment storage.type` e `punctuation.definition.comment` também podem determinar essa cor em trechos específicos. O texto do editor é `#fcfcfa`; comentários têm uma função informativa própria e devem permanecer secundários.

Documentação, contratos e justificativas em comentários não são decoração. A referência de 4,5:1 para texto normal é pertinente à investigação de leitura; isso não autoriza clarear toda categoria secundária. A [explicação da WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) relaciona contraste à legibilidade, com exceções próprias para texto incidental. Não equiparamos comentários ou abas sem foco a controles desabilitados.

Use `comments.ts` nos dois temas e, no MonoDracula, examine linha, bloco, JSDoc e comentário ao fim de uma expressão. Confirme a cor real no inspetor: extensões, seletores mais específicos e tokens semânticos podem determinar outra aparência. Verifique leitura na fonte/tamanho habitual, sem zoom compensatório, primeiro sem seleção e depois com seleção/busca e linha corrente. Registre fundo efetivo e estilo. Feedback de dificuldade de leitura com essas condições torna a necessidade de ajuste mais bem fundamentada; os números sozinhos não comprovam uma regressão introduzida pela Etapa A.

Alternativas condicionais, ambas da paleta original, sem alterar itálico nem scopes:

| Tema | Propriedade/regra | Cor atual | Fundo | Contraste atual | Cor proposta | Contraste proposto | Justificativa | Impacto visual |
|---|---|---|---|---|---|---|---|---|
| MonoDracula | Regras que resolvem comentários para `#6272a4` | `#6272a4` | `#282a36` | 3,03:1 | `#797fa5` | 3,66:1 | Alternativa conservadora se a leitura falhar: aumenta luminância mantendo caráter azulado e destaque secundário. Continua abaixo de 4,5:1; não apresentar como correção de conformidade. | Médio: comentários mais claros e menos saturados; já é cor usada em números de linha ativos. |
| MonoDracula | Mesmas regras — alternativa mutuamente exclusiva | `#6272a4` | `#282a36` | 3,03:1 | `#939293` | 4,59:1 | Alternativa de maior legibilidade se necessária após avaliação. Preserva diferença ampla para texto principal, mas troca o azul por cinza. | Alto na identidade da sintaxe: neutraliza uma categoria hoje azulada. Não é a opção conservadora preferida. |

Não recomendar aplicação global antes de registrar os tokens reais. Se a decisão for manter a cor atual, registrar explicitamente o compromisso de legibilidade; se aprovada uma alternativa, revisar todas as regras que afetam comentários, sem substituir ocorrências hexadecimais indiscriminadamente. Isso evita alterar classes, números de linha, placeholders ou outras categorias que compartilham a paleta.

## Textos funcionais

Prioridade significa necessidade de validação contextual, não autorização para mudança:

| Tema | Propriedade | Cor atual | Fundo | Contraste atual | Cor proposta, se o problema for confirmado | Contraste proposto | Justificativa | Impacto visual |
|---|---|---|---|---|---|---|---|---|
| MonoMin | `statusBar.debuggingForeground` | `#EAEAEA` | `#888888` | 2,95:1 | `#1f1f1f` | 4,65:1 | Texto de estado/comandos necessário durante debug; testar a Status Bar real, inclusive itens com foreground próprio. | Alto: troca texto claro por escuro; mudança significativa na hierarquia local. |
| MonoDracula | `input.placeholderForeground` | `#6272a4` | `#21222c` | 3,36:1 | `#939293` | 5,09:1 | Justificável quando o placeholder transmite instrução necessária sem rótulo equivalente. Se apenas repete o rótulo, não há prioridade demonstrada. | Médio: perde azul; ainda menos destacado que `input.foreground = #fcfcfa`. |
| MonoDracula | `sideBar.foreground` | `#5e6886` | `#1d1f28` | 2,97:1 | `#939293` | 5,30:1 | Nomes de arquivos e outros rótulos permitem navegação. Confirmar herança real e estados selecionado/hover antes de propor alteração de todo o Side Bar. | Médio a alto: clareia grande área funcional e reduz o caráter azulado. |
| MonoDracula | `breadcrumb.foreground` | `#5e627e` | `#282a36` | 2,39:1 | `#939293` | 4,59:1 | Segmentos de caminho são navegação utilizável. Confirmar fundo efetivo e cor dos estados normal, foco e seleção. | Médio: ganho amplo de brilho; precisa manter foco/seleção mais destacados. |

Não aplicar essas quatro propostas em conjunto por padrão. Primeiro registre o contexto funcional, a cor aplicada e a tarefa prejudicada; uma alteração global de foreground pode afetar mais componentes do que a amostra medida. Se a cor de um estado específico resolve o problema com menor impacto, prepare essa alternativa para nova aprovação em vez de ampliar a mudança.

## Ativos, inativos e demais candidatos

- Mantenha o fallback atual da Activity Bar do MonoMin: ativar o antigo `#888888` para inativos igualaria sua cor à dos ativos.
- Não recomendo neste momento clarear ícones inativos da Activity Bar do MonoDracula apenas para atingir 3:1: o estado continua funcionalmente disponível e deve ser identificável, mas a necessidade concreta precisa de inspeção da área e seus indicadores ativos. Não presumir que inativo significa desabilitado.
- Não recomendo aplicar o par de propostas automáticas de números de linha apenas para alcançar 4,5:1. A alternativa anterior clareia o número ativo para `#c1c0c0`, ampliando destaque além do pedido; analisar em conjunto com a guia de linha corrente e a função dos números.
- Abas inativas e título de janela sem foco precisam continuar subordinados aos ativos. Avalie legibilidade dos nomes sem transformar todos os estados em texto principal. Os candidatos numéricos anteriores permanecem em espera, sem recomendação de aplicação.
- Comentários e textos funcionais têm prioridade sobre bordas decorativas. Não alterar indicadores de merge para cinza nem criar borda superior em abas como consequência desta auditoria de contraste.

Após o procedimento visual, classifique cada achado como problema preexistente confirmado, regressão da Etapa A, diferença deliberada da Etapa A ou hipótese não confirmada. Somente depois selecione propostas para aprovação explícita. Não alterar temas, TextMate ou configurações semânticas enquanto essa aprovação não existir.
