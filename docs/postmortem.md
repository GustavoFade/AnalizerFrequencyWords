# Postmortem: Analizer Frequency Words

## Resumo Executivo

Este documento registra os principais incidentes, decisões técnicas e aprendizados durante a implementação do **Analizer Frequency Words**, uma aplicação Electron para análise de frequência de palavras em livros em inglês (TXT/PDF). O projeto foi desenvolvido em 16 interações, passando por problemas de arquitetura, build, testes E2E e experiência do usuário.

**Resultado final:** Aplicação funcional com 21 testes unitários, teste E2E, CI no GitHub Actions, empacotamento Electron e arquitetura em camadas verificada por `dependency-cruiser`.

---

## 1. Não conformidade inicial com commits incrementais

### O que aconteceu
Na primeira interação, várias mudanças foram aplicadas em um único patch: bootstrap, domínio, documentação e configurações. O usuário interveio solicitando commits incrementais conforme os planos de implementação.

### Causa
Falha em seguir a regra de entrega do `AGENTS.md` e do `docs/README.md`, que exigem commits coerentes e buildáveis, um por responsabilidade.

### Correção
O histórico foi reorganizado em commits separados:
- `chore: bootstrap layered electron project`
- `feat: add incremental word frequency domain`
- `docs: record initial sqlite driver decision`

### Aprendizado
Commits incrementais não são apenas organização: são a principal forma de manter o histórico revisável, permitir `git bisect` e isolar falhas. A regra deve ser respeitada desde o primeiro arquivo criado.

---

## 2. Escolha do driver SQLite: tentativa frustrada com `better-sqlite3`

### O que aconteceu
O `package.json` inicial incluía `better-sqlite3` como dependência. Durante o `npm install`, a compilação nativa falhou porque o ambiente Windows não possuía os componentes C++ do Visual Studio e não havia prebuild para Node 24.

### Causa
`better-sqlite3` depende de addon nativo (`node-gyp`). Em ambientes Windows sem workload C++ instalado, a instalação exige compilação manual.

### Correção
O driver foi substituído por `sql.js`, que é SQLite compilado para WebAssembly e não requer addon nativo. A decisão foi documentada no `AGENTS.md` e em `docs/08-requirements-and-open-questions.md`.

### Aprendizado
Driver nativo deve ser validado no ambiente alvo antes de ser commitado. Quando o ambiente de build é incerto, preferir soluções puras JavaScript/WASM e isolar o driver atrás de portas de infraestrutura para facilitar substituição futura.

---

## 3. Build do renderer quebrando o Electron main process

### O que aconteceu
Ao tentar corrigir o carregamento do script renderer (inicialmente como CommonJS, gerando `exports is not defined` no renderer), o build foi alterado para compilar o renderer como ES module. Isso fez o TypeScript recompilar dependências transitivas (`domain/word.ts`, `application/frequency-query.ts`, `application/ports/book-store.ts`, `presentation/ipc-contract.ts`) e sobrescrever os arquivos CommonJS de `dist/` com ES modules. O Electron main process falhou ao iniciar com:

```
SyntaxError: Unexpected token 'export'
    at dist\domain\word.js:1
```

### Causa raiz
Dois tsconfig com o mesmo `outDir` (`dist/`) e dependências de tipos entre renderer e camadas internas. O `include` do tsconfig renderer não restringiu o TypeScript a não recompilar dependências transitivas.

### Tentativas intermediárias
- Criar `tsconfig.renderer.json` com `include` restrito.
- Usar `outDir` separado (`dist/presentation-esm`) e copiar os arquivos.
- Ambas mantinham dependências transitivas sendo recompiladas.

### Correção definitiva
O renderer passou a ser bundlado com `esbuild` em formato IIFE (`--format=iife`, `--platform=browser`). Isso:
- Elimina imports externos no arquivo final.
- Evita que o TypeScript recompile outros módulos.
- Mantém o HTML com `<script src="renderer.js">` convencional.
- Gera um único arquivo de ~5KB.

### Aprendizado
Usar `tsc` para gerar múltiplos formatos no mesmo `outDir` é arriscado. Renderer Electron deve ser tratado como um artefato frontend separado, idealmente bundlado. Ferramentas como `esbuild`, `vite` ou `webpack` são mais adequadas do que `tsc` para esse caso.

---

## 4. Seleção de arquivo não funcionava na UI

### O que aconteceu
O usuário relatou que ao adicionar um livro PDF pela interface, nada acontecia visualmente. A consulta direta no SQLite mostrou:

```sql
books: 0
words: 0
book_words: 0
```

