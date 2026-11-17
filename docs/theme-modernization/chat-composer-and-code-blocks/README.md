# Implementação conjunta — composer nativo e blocos copiáveis

Implementação de 17/11/2026, autorizada após a [rodada experimental](../../contrast-investigation/claude-code-panel/theme-compromises/README.md). VS Code **1.146.0**, Claude Code **2.1.325**, extensão de temas **2.3.5**.

**Aplicadas somente quatro substituições**, sem candidatos para Send. A integração foi executada em duas cópias completas de cada tema, com as duas propriedades modificadas simultaneamente. Não foram encontradas regressões relevantes na amostra executada. Nenhum commit, tag ou publicação foi criado.

## Baseline e diff exato

O estado inicial está em [baseline.json](baseline.json), com commit `0b09812d9614456f97980f902d730cd440fe4e23`, hashes e status preexistente. [before/](before/) contém os bytes dos temas e do manifesto antes da edição. As alterações preexistentes de documentação foram preservadas. Os temas estavam sem alterações locais antes desta implementação.

| Tema | Propriedade | Antes | Depois |
|---|---|---|---|
| MonoMin | `input.border` | `#151515` | `#888888ad` |
| MonoMin | `textCodeBlock.background` | `#151515` | `#00000099` |
| MonoDracula | `input.border` | `#21222c` | `#939293ad` |
| MonoDracula | `textCodeBlock.background` | `#21222c` | `#14141b` |

```diff
--- MonoMinTheme.json
- "input.border": "#151515"
+ "input.border": "#888888ad"
- "textCodeBlock.background": "#151515"
+ "textCodeBlock.background": "#00000099"
--- MonoDraculaTheme.json
- "input.border": "#21222c"
+ "input.border": "#939293ad"
- "textCodeBlock.background": "#21222c"
+ "textCodeBlock.background": "#14141b"
```

O [diff completo](changes.diff) confirma as mesmas quatro substituições. A validação compara a estrutura completa e o texto integral com o baseline mais essas quatro mudanças; diferenças adicionais fazem o teste falhar. Foram consultados os dois patches aprovados (`proposed-blocks.diff` e `composer/proposed-border.diff`); a implementação usa exatamente seus valores.

## Validação real da integração

Abra o [comparador antes/depois](compare.html): quatro colunas com os dois temas, em 13 estados. As **52 capturas reais** estão em [evidence/](evidence/), acompanhadas dos snapshots de estilos computados, provider semântico e controles. Nenhuma imagem é uma simulação.

Uma instância descartável comparou baseline e versão atual na mesma instalação, conversa sintética, zoom, escala, configurações e extensões. Os arquivos atuais instalados no perfil são byte a byte iguais aos definitivos; as cópias de baseline são idênticas aos arquivos salvos antes da edição. Cada versão atual tem **as duas alterações juntas**, não overrides isolados. A conversa local contém blocos curtos, longos, TypeScript, inline comum e inline dentro de link. Nenhuma mensagem foi enviada.

O primeiro ensaio manteve a webview viva mas oculta atrás de outro editor. Essas capturas foram rejeitadas, arquivadas em `preliminary-evidence/` e excluídas dos resultados. O coletor foi corrigido para juntar os grupos e abrir explicitamente a conversa antes das capturas Claude. A amostra aceita mostra a webview efetivamente visível e o prompt com largura constante de 680px nas duas versões. No composer nativo, os estados são comprovados por foco real e linhas renderizadas, não pelo buffer EditContext.

### Composer nativo e Claude Code

Contrastes WCAG sRGB calculados das cores computadas e da composição de transparências. A tabela usa o fundo interno; o [JSON de medições](measurements.json) também registra o fundo externo, cor pintada e estados preenchidos.

| Componente / estado | MonoMin antes → depois | MonoDracula antes → depois | Resultado |
|---|---:|---:|---|
| Composer nativo desfocado | 1,00 → **3,05** | 1,00 → **3,12** | Mudança deliberada |
| Composer nativo focado | 5,15 → **5,15** | 3,36 → **3,36** | Preservado |
| Prompt Claude desfocado | 3,20 → **3,20** | 3,09 → **3,09** | Preservado |
| Prompt Claude focado, Auto | 6,87 → **6,87** | 6,27 → **6,27** | Preservado |

