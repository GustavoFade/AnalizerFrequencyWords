# 08 - Requisitos e Perguntas em Aberto

Este documento registra decisoes funcionais ja tomadas e pontos que precisam ser resolvidos antes de implementar a parte afetada. Ele nao altera a ordem dos planos de implementacao de `01` a `07`.

## Decisoes confirmadas

- A area/assunto e um campo livre preenchido no formulario de adicionar livro.
- Todas as palavras normalizadas e suas frequencias serao persistidas.
- Stop words podem ser ocultadas por filtro na UI, mas nao sao removidas durante a importacao.
- O usuario podera consultar a lista globalmente, por livro ou por area.
- Uma segunda importacao do mesmo livro deve ser bloqueada.
- A persistencia usara um ORM ou query builder para SQLite; a biblioteca concreta ainda precisa ser escolhida.
- `pdfjs-dist` sera usado para PDF digital; PDF escaneado sem camada de texto nao sera tratado por OCR nesta versao.
- A analise deve ser incremental: TXT por stream, PDF por pagina e dominio por chunks.

## Perguntas que bloqueiam detalhes

1. **Identidade de duplicidade:** bloquear pelo caminho canonico, pelo hash do conteudo ou pelos dois? Caminho bloqueia o mesmo arquivo movido de forma diferente; hash detecta copias identicas, mas exige ler os bytes do arquivo.
2. **Metadados obrigatorios:** o livro tera apenas arquivo e area, ou tambem titulo, autor, data e idioma? Se titulo nao for informado, ele sera derivado do nome do arquivo?
3. **Tokenizacao:** como tratar contracoes (`don't`), possessivos (`James's`), hifens (`state-of-the-art`), palavras quebradas por hifen de linha, numeros e caracteres Unicode?
4. **Areas:** cada livro tera uma unica area? Comparacoes devem ignorar maiusculas e espacos extras no nome da area?
5. **Frequencia global:** sera a soma das ocorrencias em todos os livros, a media por livro ou outra metrica? Para "palavras comuns", basta aparecer em dois livros ou deve haver um filtro de quantidade minima?
6. **Stop words:** qual lista inicial deve alimentar o filtro e o filtro deve ser global, por area ou configuravel pelo usuario?
7. **PDF:** deve preservar ordem de leitura em colunas, remover cabecalhos/rodapes repetidos e recompor palavras quebradas entre linhas?
8. **Memoria:** qual tamanho de livro e pico de memoria aceitaveis para validar o streaming? O mapa de frequencias de palavras unicas pode continuar em memoria ou deve ser persistido incrementalmente?
9. **ORM/query builder:** qual biblioteca sera adotada e como serao gerenciadas migrations e tipos gerados?
10. **Electron:** qual stack de renderer e empacotador serao usados, e quais sistemas operacionais precisam ser suportados?
11. **Escala da lista:** a lista precisa de paginacao ou virtualizacao para muitos milhares de palavras, ou uma lista rolavel simples e suficiente?
12. **Operacao:** o usuario podera cancelar uma importacao, excluir um livro ou corrigir seus metadados depois da importacao?
13. **Concorrencia:** importacoes simultaneas serao proibidas, enfileiradas ou permitidas com transacoes independentes?

## Regra

Uma pergunta em aberto deve ser resolvida antes do plano que depende dela. A decisao deve ser adicionada a este arquivo, aos testes afetados e ao schema/contratos correspondentes.
