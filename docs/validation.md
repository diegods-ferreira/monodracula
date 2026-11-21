# Validação permanente

## Conjunto mínimo selecionado

| Teste | Verificações | Entradas |
|---|---|---|
| `tests/themes.test.cjs` | JSONC, duplicatas em todos os objetos, cores, 161 regras, igualdade completa de syntax e interface aprovada, presença/ausência semântica, ausência de include, comentários Dracula, manifesto e caminhos | Temas definitivos; fixtures `approved-themes.json`, `manifest.json`, `syntax-samples.json`; ícone |
| `tests/vsix.test.cjs` | ZIP legível, entradas únicas, manifesto e temas iguais aos arquivos definitivos, caminhos registrados, ícone e metadados VSIX, ausência da base antiga/docs; gate adicional de limpeza | Caminho de VSIX fornecido explicitamente, manifesto e temas definitivos |

Dependências diretas: Node >=22, `jsonc-parser@3.3.1`, `yauzl@3.4.0`, em um pacote privado em `tests/`. O manifesto da extensão não recebe scripts nem dependências. `tests/package-lock.json` fixa os pacotes e suas integridades, incluindo `pend@1.2.0`. O lockfile foi revisado e uma instalação limpa com `npm ci --ignore-scripts` foi executada na Fase 2, sem dependências globais de teste.

Os dois scripts foram preparados separadamente, sem migrar os scripts históricos. Seus efeitos foram inspecionados antes da execução: leem arquivos, descompactam o VSIX somente em memória e escrevem o resultado exclusivamente em stdout/stderr. Não geram VSIX, screenshots, snapshots ou relatórios; não executam Git, abrem VS Code, instalam extensões ou alteram configurações.

## Fixtures e aprovação

`approved-themes.json` contém os dois objetos completos aprovados, hashes de origem e HEAD de referência. Isso evita perder cores/estilos ao reduzir o histórico. A presença ou ausência de propriedades semânticas também participa da igualdade. Não há modo automático de atualizar esse fixture: uma alteração visual futura exige aprovação e revisão explícita do baseline.

`manifest.json` preserva o objeto e o SHA-256 do manifesto 2.3.6 com finais de linha normalizados para LF. `syntax-samples.json` preserva as seis fixtures pequenas já usadas (TypeScript, JavaScript, HTML, CSS, JSON e Markdown), extraídas do módulo de dados puro `primary-fill/fixtures.cjs`, inspecionado antes da leitura. A existência das fixtures não equivale a executar semantic highlighting.

## Execução

Use Node >=22. Instale as dependências no pacote privado de testes, sem modificar o manifesto da extensão:

```powershell
npm --prefix tests ci --ignore-scripts
```

Com as dependências instaladas:

```powershell
node --test tests/themes.test.cjs
$env:VSIX_FILE = 'CAMINHO-DO-PACOTE.vsix'
node --test tests/vsix.test.cjs
```

Sem `VSIX_FILE`, o teste de pacote fica explicitamente ignorado/pendente. O gate adicional após ajustar `.vscodeignore` é:

```powershell
$env:CLEAN_VSIX = '1'
node --test tests/vsix.test.cjs
```

O gate exige a lista exata de entradas do VSIX 2.3.6, incluindo o aviso MIT dos arquivos derivados do VS Code. Para gerar e testar um pacote local sem dependências de runtime, use:

```powershell
npm exec --yes --package=@vscode/vsce@4.1.1 -- vsce package --no-dependencies --out .artifacts/monodracula-2.3.6-dark-modern-validation.vsix
$env:VSIX_FILE = (Resolve-Path '.artifacts/monodracula-2.3.6-dark-modern-validation.vsix').Path
$env:CLEAN_VSIX = '1'
npm --prefix tests test
```

Os comandos do gerador, as fontes fixadas e o procedimento de promoção dos temas estão na [documentação da integração Dark Modern](experiments/dark-modern/README.md).

Na Fase 1, os scripts foram experimentados no diretório de propostas usando dependências já instaladas. Na Fase 2, os testes adotados foram executados com as dependências locais instaladas pelo lockfile, sem `NODE_PATH` ou caminhos pessoais. Sem `MONODRACULA_REPO`, eles resolvem a raiz pelo próprio diretório `tests/`.

## Testes históricos que não serão adotados diretamente

- `search-outline-opacity/check-final.cjs`: depende de baseline, `before/`, TypeScript da instalação pessoal, HEAD e hashes de arquivos externos; grava `final-validation.json`.
- `search-outline-opacity/package-check.cjs`: usa o helper ZIP de outra investigação com dependência absoluta; grava `package-inspection.json`.
- `search-outline-opacity/final-artifacts-check.cjs`: lê sessão, 36 capturas, snapshots e resultados de pixels; grava `artifacts-validation.json`.
- `dark-modern-design-system/check-syntax.cjs`: lê snapshots/provedores históricos e fixtures; grava `syntax-all.json` ou `syntax-on.json`.
- `theme-modernization/tokens.cjs`: lê engines/grammars de uma instalação específica e configurações pessoais; grava snapshots de tokens.
- `theme-modernization/audit.cjs`: usa a referência Dark Modern raiz, bundles e baseline antigos; cria diretórios e relatórios.

Nenhum desses scripts foi executado na limpeza. Continuam completos no arquivo externo, com suas dependências. Não se deve simplesmente copiá-los para CI ou executar preparadores sobre baselines preservados.

## Cobertura e limites

Os gates portáveis protegem a definição aprovada, não certificam cores efetivamente renderizadas, comportamento de provedores semânticos, IDs de cores registrados em toda versão do VS Code ou instalação funcional do VSIX. Abrir um ZIP e conferir seus componentes não equivale a instalar a extensão.

Após uma mudança funcional futura, a validação visual/semântica deverá usar ambiente isolado explicitamente versionado, as mesmas grammars/extensões e as seis fixtures em ON/OFF. Seleção, linha ativa, busca e estados compartilhados devem ser comparados em condições equivalentes. Essa etapa não será substituída por uma coleção permanente de milhares de snapshots; os registros anteriores ficam no [arquivo histórico](history/archive-index.json).

Na limpeza foram executados os gates estruturais e de pacote, sem gerar capturas ou snapshots visuais. Um VSIX local de validação foi gerado em `.artifacts/cleanup-phase2/` e conferido com o gate de pacote limpo. Não houve instalação em perfis pessoais nem nova validação visual/semântica no VS Code. A presença de 161 regras e a igualdade das definições não substituem a execução dos provedores semânticos.