O composer nativo usa `input.border` desfocado e `focusBorder` focado. Ambas as bordas continuam sólidas de 1px, sem shadow nova. Desfocado, a cor pintada é aproximadamente `#636363` no MonoMin e `#6f6e72` no Dracula. O foco mantém `#888888` / `#6272a4`, com contraste maior que o estado desfocado. A inspeção das imagens confirma a distinção entre o contorno neutro e o foco azul no Dracula.

`inlineChatInput.border` permaneceu exatamente **`#888888ad` / `#939293a6`**. Estilos computados completos do prompt Claude, sua sombra, cores do SVG/Send e variáveis de botões/erro são iguais ao baseline nos estados focado e desfocado. O problema de contraste de Send permanece preexistente; nenhuma proposta B foi implementada.

### Blocos copiáveis e tokens

| Métrica | MonoMin antes → depois | MonoDracula antes → depois |
|---|---:|---:|
| Separação bloco/conversa | 1,000 → **1,094** | 1,040 → **1,116** |
| Texto plano no bloco | 15,18 → **16,61** | 15,37 → **17,84** |
| Menor contraste entre os 21 tokens TS | 4,609 → **5,043** | 3,986 → **4,627** |
| Variação de contraste de cada token TS | **+9,42%** | **+16,08%** |
| Inline dentro de link | 11,55 → **12,64** | 14,13 → **16,40** |

Os três blocos reais foram comparados: conteúdo, cores de todos os tokens, itálicos, pesos, padding, raio e bordas ficaram preservados. Somente o fundo mudou. Todos os tokens melhoraram de contraste. As superfícies ficaram perceptivelmente distintas nas capturas, sem exigir a separação do Dark Modern como meta.

O botão de copiar foi testado em hover no bloco curto e no TypeScript: opacidade efetiva 1 e estilos iguais ao baseline. Não houve escrita no clipboard. Código inline comum ficou idêntico; inline dentro de links também recebe `textCodeBlock.background`, efeito compartilhado aprovado e observado, com aumento de contraste. Não houve alteração de cores sintáticas para compensar o fundo.

### Componentes compartilhados e hierarquia

| Verificação | Classificação | Evidência |
|---|---|---|
| Search: contorno desfocado/focado | Mudança deliberada | Borda passa a usar o novo `input.border`; texto, fundo e outline original de foco preservados |
| Aviso de onboarding acima do composer | Mudança deliberada | Recebe o mesmo contorno compartilhado, sem compensações |
| Settings: campos numéricos de tamanho de fonte | Preservado | Estilos computados iguais; usam propriedade de borda própria |
| Side Bar e editor | Preservado | Foregrounds/backgrounds e estilos amostrados iguais; capturas e `*-ui.json` |
| Activity Bar e abas | Preservado na amostra | Estilos/variáveis de ativo e inativo iguais ao baseline, mantendo papéis distintos |
| Prompt Claude e Send | Comportamento preexistente | Bordas, sombras e estilos do botão/ícone iguais |
| Inline comum | Preservado | Estilos computados iguais |
| Inline linkado | Mudança deliberada | Fundo acompanha o bloco; contraste aumenta |
| Regressões relevantes introduzidas | **Nenhuma encontrada na amostra** | Comparações estruturais e de estilos, mais inspeção das capturas |

## Regressões automatizadas e semantic highlighting

Foram executadas **28 verificações**: [12 estruturais](structural.json) e [16 de integração visual/estilos](visual-validation.json). Incluem JSONC válido, ausência de duplicatas, formatos e registro das cores, diff exato, preservação byte a byte de `tokenColors`, 161 regras por tema, scopes/fontStyle, configuração semântica, comentários `#797fa5`, reversão dos foregrounds amarelos de busca e demais valores existentes.

