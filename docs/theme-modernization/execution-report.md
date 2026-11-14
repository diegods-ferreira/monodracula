# Execução da validação da Etapa A — 13/11/2026

Atualização posterior: a [amostragem visual](visual-results.md) executou os casos prioritários antes pendentes desta matriz histórica. Consulte esse relatório para o estado mais recente; os resultados automatizados abaixo não foram repetidos.

**Resultado:** preparação e verificações automatizadas concluídas; 24 comparações de provedores semânticos aprovadas. Nenhum teste de aparência final foi aprovado. A Etapa B não foi executada.

## Ambiente e evidências

- VS Code 1.146.0, instalação `69047191fc`; baseline `5e743df193c5ca2832f524781ca424e58a08911c` versus checkout atual da Etapa A.
- Sessão real preparada em `C:\Users\diego\AppData\Local\Temp\monodracula-visual-d4JSyW`. Contém `manifest.json`, `extensions-sha256.json`, `consistency.json`, fixtures, launcher e os dois perfis. Não é o diretório do smoke test anterior.
- Foram copiados 14 diretórios de extensões externas, mais o probe local. O índice do VS Code selecionou versões conhecidas, incluindo apenas a versão selecionada de extensões que tinham múltiplos diretórios instalados.
- Os hosts foram executados sequencialmente, com os mesmos arquivos, fontes de configuração e diretório congelado de extensões. Configurações efetivas e inventários de extensões ativas coincidiram em todos os pares.
- A primeira tentativa foi interrompida pelo Electron por restrição de ACL ao processo sandbox. A repetição fora do sandbox da ferramenta terminou com código **0 nos dois hosts**. Nenhuma ACL foi alterada e o sandbox do VS Code não foi desativado.
- Logs e capturas completas permanecem nos perfis temporários; o resumo verificável está em [execution-results.json](execution-results.json). Logs não foram publicados porque podem conter informações de extensões e serviços locais.

## Matriz de resultados

| Teste | Resultado | Evidência e limite |
|---|---|---|
| Preparação dos perfis reais e fixtures | **Aprovado** | Cópias criadas; manifesto e hashes conferidos. Configurações iniciais iguais; configurações finais dos dois perfis também iguais. |
| Consistência de extensões | **Aprovado** | 17.178 arquivos verificados após os hosts; nenhuma alteração inesperada. A atualização intencional do probe para automatizar a coleta foi identificada separadamente. O novo `extensions.json` contém somente versões conhecidas. |
| Preservação dos arquivos de tema e settings originais durante esta execução | **Aprovado** | Hashes iguais aos da preparação; settings originais do usuário permanecem iguais. As mudanças semânticas on/off ocorreram somente nos perfis temporários. |
| JSONC, nomes de cores, valores preexistentes, registro dos temas e TextMate | **Aprovado** | `audit.cjs` reexecutado sem falhas; 161 regras preservadas por tema. |
| Resolução TextMate/Oniguruma | **Aprovado no motor isolado** | 24 combinações: 2 temas × 6 linguagens × grammars incorporadas/com contribuições locais. Scopes, cores e estilos resolvidos iguais. Não é screenshot nem inspeção do renderer. |
| Provedores semânticos reais de TS, JS, HTML e comentários TS | **Aprovado quanto aos dados/configurações** | 24 pares: 2 temas × 3 modos × 4 arquivos. Legendas e dados retornados iguais e estáveis em duas coletas consecutivas. Configuração efetiva, extensões, fonte e conteúdo coincidiram. |
| Semântica de CSS, SCSS e JSON nesta sessão | **Pendente / sem evidência de provedor** | 18 pares sem retorno nas tentativas realizadas. Resultados vazios não foram aprovados. Não se afirma ausência universal de suporte nessas linguagens. |
| Estilos realmente aplicados no editor, inclusive sobreposição semântica | **Pendente** | Os arquivos foram abertos em editores reais, mas não houve inspeção dos estilos no renderer nem screenshots. Dados de provedor iguais não substituem essa prova. |
| Guias de indentação | **Pendente visual** | Valores e cadeia de fallback são equivalentes; aparência ativa/inativa ainda não foi comparada no renderer. |
| Botões secundários | **Diferença deliberada na definição; visual pendente** | Reutilizam as cores de `button.*` em vez dos padrões genéricos. Não houve execução/captura do fixture de botão nesta rodada. |
| Borda do painel de agentes | **Diferença deliberada na definição; visual pendente** | Usa `panel.border`; não foi aberta e inspecionada a janela de agentes. |
| Activity Bar, abas, listas e demais estados ativos/inativos | **Pendente visual** | Valores válidos existentes preservados. Não houve comparação de hierarquia visual com foco/sem foco. |
| Regressões introduzidas pela Etapa A | **Nenhuma detectada nas verificações executadas** | Não houve divergência nos dados comparados. Regressões visuais ainda não podem ser excluídas. |