### Causas
1. O `input type="file"` dependia de `webUtils.getPathForFile(file)`, que no Playwright/Electron pode falhar com File objects sintéticos.
2. Não havia feedback visual durante a importação.
3. O formulário podia ser submetido antes de `selectedFile` ser definido.

### Correção
- Adicionado botão de fallback `Choose with system dialog` via IPC `books:choose-file`.
- Removido `required` do input de arquivo para permitir o fluxo do diálogo.
- Adicionado progresso visual de chunks processados.
- Adicionado contador de livros importados.
- Atualização automática dos filtros após importação.

### Aprendizado
Interfaces de upload em Electron precisam de múltiplos caminhos de entrada e feedback constante. Nunca confiar que um único método de seleção funcionará em todos os ambientes.

---

## 5. Testes E2E falhando silenciosamente

### O que aconteceu
Durante a criação do teste E2E com Playwright:
- O clique no botão de seleção não disparava o listener.
- O script renderer não era carregado devido ao formato de módulo.
- O Electron não iniciava no `beforeAll`.

### Causas
- O renderer não estava sendo carregado por causa do erro de módulo ES descrito na seção 3.
- O mock do diálogo nativo precisava ser aplicado via `electronApp.evaluate` no main process.
- O banco de dados de teste precisava ser isolado em diretório temporário.

### Correção
- Após corrigir o build do renderer com esbuild, o script passou a carregar.
- O teste mocka `dialog.showOpenDialog` no main process.
- O teste usa `E2E_USER_DATA_DIR` para isolar o SQLite.
- O teste valida todo o happy path: seleção → importação → frequências visíveis.

### Aprendizado
Testes E2E em Electron exigem atenção a:
- Formato do script renderer.
- Isolamento do banco/dados do usuário.
- Mock de APIs nativas no main process.
- Feedback visual como forma de sincronização.

---

## 6. CI do GitHub Actions

### O que foi configurado
Workflow em `.github/workflows/ci.yml` com:
- Trigger em PRs para `main` e pushes em `main`.
- Jobs `test` (Jest, typecheck, lint, arquitetura) e `build`.
- Ubuntu latest, Node 24.19.0.

### Gap
O repositório foi pushado para GitHub, mas as proteções de branch (`test` e `build` como required status checks) não puderam ser configuradas via CLI porque o token/remote não tinha permissões suficientes. Ficou documentado em `docs/ci.md`.

### Aprendizado
CI é mais do que o workflow: a proteção de branch é o gate real. Documentar o que deve ser configurado manualmente no GitHub é tão importante quanto o arquivo YAML.

---

## Decisões técnicas importantes

| Decisão | Motivação |
|---------|-----------|
| `sql.js` ao invés de `better-sqlite3` | Compatibilidade com Windows/Node 24 sem addon nativo. |
| Arquitetura em 4 camadas | Separar domain/application/infrastructure/presentation. |
| `dependency-cruiser` | Verificar dependências entre camadas automaticamente. |
| Processamento incremental | TXT por stream, PDF página por página, análise por chunks. |
| Stop words como filtro de UI | Não remover palavras do banco. |
| `esbuild` para renderer | Evitar conflitos de formato de módulo. |

---

## Métricas finais

- **Interações:** 16
- **Testes unitários:** 21
- **Testes E2E:** 1 (happy path)
- **Cobertura arquitetural:** 24 módulos, 21 dependências, zero violações
- **Commits finais na main:** 17+
- **Build:** TypeScript + esbuild + Electron
- **Pacote:** `release/win-unpacked/frequency-words-analyzer.exe`

---

## Aprendizados gerais

1. **Ambiente importa:** validar instalação de dependências nativas no OS/Node alvo antes de commitar.
2. **Build frontend é diferente de build backend:** não usar `tsc` para gerar artefatos de renderer Electron; bundlers são mais seguros.
3. **Feedback de UI é essencial:** especialmente em operações longas como importação de PDF.
4. **Testes E2E revelam problemas que unitários não pegam:** carregamento de scripts, IPC, diálogos nativos.
5. **Commits incrementais salvam tempo:** facilitam revisão, bisect e rollback.
6. **Documentar decisões e limitações:** `AGENTS.md`, `docs/validation.md` e este postmortem são ativos do projeto.

---

## Ações preventivas recomendadas

1. Adicionar teste E2E para PDF escaneado (deve falhar com mensagem clara).
2. Adicionar teste E2E para importação duplicada.
3. Configurar required status checks `test` e `build` na branch `main` no GitHub.
4. Avaliar migração para `better-sqlite3` ou driver nativo se o empacotamento para outras plataformas exigir.
5. Adicionar Content Security Policy no HTML do renderer.
6. Considerar virtualização da lista de palavras para livros muito grandes.