`button.foreground`, `button.background`, `button.hoverBackground` e `errorForeground` permaneceram iguais no JSON e nas variáveis/estilos amostrados. O manifesto, seu registro de temas e versão **2.3.5** ficaram byte a byte iguais. Settings pessoais e bundles instalados relevantes foram conferidos por hash, sem alterações.

Também foi executado o **script TextMate existente `docs/theme-modernization/tokens.cjs`, sem modificar sua lógica**, usando os engines TextMate/Oniguruma da instalação e grammars instaladas. O wrapper [run-existing-tokens.cjs](run-existing-tokens.cjs) apenas fornece o baseline HEAD já registrado e direciona os artefatos para esta pasta. Resultado: estilos resolvidos idênticos nas seis linguagens **TypeScript, JavaScript, HTML, CSS, SCSS e JSON**, para ambos os temas. Evidência: [tokens-installed.json](tokens-installed.json).

Os antigos validadores de etapas históricas exigem igualdade integral com seus respectivos baselines e não aceitam estas quatro novas mudanças. Não foram enfraquecidos nem tiveram seus resultados históricos regravados. As verificações relevantes de JSONC, registro, TextMate, busca revertida, comentários e preservação foram reutilizadas no validador desta etapa, que exige o delta exato autorizado.

Uma segunda instância descartável executou o **probe semântico já existente** em `claude-code-prompt-border/probe/token-probe.cjs`. Semantic highlighting foi ligado para TypeScript **no perfil temporário antes da abertura**, mantendo a mesma configuração nas duas versões. Em cada tema:

- o provedor retornou tokens não vazios e a mesma legenda/dados antes e depois;
- o documento estava salvo, com mesmo hash, fontes e versões de extensões;
- os estilos efetivamente computados dos spans do editor permaneceram iguais com semantic highlighting ligado;
- foram geradas capturas `*-semantic-editor.png` e dados `*-semantic-provider.json`.

Uma tentativa inicial de habilitar o override de linguagem pela API durante a execução encontrou um erro de gravação do settings **do perfil descartável**. Ela não foi classificada como teste aprovado. A comparação aceita foi refeita em perfil novo com o override já definido; não depende de configurações pessoais nem de um documento de teste alterado. O arquivo definitivo do tema e suas configurações semânticas nunca foram modificados por esse ensaio.

## Reprodução e limitações

Para conferir os resultados salvos:

```powershell
node docs/theme-modernization/chat-composer-and-code-blocks/validate.cjs
node docs/theme-modernization/chat-composer-and-code-blocks/measure.cjs
node docs/theme-modernization/chat-composer-and-code-blocks/validate-visual.cjs
node docs/theme-modernization/chat-composer-and-code-blocks/run-existing-tokens.cjs --installed
git diff --check
```

Para nova coleta, os scripts `prepare.cjs --fixture`, `control.cjs fixture` e `run.cjs` criam/operam o perfil temporário; `prepare-semantic-profile.cjs` e `semantic/prepare.cjs --fixture`, seguidos de `run-semantic.cjs`, criam a segunda instância. Os caminhos locais e as portas 9408/9409 constam nos respectivos `session.json`; use somente perfis descartáveis. **Não reexecute `bootstrap.cjs`**: ele guarda o baseline e aplica as quatro substituições uma única vez, recusando sobrescrever o registro inicial.

Limitações explicitamente pendentes: composer autenticado sem onboarding, streaming, desabilitado e demais modos de conversa; copiar para o clipboard; todas as linguagens/provedores semânticos e todas as extensões/consumidores de `input.border` ou `textCodeBlock.background`. O teste real do editor com semantic highlighting ligado é uma amostra TypeScript, não uma validação universal. A execução TextMate das seis linguagens complementa essa amostra e não executa seus provedores semânticos. Não foi usada a UI Inspect Editor Tokens and Scopes como evidência adicional.

Não houve modificação permanente de configurações pessoais, extensões ou bundles, nem alteração de foregrounds de busca, Search lateral, Antigravity, TextMate ou cores de comentários. Search recebe apenas o efeito da borda compartilhada explicitamente autorizada. A implementação fica disponível para revisão, **sem commit ou publicação**.
