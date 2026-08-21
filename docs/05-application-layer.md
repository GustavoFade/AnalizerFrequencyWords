# 05 - Camada de Aplicacao

## Objetivo

Expor casos de uso independentes da UI e do driver SQLite, conectando dominio, extractors e repositorios por interfaces.

## Dependencias

`01-bootstrap.md` a `04-book-import.md` concluidos.

## Tarefas

- Criar o caso de uso `AddBook`.
- Criar consultas para listar palavras por frequencia global ou por livro.
- Criar consulta de palavras comuns entre livros.
- Criar consulta global e consultas filtradas por livro e por area.
- Definir DTOs de entrada e saida para a presentation.
- Incluir area nos DTOs de criacao e leitura de livros.
- Injetar extractors e repositorios por portas/interfaces.
- Mapear erros de arquivo, parsing, validacao e banco para erros de aplicacao.
- Manter a camada sem imports de Electron ou detalhes do SQLite.

## Verificacoes objetivas

- `grep -R 'class AddBook\|function addBook\|AddBook' src/application` confirma o caso de uso de importacao.
- `grep -R 'list.*frequency\|shared\|common' src/application` confirma os casos de consulta.
- `grep -R 'Input\|Output\|DTO' src/application` confirma DTOs de entrada e saida.
- `grep -R 'interface\|Port\|Repository\|Extractor' src/application` confirma as portas injetadas.
- `grep -R 'electron\|better-sqlite\|sqlite3' src/application` deve retornar nenhuma dependencia concreta de presentation/infrastructure.
- `grep -R 'ApplicationError\|InvalidFile\|ParseError' src/application` confirma o mapeamento de erros.

## TDD e verificacao

- Testar casos de uso com fakes ou mocks de portas.
- Testar sucesso, livro vazio, arquivo invalido, duplicidade e falha transacional.
- Testar ordenacao e frequencia retornadas para a UI.
- Testar que a consulta retorna todas as palavras e permite aplicar filtro de stop words sem alterar os dados persistidos.
- Testar consultas por livro e por area.
- Pular a observacao formal do red, implementar ate green e refatorar.
- Executar testes focados da aplicacao e todas as verificacoes anteriores.
- Executar tambem as verificacoes objetivas desta etapa.

## Conclusao

Os casos de uso podem ser executados por teste ou outra presentation sem conhecer Electron ou SQL.
