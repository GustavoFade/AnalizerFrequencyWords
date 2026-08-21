# 03 - Persistencia SQLite

## Objetivo

Persistir livros, palavras unicas e seus relacionamentos N:N com frequencia especifica por livro.

## Dependencias

`01-bootstrap.md` e `02-domain-and-tokenization.md` concluidos.

## Tarefas

- Usar um ORM ou query builder compativel com Electron e TypeScript; escolher e registrar a biblioteca concreta durante o bootstrap.
- Criar as tabelas `books`, `words` e `book_words`.
- Incluir na tabela `books` o nome/titulo, caminho ou identificador da origem e a area livre informada pelo usuario.
- Incluir a chave necessaria para bloquear a importacao duplicada depois que o criterio de identidade for decidido.
- Adicionar foreign keys, `UNIQUE` para a palavra normalizada e `UNIQUE(book_id, word_id)`.
- Guardar no relacionamento a contagem da palavra naquele livro.
- Criar migrations ou inicializacao idempotente do schema.
- Habilitar foreign keys e definir politica de exclusao.
- Criar repositorios de livros, palavras e relacionamentos.
- Criar uma unidade transacional para importar os dados persistidos.
- Criar consultas por livro, por frequencia e por palavras compartilhadas.
- Criar consultas por area e garantir que filtros por livro/area nao confundam frequencia global com frequencia especifica.

## Verificacoes objetivas

- `grep -R 'CREATE TABLE.*books\|CREATE TABLE.*words\|CREATE TABLE.*book_words' src migrations` confirma as tres tabelas.
- `grep -R 'FOREIGN KEY\|UNIQUE.*word\|UNIQUE.*book_id.*word_id' src migrations` confirma as restricoes obrigatorias.
- `grep -R 'frequency\|count' src/infrastructure` confirma a frequencia armazenada no relacionamento.
- `grep -R 'BEGIN\|COMMIT\|ROLLBACK\|transaction' src/infrastructure` confirma a unidade transacional.
- `grep -R 'BookRepository\|WordRepository\|BookWordRepository' src` confirma os repositorios separados.
- `grep -R 'shared\|common\|book_id' src/infrastructure` confirma consultas por livro e palavras compartilhadas.
- Executar o schema em um banco temporario e consultar `sqlite_master` para confirmar `books`, `words` e `book_words`.

## TDD e verificacao

- Testar criacao do schema e suas restricoes.
- Testar reutilizacao de uma palavra em dois livros.
- Testar frequencia diferente da mesma palavra em cada livro.
- Testar area do livro e bloqueio do criterio de duplicidade escolhido.
- Testar rollback quando uma insercao falhar.
- Pular a observacao formal do red, implementar ate green e refatorar.
- Executar testes de persistencia e depois as verificacoes anteriores.
- Executar tambem as verificacoes objetivas desta etapa.

## Conclusao

Uma palavra `new` possui uma unica linha em `words` e dois links em `book_words` quando aparece em dois livros.
