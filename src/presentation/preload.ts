import { contextBridge, ipcRenderer } from 'electron';
import type { BooksApi } from './ipc-contract';

const api: BooksApi = {
  chooseBookFile: () => ipcRenderer.invoke('books:choose-file'),
  addBook: (request) => ipcRenderer.invoke('books:add', request),
  listGlobalFrequencies: () => ipcRenderer.invoke('books:list-global')
};

contextBridge.exposeInMainWorld('booksApi', api);
