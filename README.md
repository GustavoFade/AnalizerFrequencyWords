# Analizer Frequency Words

Aplicação desktop para analisar a frequência de palavras em livros em inglês nos formatos TXT e PDF.

O sistema extrai o texto de forma incremental, normaliza os tokens, agrupa as ocorrências por frequência e persiste os resultados em SQLite. Palavras iguais são reutilizadas entre livros, permitindo comparar livros, áreas de assunto e palavras compartilhadas.

## Funcionalidades

- Importação de livros TXT e PDF digital.
- Leitura incremental de arquivos TXT.
- Extração de PDF página por página com `pdfjs-dist`.
- Normalização de caixa, Unicode, pontuação e apostrofos internos.
- Frequência global, por livro, por área e palavras compartilhadas.
- Filtro visual de stop words sem removê-las do banco.
- Bloqueio de importação duplicada pelo identificador da origem.
- Persistência local em SQLite via `sql.js`.
- Interface Electron com `contextIsolation`, `sandbox` e `nodeIntegration: false`.

PDFs escaneados sem camada de texto não são processados nesta versão, pois OCR está fora do escopo atual.

## Stack

- Node.js 24.19.0
- TypeScript
- Electron
- SQLite via `sql.js`
- Jest e `ts-jest`
- ESLint
- `dependency-cruiser`
- `electron-builder`

## Arquitetura

O código está organizado em camadas:

- `src/domain`: normalização, tokenização e agregação de frequências.
- `src/application`: casos de uso, DTOs, erros e portas.
- `src/infrastructure`: SQLite e extractors TXT/PDF.
- `src/presentation`: Electron, preload, IPC e renderer.

As dependências entre camadas são verificadas por `dependency-cruiser`.

## Instalação

```bash
npm install
```

## Comandos Úteis

```bash
# Abrir o shell de desenvolvimento do Electron
npm run dev

# Executar todos os testes
npm test

# Executar o teste inicial do bootstrap
npm run test:focused

# Verificar tipos
npm run typecheck

# Executar lint
npm run lint

# Verificar regras arquiteturais
npm run test:architecture

# Compilar a aplicação
npm run build

# Medir o processamento incremental
npm run measure:streaming

# Gerar o pacote Electron para o ambiente atual
npm run package
```

O pacote de desenvolvimento é gerado em `release/win-unpacked` e o banco local é salvo no diretório de dados do Electron.

## CI

O workflow `.github/workflows/ci.yml` executa no Ubuntu em:

- Pull requests direcionados a `main`.
- Pushes para `main`.

Os jobs `test` e `build` devem ser configurados como required status checks na proteção da branch `main` para impedir merges com falhas. Detalhes adicionais estão em [`docs/ci.md`](docs/ci.md).

## Documentação

Os planos de implementação estão em [`docs/README.md`](docs/README.md). Evidências de validação e limitações conhecidas estão em [`docs/validation.md`](docs/validation.md).
