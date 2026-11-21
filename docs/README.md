# Documentação permanente — MonoMin e MonoDracula

Documentação dos temas oficiais da versão 2.3.6. Cada tema define 187 cores e 161 regras TextMate.

- As decisões vigentes incluem as cores aprovadas, os fallbacks e os limites de compatibilidade. [Decisões dos temas](design-decisions.md)
- Os testes permanentes verificam os temas, o manifesto e o conteúdo do VSIX. [Validação](validation.md)
- O experimento preserva a origem do Dark Modern 1.147.0 e o procedimento para reproduzir os temas oficiais. [Integração Dark Modern](experiments/dark-modern/README.md)

## Histórico

As investigações anteriores à integração 2.3.6 estão preservadas no arquivo histórico externo. Os registros da consolidação em 2.3.5 descrevem o estado daquela etapa. [Índice histórico](history/archive-index.json) · [Registro do arquivo histórico](history/archive-record.json)

O arquivo histórico contém todos os arquivos de `docs/` anteriores à preparação de limpeza, inclusive evidências ignoradas. Ele preserva caminhos `docs/...`; para consultar um relatório com suas imagens, extraia o conjunto em um diretório externo, mantendo a estrutura. Não basta extrair apenas o Markdown: comparadores e scripts também possuem referências relativas/dinâmicas.

O caminho local do backup é uma referência desta máquina, não uma dependência da extensão ou dos testes permanentes. Em outra máquina, forneça a localização do arquivo identificado por SHA-256 no registro. Não copie capturas e snapshots em massa para a documentação permanente.
