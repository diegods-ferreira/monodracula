# Comparação reproduzível no editor real — aprovação ainda pendente

Este procedimento não altera os temas. A preparação cria cópias temporárias do baseline fixado e dos temas atuais, configurações isoladas e uma cópia das extensões. O preparador não abre janelas automaticamente. A execução posterior com hosts reais e provedores semânticos está documentada em [execution-report.md](execution-report.md); a inspeção dos estilos no renderer e os screenshots permanecem pendentes.

Validação inicial do procedimento: sintaxe dos scripts, preflight na instalação 1.146.0, preparação com fonte de extensões vazia e casos iguais/diferentes no comparador. Depois foram executadas a cópia integral e a coleta automática nos hosts reais: consulte a matriz do relatório de execução para distinguir os resultados comprovados das pendências visuais.

## 1. Congelar os insumos

Feche atualizações de extensões antes da cópia. Use o VS Code 1.146.0 auditado e o mesmo computador, monitor, escala de tela, fonte, tamanho de janela e zoom. O script exige essa versão. Se a instalação tiver sido atualizada, use uma instalação portátil da versão auditada ou registre um novo ciclo de validação; não compare versões diferentes do editor.

Na raiz do repositório, em PowerShell:

```powershell
node docs/theme-modernization/prepare-visual.cjs --check
node docs/theme-modernization/prepare-visual.cjs --prepare
```

O segundo comando imprime o diretório temporário. Leia `manifest.json` nesse diretório e execute seu `launch.ps1`. A cópia integral das extensões pode consumir bastante espaço. O diretório é novo e exclusivo; nenhum arquivo original é sobrescrito. Não há instalação nem download de dependências pelo preparador.

Para um perfil não padrão, informe antes os caminhos reais com `$env:THEME_AUDIT_SETTINGS` e `$env:THEME_AUDIT_EXTENSIONS`. `$env:THEME_AUDIT_APP` permite apontar para `resources/app` de outra instalação da mesma versão. O script copia settings JSONC e registra seu hash; esses arquivos podem conter configurações privadas e devem permanecer locais.

Os dois hosts usam o mesmo diretório de fixtures e a mesma cópia das extensões; cada host usa seu próprio `--user-data-dir` e `--extensionDevelopmentPath`. Os temas não recebem novos IDs nem rótulos. O pacote instalado de MonoDracula é excluído da cópia para evitar competição com a versão em desenvolvimento.

As únicas substituições iniciais são: tema inicial MonoDracula, atualização do editor desativada, atualização/verificação automática de extensões desativadas e diálogos customizados do VS Code para testar botões tematizados. Sync fica desligado por CLI, e o idioma é `en-US` nos dois hosts. A troca de tema e os ensaios semânticos seguintes devem ser feitos somente nos perfis temporários.

**Limites do isolamento:** estados de autenticação, extensões desabilitadas, perfis remotos, layout e armazenamento de extensões não são copiados. Os perfis temporários habilitam as extensões copiadas por padrão. Ajuste o mesmo conjunto de habilitação nos dois hosts antes de começar e registre-o. Servidores externos, SDKs apontados por caminhos absolutos, fontes do sistema e downloads internos de extensões não são congelados. Verifique a versão do TypeScript em **TypeScript: Select TypeScript Version**, use a versão incorporada em ambos e não instale pacotes no workspace. Se outra extensão usa servidor próprio, registre sua versão; diferenças bloqueiam a comparação daquela linguagem.

O manifesto registra hashes dos temas e a versão das extensões; `extensions-sha256.json` registra os bytes da cópia das extensões. Se houver atualização ou download que altere grammars ou servidor de linguagem, descarte o resultado da execução e prepare um novo par. Não reutilize um dos lados de uma sessão antiga.

## 2. Matriz de syntax highlighting e semântica

Para cada um dos dois temas, compare baseline e atual nas mesmas condições:

| Caso | Configuração semântica | Finalidade |
|---|---|---|
| `profile` | Valores copiados, incluindo overrides de linguagem | Reproduzir o comportamento habitual do perfil selecionado |
| `on` | `true` no bloco da linguagem testada | Exercitar sobreposição semântica real |
| `off` | `false` no bloco da linguagem testada | Comparar o TextMate no renderer real |

Em `profile`, não altere o valor original. Para `on`/`off`, edite **Preferences: Open User Settings (JSON)** dos hosts temporários, usando, por exemplo, `"[typescript]": { "editor.semanticHighlighting.enabled": true }`. Preserve outras chaves já existentes dentro do bloco. Repita para `javascript`, `html`, `css`, `scss` e `json`, conforme o arquivo aberto. Na volta ao caso `profile`, restaure os valores do settings inicial de ambos os hosts. Não basta alterar a opção global se existe override por linguagem.

Comece com `sample.ts`, `sample.js` e `comments.ts`; depois HTML, CSS, SCSS e JSON. Não edite os exemplos entre capturas. Espere o serviço de linguagem terminar de carregar: faça duas capturas separadas por alguns segundos e confirme estabilidade da legenda/dados semânticos antes de comparar os lados. Um tempo fixo de espera, sozinho, não prova estabilidade.

1. Selecione o mesmo tema nos dois hosts. Abra o mesmo arquivo, mesma posição e mesmo tamanho de editor. Limpe seleções, busca, hovers e decorações transitórias que ocultem o texto.
2. Execute **Developer: Show Running Extensions**. Registre extensões habilitadas/ativas e versões, especialmente TypeScript, PostCSS e Tailwind. As grammars efetivamente usadas podem diferir entre perfis: o inventário de instaladas, sozinho, não comprova igualdade.
3. Execute **Theme Audit: Capture Active Document** em cada host. Use o mesmo rótulo, por exemplo `MonoDracula-on`. O comando salva JSON no armazenamento do probe do respectivo perfil e abre o arquivo capturado. Volte ao exemplo antes da inspeção visual.
4. A captura registra configuração efetiva e suas fontes, texto/hash, fonte, tema, extensões e legenda/dados retornados pelo provedor semântico real. Ela não sintetiza um provedor para linguagens sem suporte. `no-provider-or-no-result` significa ausência de evidência semântica, não aprovação desse teste.
5. Compare os JSONs com o comando abaixo. Diferenças de ativação precisam ser estabilizadas ou explicadas antes de aceitar. Caso os dados variem entre duas capturas do mesmo lado, investigue a inicialização/provedor antes de atribuir a diferença ao tema.

```powershell
node docs/theme-modernization/compare-captures.cjs 'CAMINHO-BASELINE.json' 'CAMINHO-ATUAL.json'
```

Esse comparador não certifica renderização: um provedor pode retornar tokens mesmo com sua aplicação visual desligada. A prova dos estilos aplicados vem dos próximos passos.

Ausência de resultado semântico torna a comparação do provedor inconclusiva e produz código de saída 1. Em linguagens sem provedor, registre semântica como não aplicável e prossiga com inspeção TextMate; não converta isso em aprovação do caso semântico de TS/JS.

6. Posicione o cursor dentro de cada categoria e execute **Developer: Inspect Editor Tokens and Scopes**. Registre foreground, background, `fontStyle`, scopes TextMate, tipo/modificadores semânticos e regra que determinou a aparência. Compare baseline e atual dentro do mesmo caso.
7. Faça screenshots pareados do texto e do inspetor, identificando lado, tema, caso, linguagem, linha e token. Para texto idêntico, confirme a mesma glyph shape, itálico/negrito e cor efetiva. Compare imagens lado a lado e com alternância; não imponha igualdade de pixels de bordas de glifos se houver diferenças de antialiasing entre janelas.

Tokens obrigatórios em TS/JS: keyword, função, método, classe, interface, propriedade, parâmetro, variável, constante `readonly`/`static`, string, interpolação, número, operador, comentário de linha, bloco e JSDoc. Use os scopes realmente mostrados pelo inspetor, sem presumir que um identificador em maiúsculas é classificado como constante semântica.

