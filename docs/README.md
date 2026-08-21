# Planos de Implementacao

Os planos devem ser executados na ordem numerada. Cada etapa depende dos artefatos e contratos definidos na etapa anterior.

## Ordem

1. `01-bootstrap.md` - fundacao do projeto e arquitetura em camadas.
2. `02-domain-and-tokenization.md` - regras de palavras e frequencia.
3. `03-sqlite-persistence.md` - schema, transacoes e repositorios.
4. `04-book-import.md` - extracao e importacao de TXT/PDF.
5. `05-application-layer.md` - casos de uso e portas da aplicacao.
6. `06-electron-ui.md` - interface e comunicacao segura.
7. `07-integration-and-hardening.md` - integracao, falhas e verificacao final.

As decisoes funcionais e as perguntas que ainda bloqueiam detalhes de implementacao estao em `08-requirements-and-open-questions.md`.

## Fitness functions de arquitetura

As dependencias entre camadas devem ser verificadas automaticamente, e nao apenas por revisao manual. A ferramenta deve validar pelo menos ausencia de ciclos e estas direcoes: `domain` nao depende de `application`, `infrastructure` ou `presentation`; `application` nao depende de `infrastructure` ou `presentation`; `infrastructure` pode implementar portas de `application`/`domain`; `presentation` acessa a aplicacao por seus contratos.

A biblioteca escolhida foi `dependency-cruiser`. Opcoes pesquisadas:

- `dependency-cruiser`: analisa o grafo de imports, detecta ciclos e aplica regras configuradas; possui CLI, saidas para relatorio e integra facilmente ao script de verificacao. E a opcao mais direta para regras de dependencias entre pastas.
- `ArchUnitTS` (`archunit` no npm): permite escrever regras como testes TypeScript e integrar com Jest; oferece API fluente e regras customizadas, mas adiciona uma camada especifica de framework de arquitetura.
- `eslint-plugin-boundaries`: integra as regras ao ESLint ja planejado, classificando arquivos por camada e rejeitando imports proibidos; fornece feedback imediato, mas fica mais limitado a dependencias de modulos/imports.
- Fitness function propria com a API do TypeScript: nenhuma dependencia adicional e controle total sobre mensagens/regras, mas exige implementar e manter o analisador do grafo.

Qualquer opcao escolhida deve ter um teste de arquitetura com arvore valida e arvore invalida, e deve falhar o comando de verificacao quando uma importacao proibida for adicionada.

## TDD

Para cada comportamento, escrever o teste, implementar o minimo ate ele ficar verde e depois refatorar. A observacao formal da etapa red pode ser pulada, mas os testes devem existir antes ou junto da implementacao do comportamento.

As verificacoes de cada etapa devem ser executadas antes de iniciar a proxima.

## Processamento em streaming

A analise nao deve carregar o livro inteiro em memoria. O extractor TXT deve ler com `Readable`; o extractor PDF deve processar uma pagina por vez; a tokenizacao e agregacao devem consumir chunks incrementalmente. O fluxo deve respeitar backpressure quando houver escrita ou leitura assincrona.

## Regra de verificacao

Toda tarefa que nao for comprovada por um teste deve indicar uma evidencia objetiva. Exemplos: `test -f caminho/arquivo`, `grep -R "NomeEsperado" src`, consulta SQL sobre o schema, `npm run typecheck`, `npm run build` ou smoke test manual documentado.

## Entregas

Implementar e entregar em incrementos pequenos e coerentes. Cada commit deve conter uma unica preocupacao, evitar refatoracoes nao relacionadas e usar Conventional Commits, por exemplo `feat: add book import`, `fix: rollback failed import`, `test: cover tokenization`, `docs: clarify requirements` e `chore: configure eslint`.
