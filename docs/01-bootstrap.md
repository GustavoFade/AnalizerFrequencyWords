# 01 - Bootstrap

## Objetivo

Criar a fundacao executavel do projeto Node.js, TypeScript e Electron, com Jest e arquitetura em camadas.

## Dependencias

Nenhuma. Esta e a primeira etapa.

## Tarefas

- Criar `package.json`, lockfile e scripts verificaveis.
- Configurar TypeScript, Jest, ESLint, lint, typecheck e build.
- Criar a configuracao do ESLint para arquivos TypeScript e renderer/main do Electron.
- Adicionar `dependency-cruiser` como dependencia de desenvolvimento para proteger as dependencias entre camadas.
- Definir as regras de dependencia entre `domain`, `application`, `infrastructure` e `presentation` antes de criar implementacoes que possam viola-las.
- Criar `.dependency-cruiser.cjs` e um script dedicado `test:architecture` ou `architecture`.
- Definir os pontos de entrada do processo principal e do renderer do Electron.
- Criar limites de camadas: `presentation`, `application`, `domain` e `infrastructure`.
- Definir a localizacao do banco SQLite local e de eventuais migrations.
- Confirmar a biblioteca de acesso ao SQLite antes de instala-la.
- Instalar `pdfjs-dist`, previamente aprovado, somente quando o extractor for implementado.
- Documentar versoes e comandos reais no `AGENTS.md` depois de valida-los.

## Verificacoes objetivas

- `test -f package.json && test -f package-lock.json` confirma os arquivos de projeto e lockfile.
- `grep -n '"test"\|"typecheck"\|"lint"\|"build"' package.json` confirma os scripts exigidos.
- `test -f tsconfig.json && test -f jest.config.*` confirma TypeScript e Jest configurados.
- `test -f eslint.config.* -o -f .eslintrc.*` confirma a configuracao do ESLint.
- `grep -n 'eslint' package.json` confirma a dependencia e o script de lint.
- `grep -n 'dependency-cruiser' package.json` confirma a dependencia aprovada.
- `test -f .dependency-cruiser.cjs -o -f .dependency-cruiser.js` confirma a configuracao do dependency-cruiser.
- `grep -R 'domain\|application\|infrastructure\|presentation' .dependency-cruiser.*` confirma que as quatro camadas aparecem nas regras.
- `grep -n 'architecture\|depcruise' package.json` confirma o script dedicado.
- Criar um fixture ou arquivo temporario com importacao proibida, executar o script de arquitetura e confirmar exit code diferente de zero; remover o fixture e confirmar exit code zero.
- `grep -R 'BrowserWindow\|app.whenReady' src` confirma o entrypoint do Electron.
- `test -d src/presentation && test -d src/application && test -d src/domain && test -d src/infrastructure` confirma as camadas.
- `grep -R 'sqlite\|database' src config` confirma a localizacao/configuracao do banco.
- `grep -n 'pdfjs-dist' package.json` confirma a dependencia aprovada quando o extractor for implementado.
- `grep -n 'npm run\|npx' AGENTS.md` confirma que os comandos documentados foram registrados somente depois da validacao.

## TDD e verificacao

- Criar um teste minimo que prove que o ambiente Jest funciona.
- Implementar a configuracao ate o teste ficar verde.
- Refatorar a configuracao para remover duplicacao.
- Executar teste focado, Jest completo, typecheck, lint e build.
- Executar o teste/script de fitness functions e confirmar que uma importacao proibida falha e uma arvore valida passa.
- Para itens estruturais, executar tambem todas as verificacoes objetivas acima.

## Conclusao

O projeto instala do zero, executa um teste, compila TypeScript, gera o build e abre o shell do Electron sem acessar banco ou dominio.