Em HTML/CSS/SCSS/JSON, inclua tags/atributos, ID/classe, pseudo-classe, variável SCSS, mixin, propriedade/valor CSS, chaves JSON, booleano e `null`, além de trechos embutidos no HTML. Registre o provedor ausente como não aplicável para semântica, mantendo o teste TextMate/renderização.

## 3. Componentes alterados na Etapa A

| Componente | Ensaio pareado | Resultado esperado |
|---|---|---|
| Guias de indentação | Mesmo bloco com dois níveis; cursor dentro e fora; mesmas opções de guias/bracket pairs | Guias ativas e inativas idênticas entre versões, pois os novos IDs repetem o fallback antigo |
| Botão secundário | Execute **Theme Audit: Open Native Secondary Button Fixture**; capture normal, hover e foco por Tab | Mudança deliberada: secundário usa a paleta do tema. Texto legível e hover/foco identificáveis; não exigir igualdade visual com baseline |
| Painel de agentes | Use a janela de agentes do VS Code 1.146.0, com a mesma pasta e conta nos dois hosts; compare borda/superfície | Mudança deliberada de borda para `panel.border`; não confundir com campo de chat ou bordas de cards derivados |
| Entradas inválidas comentadas | Activity Bar com item ativo/inativo e merge aberto; página Welcome | Aparência atual deve permanecer igual; não aplicar os antigos valores ignorados durante o teste |

O fixture de botão usa o diálogo do workbench, não um mock HTML. Em **Developer: Toggle Developer Tools**, confirme que a ação testada é `.monaco-button.secondary` e anote suas cores CSS computadas. Se a versão/plataforma não apresentar uma ação secundária, marque o fixture como inconclusivo e use um botão secundário real de notificações/configurações confirmado no DOM. Não aceite um diálogo nativo do sistema operacional como evidência de cor do tema.

Para agentes, utilize os comandos de abertura fornecidos pela instalação ou `code --agents` com os mesmos argumentos de diretórios do launcher. Inspecione o elemento que consome `--vscode-agentsPanel-border`. Se a janela ignorar o tema em desenvolvimento ou não carregar o mesmo perfil, o teste é inválido. Login/serviço indisponível deve ser registrado como não testado; não substitua essa evidência por uma imagem simulada.

Nos dois temas, confira também Explorer com seleção ativa/inativa, abas com e sem foco, autocomplete, hover e terminal. Ao fotografar duas janelas, ambas não estarão simultaneamente em foco: foque cada uma antes da respectiva captura ou compare explicitamente os estados sem foco. Mantenha zoom, largura, scroll e conteúdo iguais.

## 4. Registro e aceite

Crie uma linha por evidência usando este modelo, armazenado fora do repositório até revisão:

| Tema/caso | Arquivo:linha/token ou componente/estado | Baseline (hex/estilo/regra) | Atual (hex/estilo/regra) | Evidência | Resultado |
|---|---|---|---|---|---|
| MonoDracula/on | sample.ts: identificador | preencher pelo inspetor | preencher pelo inspetor | caminhos dos JSONs e screenshots | igual / diferença esperada / possível regressão / não testado |

Aceitar syntax highlighting somente quando todos os tokens amostrados mantiverem os estilos efetivamente aplicados entre versões, inclusive no caso semântico ligado com provedor presente. Toda diferença não explicada deve ser marcada como possível regressão, mesmo que TextMate isolado e dados dos provedores coincidam. Semântica ausente em TS/JS requer investigação, não aprovação por igualdade de resultados vazios.

As únicas diferenças visuais esperadas nesta entrega são a paleta dos botões secundários e a borda de agentes. Guias e componentes ligados às entradas inválidas devem permanecer visualmente iguais. Hover/foco continuam distinguíveis. A aprovação estrutural anterior não encerra os testes visuais, semânticos ou de versões antigas do VS Code.

Não execute a Etapa B durante esta comparação. Comentários e textos funcionais serão julgados separadamente segundo [visual-review.md](visual-review.md). Nenhuma proposta autoriza alteração de cor, regra TextMate ou configuração semântica dos temas.
