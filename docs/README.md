# Documentação permanente — MonoMin e MonoDracula

Documentação consolidada dos temas definitivos. As investigações e evidências anteriores estão preservadas no arquivo histórico externo verificado.

- [Decisões definitivas](design-decisions.md): arquitetura, syntax e valores visuais implementados.
- [Validação](validation.md): testes permanentes, execução reproduzível e limites da cobertura.
- [Índice histórico](history/archive-index.json): relatórios e comparadores, com caminhos internos e hashes no arquivo externo.
- [Registro do arquivo histórico](history/archive-record.json): localização, commit, tamanho e verificação.

O arquivo histórico contém todos os arquivos de `docs/` anteriores à preparação de limpeza, inclusive evidências ignoradas. Ele preserva caminhos `docs/...`; para consultar um relatório com suas imagens, extraia o conjunto em um diretório externo, mantendo a estrutura. Não basta extrair apenas o Markdown: comparadores e scripts também possuem referências relativas/dinâmicas.

O caminho local do backup é uma referência desta máquina, não uma dependência da extensão ou dos testes permanentes. Em outra máquina, forneça a localização do arquivo identificado por SHA-256 no registro. Não copie capturas e snapshots em massa para a documentação permanente.

Os temas e o manifesto 2.3.5 foram preservados durante a consolidação. O diretório `repository-cleanup-preparation/` permanece como material local de revisão, fora do conjunto permanente selecionado; não deve ser incluído indiscriminadamente no próximo commit.
