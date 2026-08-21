import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'node:path';
import { AddBook } from '../application/add-book';
import { PdfExtractor } from '../infrastructure/extractors/pdf-extractor';
import { fileTypeFor } from '../infrastructure/extractors/file-validation';
import { TxtExtractor } from '../infrastructure/extractors/txt-extractor';
import { SqliteBookStore } from '../infrastructure/sqlite/sqlite-book-store';
import type { BooksApi } from './ipc-contract';

interface SqlJsModule {
  Database: new () => ConstructorParameters<typeof SqliteBookStore>[0];
}

async function loadSqlJs(): Promise<SqlJsModule> {
  const load = Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<SqlJsModule>;
  return load('sql.js');
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, 'preload.js')
    }
  });

  void window.loadFile(join(__dirname, 'index.html'));
}

function registerIpc(store: SqliteBookStore): void {
  ipcMain.handle('books:choose-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Books', extensions: ['txt', 'pdf'] }]
    });
    return result.canceled ? null : result.filePaths[0] ?? null;
  });

  ipcMain.handle('books:add', async (_event, request: Parameters<BooksApi['addBook']>[0]) => {
    const extractor = fileTypeFor(request.sourceIdentifier) === 'pdf' ? new PdfExtractor() : new TxtExtractor();
    await new AddBook(extractor, store).execute(request);
  });

  ipcMain.handle('books:list-global', () => store.listGlobalFrequencies());
}

void app.whenReady().then(async () => {
  const sql = await loadSqlJs();
  const store = new SqliteBookStore(new sql.Database());
  registerIpc(store);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
