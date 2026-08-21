# 07 - Integracao e Robustez

## Objetivo

Validar o fluxo completo e corrigir riscos de dados, desempenho e empacotamento antes de considerar a primeira versao utilizavel.

## Dependencias

`01-bootstrap.md` a `06-electron-ui.md` concluidos.

## Tarefas

- Criar fixtures de TXT e PDF digital representativas.
- Testar importacao completa de dois livros com palavras compartilhadas.
- Confirmar uma linha por palavra e um link por par livro-palavra.
- Testar consulta global, consulta por livro e intersecao entre livros.
- Testar rollback em cada falha relevante.
- Testar arquivo inexistente, extensao invalida, PDF sem texto e texto vazio.
- Avaliar memoria e tempo com livros grandes.
- Medir o pico de memoria durante a analise de um livro grande e registrar o resultado; o pipeline deve processar chunks/paginas sem montar uma string com o livro completo.
- Verificar fechamento seguro do banco e concorrencia de importacoes.
- Validar build e empacotamento do Electron em ambiente limpo.
- Atualizar `AGENTS.md` somente com comandos confirmados pela configuracao final.

## Verificacoes objetivas

- `test -f test/fixtures/book-one.txt && test -f test/fixtures/book-two.txt && test -f test/fixtures/book.pdf` confirma fixtures representativas.
- `grep -R 'book-one\|book-two\|shared' test` confirma o cenario de dois livros com palavras comuns.
- Executar `SELECT word, COUNT(*) FROM words GROUP BY word HAVING COUNT(*) > 1` e esperar zero linhas.
- Executar `SELECT book_id, word_id, COUNT(*) FROM book_words GROUP BY book_id, word_id HAVING COUNT(*) > 1` e esperar zero linhas.
- Executar as consultas de frequencia e intersecao e comparar os resultados com as fixtures conhecidas.
- Executar um teste de falha forcada e consultar as tres tabelas; o estado deve ser igual ao estado anterior.
- `grep -R 'performance\|memory\|concurrency' test docs` confirma que limites e resultado da avaliacao foram registrados.
- `grep -R 'createReadStream\|Readable\|AsyncIterable\|for await\|getPage' src` confirma o caminho de streaming no fluxo integrado.
- Executar um teste de memoria com fixture grande e comparar o pico contra a versao que acumula texto; registrar o limite aceito e o resultado.
- `grep -R 'close\|destroy\|before-quit' src` confirma fechamento coordenado do banco e do Electron.
- Executar o build em uma pasta limpa e confirmar que o artefato empacotado existe.
- `grep -n 'npm run\|npx' AGENTS.md` confirma que os comandos finais foram documentados apos serem executados.

## TDD e verificacao

- Adicionar testes de integracao aos comportamentos que atravessam camadas.
- Pular a observacao formal do red, implementar ate green e refatorar.
- Executar na ordem: teste focado, Jest completo, typecheck, lint e build.
- Fazer smoke test manual do Electron depois do build.
- Executar tambem todas as verificacoes objetivas desta etapa e anexar os resultados ao registro de validacao do projeto.

## Conclusao

O fluxo adicionar livro -> extrair -> contar -> persistir -> consultar -> exibir funciona com dados reais e falhas nao corrompem o banco.
