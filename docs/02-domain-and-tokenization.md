# 02 - Dominio e Tokenizacao

## Objetivo

Implementar regras puras para normalizar texto, contar palavras e ordenar frequencias sem depender de Electron, SQLite ou arquivos.

## Dependencias

`01-bootstrap.md` concluido.

## Tarefas

- Definir o contrato de token normalizado para livros em ingles.
- Definir explicitamente case folding, pontuacao, apostrofos, hifens, numeros, espacos e tokens vazios.
- Implementar tokenizacao deterministica.
- Implementar agregacao de frequencia por livro.
- Implementar ordenacao por frequencia decrescente e desempate deterministico.
- Criar tipos de dominio para livro, palavra e frequencia por livro.
- Criar uma API incremental de analise que aceite chunks de texto e preserve apenas o estado necessario entre limites de chunk, inclusive tokens divididos entre dois chunks.

## Verificacoes objetivas

- `grep -R 'normalize\|token' src/domain test` confirma a API de normalizacao e tokenizacao.
- `grep -R 'frequency\|count' src/domain test` confirma a agregacao de frequencia.
- `grep -R 'Book\|Word' src/domain` confirma os tipos de dominio definidos.
- `grep -R 'electron\|sqlite\|fs' src/domain` deve retornar nenhuma dependencia de infraestrutura no dominio.
- `grep -R 'toSorted\|sort' src/domain` confirma que existe uma etapa explicita de ordenacao; validar o desempate no teste.
- `grep -R 'chunk\|stream\|carry\|remainder\|flush' src/domain test` confirma suporte a analise incremental e tokens parciais.
- O teste deve dividir uma palavra entre dois chunks e confirmar a mesma frequencia obtida com o texto inteiro.

## TDD e verificacao

- Escrever testes para normalizacao, pontuacao, repeticao, texto vazio e ordenacao.
- Pular a observacao formal do red; implementar ate os testes ficarem verdes.
- Refatorar mantendo as funcoes puras e sem acoplamento a infraestrutura.
- Executar o teste focado do dominio e depois as verificacoes da etapa 01.
- Executar tambem as verificacoes objetivas desta etapa.

## Conclusao

O mesmo texto sempre produz os mesmos tokens e frequencias, e palavras repetidas ficam prontas para reutilizacao por uma chave normalizada.
