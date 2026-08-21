# 04 - Importacao de Livros

## Objetivo

Extrair texto de TXT/PDF, transforma-lo em frequencias e persistir uma importacao completa sem relacionamentos parciais.

## Dependencias

`01-bootstrap.md`, `02-domain-and-tokenization.md` e `03-sqlite-persistence.md` concluidos.

## Tarefas

- Criar uma interface de extractor que receba um caminho e produza chunks de texto, sem retornar o livro inteiro.
- Implementar TXT com `Readable`/`createReadStream`, encoding definido e consumo incremental.
- Implementar PDF com `pdfjs-dist`, percorrendo uma pagina por vez e emitindo os itens de texto como chunks antes de liberar a pagina.
- Validar extensao, existencia, leitura e arquivos sem texto.
- Receber e validar a area livre do livro antes de iniciar a importacao.
- Definir mensagens de erro para PDF escaneado sem camada de texto; nao adicionar OCR sem requisito aprovado.
- Criar o caso de importacao: extrair, tokenizar, agregar e persistir.
- Verificar o identificador de duplicidade antes de abrir a transacao e rejeitar um livro ja importado.
- Executar criacao do livro, reuso de palavras e links na mesma transacao.
- Garantir rollback para falha de leitura, parsing ou banco.
- Encadear extractor, tokenizador e agregador com `AsyncIterable`, `Readable` ou adaptador equivalente, respeitando backpressure.

## Verificacoes objetivas

- `grep -R 'interface.*Extractor\|Extractor' src/application src/domain src/infrastructure` confirma o contrato independente do formato.
- `grep -R 'Readable\|createReadStream\|AsyncIterable\|for await' src/infrastructure` confirma leitura TXT incremental.
- `grep -R 'node:fs\|readFileSync' src/infrastructure` deve retornar nenhuma leitura sincrona do livro completo.
- `grep -R 'pdfjs-dist\|getDocument\|getPage\|getTextContent' src/infrastructure` confirma processamento PDF por pagina.
- `grep -R 'chunk\|stream\|backpressure\|highWaterMark' src/application src/domain src/infrastructure` confirma o caminho incremental.
- `grep -R 'extension\|\.pdf\|\.txt\|ENOENT' src` confirma validacoes de formato e arquivo.
- `grep -R 'OCR\|scanned\|sem texto' src docs` confirma que a limitacao de PDF escaneado esta documentada.
- `grep -R 'transaction\|BEGIN\|ROLLBACK' src/application src/infrastructure` confirma importacao atomica.
- Executar uma importacao em banco temporario e consultar `books`, `words` e `book_words` antes e depois de uma falha forcada.

## TDD e verificacao

- Testar extractors com fixtures pequenas e casos de erro.
- Testar importacao TXT e PDF por meio da interface, usando doubles nos testes unitarios.
- Testar que varios chunks produzem o mesmo resultado que um unico chunk.
- Testar token dividido entre chunks e processamento de PDF com mais de uma pagina.
- Testar que falha no meio nao deixa livro, palavra ou link parcial.
- Testar area ausente/invalida e tentativa de importar o mesmo livro novamente.
- Pular a observacao formal do red, implementar ate green e refatorar.
- Executar testes focados de importacao e todas as verificacoes anteriores.
- Executar tambem as verificacoes objetivas desta etapa.
- Executar uma fixture grande ou um stream controlado e verificar que o codigo nao chama uma API que carregue o texto completo em uma unica string.

## Conclusao

Um livro valido e importado atomicamente; uma falha nao altera o estado persistido.
