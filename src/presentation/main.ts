import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'node:path';
import { AddBook } from '../application/add-book';
import { SerialTaskQueue } from '../application/serial-task-queue';
import { PdfExtractor } from '../infrastructure/extractors/pdf-extractor';
import { fileTypeFor } from '../infrastructure/extractors/file-validation';
import { TxtExtractor } from '../infrastructure/extractors/txt-extractor';
import { SqliteBookStore } from '../infrastructure/sqlite/sqlite-book-store';
import { openPersistentDatabase, savePersistentDatabase } from '../infrastructure/sqlite/persistent-database';
import type { BooksApi, FrequencyQuery } from './ipc-contract';

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

function registerIpc(store: SqliteBookStore, save: () => Promise<void>, queue: SerialTaskQueue): void {
  ipcMain.handle('books:choose-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Books', extensions: ['txt', 'pdf'] }]
    });
    return result.canceled ? null : result.filePaths[0] ?? null;
  });

  ipcMain.handle('books:add', (_event, request: Parameters<BooksApi['addBook']>[0]) => queue.add(async () => {
    const extractor = fileTypeFor(request.sourceIdentifier) === 'pdf' ? new PdfExtractor() : new TxtExtractor();
    await new AddBook(extractor, store).execute(request);
    await save();
  }));

  ipcMain.handle('books:list-frequencies', (_event, query: FrequencyQuery) => {
    if (query.scope === 'book') return store.listBookFrequencies(query.bookId);
    if (query.scope === 'area') return store.listAreaFrequencies(query.subjectArea);
    return store.listGlobalFrequencies();
  });
  ipcMain.handle('books:list-books', () => store.listBooks());
  ipcMain.handle('books:list-areas', () => store.listSubjectAreas());
}

void app.whenReady().then(async () => {
  const databasePath = join(app.getPath('userData'), 'frequency-words.sqlite');
  const database = await openPersistentDatabase(databasePath);
  const store = new SqliteBookStore(database);
  const save = () => savePersistentDatabase(databasePath, database);
  const queue = new SerialTaskQueue();
  registerIpc(store, save, queue);
  let closing = false;
  app.on('before-quit', (event) => {
    if (closing) return;
    closing = true;
    event.preventDefault();
    void queue.idle().then(save).then(() => {
      database.close();
      app.exit();
    });
  });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