O modo `profile` resolveu `editor.semanticHighlighting.enabled` como `configuredByTheme` nos arquivos examinados; `on` resolveu `true`, e `off`, `false`. O provedor pode retornar dados mesmo em `off`: isso foi observado e não foi interpretado como prova de que tokens semânticos estavam sendo pintados. A aparência entre on/off pode mudar; a comparação de regressão deve ser baseline versus atual **dentro do mesmo modo**.

## Execução automatizada realizada

```powershell
node docs/theme-modernization/prepare-visual.cjs --prepare
node docs/theme-modernization/audit.cjs
node docs/theme-modernization/tokens.cjs
node docs/theme-modernization/tokens.cjs 'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app' --installed
node docs/theme-modernization/execute-visual.cjs 'C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW'
node docs/theme-modernization/check-session.cjs 'C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW'
node docs/theme-modernization/consolidate-session.cjs 'C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW'
git diff --check
```

O runner abriu 7 arquivos × 2 temas × 3 modos em cada host: **84 casos, 42 pares**. Executou consultas reais e verificou estabilidade. O consolidador invocou `compare-captures.cjs` em todos os pares: 24 com evidência igual e estável, 18 inconclusivos, **zero pares divergentes**. A verificação final de consistência foi executada após o encerramento dos hosts.

Arquivos locais úteis:

- `baseline/runtime-captures.json` e `current/runtime-captures.json`: os 42 registros finais de cada host, incluindo configurações e extensões.
- `baseline/data/User/globalStorage/local-audit.theme-visual-probe/captures/` e equivalente no `current`: coletas individuais, inclusive as repetições de estabilidade.
- `baseline/sandbox-launch.log` e equivalente no `current`: falha inicial de inicialização.
- `baseline/runtime-launch.log` e equivalente no `current`: execução bem-sucedida; avisos de serviços/autenticação das extensões não foram classificados como regressões de tema.

Para repetir o runner, prepare uma **nova sessão**. Ele recusa sobrescrever capturas anteriores. Os scripts são específicos para o VS Code auditado; não são uma ferramenta genérica de automação de qualquer versão.

## Instruções manuais específicas para encerrar a validação

1. Abra os hosts preparados em PowerShell:

   ```powershell
   & 'C:\Users\diego\AppData\Local\Temp\monodracula-visual-d4JSyW\launch.ps1'
   ```

   Identifique o lado por **Developer: Open Logs Folder**: a pasta aberta estará sob `baseline\data\logs` ou `current\data\logs`. Não use sua janela normal como um dos lados. Os hosts automáticos anteriores já encerraram; nenhuma janela pessoal foi fechada pelo runner.

2. Selecione **MonoDracula** em ambos. Abra `sample.ts` e `comments.ts` da pasta `fixtures`. Confirme a mesma fonte, zoom e largura. No caso `profile`, mantenha as configurações restauradas; para `on`, defina `"[typescript]": { "editor.semanticHighlighting.enabled": true }` em **User Settings (JSON)** de ambos os perfis temporários, preservando outras chaves do bloco. Repita com `false` para `off`.
3. Em cada caso, inspecione classe/interface, função/método, propriedade/readonly, parâmetro, variável/constante, string/número/operador e comentários com **Developer: Inspect Editor Tokens and Scopes**. Registre foreground, background, itálico/negrito, scopes e classificação semântica. Faça screenshots pareados. Repita com MonoMin, JS e HTML. CSS/SCSS/JSON continuam exigindo a comparação TextMate no editor; a ausência de dados semânticos nesta sessão não dispensa essa inspeção.
4. Compare as guias no bloco de função de `comments.ts` e no método de `sample.ts`, com cursor dentro/fora de cada bloco e com as mesmas opções de guias. Resultado esperado: nenhuma diferença entre versões; inativo continua subordinado ao ativo.
5. Execute **Theme Audit: Open Native Secondary Button Fixture** nos dois hosts. Compare normal, hover e foco por Tab. Em **Developer: Toggle Developer Tools**, confirme o botão `.monaco-button.secondary` e registre foreground/background computados. Espera-se diferença de paleta do baseline, mas texto, hover e foco precisam continuar identificáveis. Se o fixture não produzir botão secundário, registre inconclusivo e use um controle real confirmado no DOM, conforme o procedimento aprovado.
6. Para agentes, abra a janela de agentes a partir de cada host usando o mesmo workspace e estado de conta. Confirme que o tema e o perfil corretos foram carregados; inspecione o consumidor de `--vscode-agentsPanel-border`. Compare a borda com a superfície adjacente. Sem acesso ao componente, registre **não testado**.
7. Em cada tema, capture Activity Bar, abas e Explorer com seleção ativa e inativa; foque cada janela antes da captura de estado ativo. Compare estados sem foco separadamente. Não use contraste igual entre estados como critério de aceite.
8. Registre achados no modelo de [visual-validation.md](visual-validation.md). Qualquer diferença sintática não explicada ou perda de distinção de estados é **possível regressão**, independentemente dos testes automatizados aprovados. Nenhum refinamento da Etapa B deve ser aplicado para mascarar uma regressão.

O relatório focalizado de contraste permanece uma análise separada. Nenhuma alteração de cor, regra TextMate ou configuração semântica de tema está autorizada por esta execução.
