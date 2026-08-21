# 06 - Interface Electron

## Objetivo

Implementar o formulario de importacao e a lista rolavel de palavras sem quebrar a separacao de camadas.

## Dependencias

`01-bootstrap.md` a `05-application-layer.md` concluidos.

## Tarefas

- Definir IPC entre main e renderer com canais tipados e superficie minima.
- Manter banco e casos de uso fora do renderer.
- Criar formulario para selecionar arquivo PDF/TXT e iniciar `AddBook`.
- Adicionar campo de area livre ao formulario.
- Exibir carregamento, sucesso, validacao e erros de importacao.
- Criar lista com rolagem e frequencia em ordem decrescente.
- Exibir livro, frequencia por livro e dados compartilhados quando aplicavel.
- Permitir selecionar visao global, livro ou area.
- Permitir ocultar stop words somente na visualizacao, mantendo todas as palavras persistidas.
- Tratar lista vazia e importacoes consecutivas.
- Configurar seguranca do Electron, incluindo preload e ausencia de acesso Node desnecessario.

## Verificacoes objetivas

- `grep -R 'ipcMain\|ipcRenderer\|contextBridge' src/presentation` confirma IPC via preload.
- `grep -R 'AddBook' src/presentation` confirma que o formulario usa o caso de uso, e nao SQL diretamente.
- `grep -R 'input.*file\|accept=.*pdf\|accept=.*txt' src/presentation` confirma selecao dos formatos aceitos.
- `grep -R 'loading\|error\|success' src/presentation` confirma os estados visuais da importacao.
- `grep -R 'overflow.*auto\|overflow-y.*auto\|scroll' src/presentation` confirma a lista rolavel.
- `grep -R 'frequency\|count' src/presentation` confirma a exibicao de frequencia.
- `grep -R 'area\|subject' src/presentation` confirma o campo e filtros por area.
- `grep -R 'stop\|filter' src/presentation` confirma filtro de stop words na UI.
- `grep -R 'nodeIntegration.*false\|contextIsolation.*true\|sandbox' src` confirma as configuracoes de seguranca esperadas.
- `grep -R 'Database\|sqlite\|SELECT\|INSERT' src/renderer` deve retornar nenhuma operacao de banco no renderer.

## TDD e verificacao

- Testar componentes, estados do formulario e renderizacao da lista.
- Testar adaptador IPC com casos de sucesso e erro.
- Pular a observacao formal do red, implementar ate green e refatorar.
- Executar testes focados da UI e todas as verificacoes anteriores.
- Fazer uma verificacao manual em desktop e viewport estreita.
- Executar tambem as verificacoes objetivas desta etapa e registrar o resultado do smoke test.

## Conclusao

O usuario consegue adicionar um livro e visualizar uma lista rolavel ordenada sem acesso direto da UI ao banco.
