import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { BooksApi } from './ipc-contract';

const api: BooksApi = {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  chooseBookFile: () => ipcRenderer.invoke('books:choose-file'),
  onImportProgress: (listener) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: { chunksProcessed: number }) => listener(progress);
    ipcRenderer.on('books:progress', handler);
    return () => ipcRenderer.removeListener('books:progress', handler);
  },
  addBook: (request) => ipcRenderer.invoke('books:add', request),
  listFrequencies: (query) => ipcRenderer.invoke('books:list-frequencies', query),
  listBooks: () => ipcRenderer.invoke('books:list-books'),
  listSubjectAreas: () => ipcRenderer.invoke('books:list-areas')
};

contextBridge.exposeInMainWorld('booksApi', api);
