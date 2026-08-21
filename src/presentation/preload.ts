import { contextBridge, ipcRenderer } from 'electron';
import type { BooksApi } from './ipc-contract';

const api: BooksApi = {
  chooseBookFile: () => ipcRenderer.invoke('books:choose-file'),
  addBook: (request) => ipcRenderer.invoke('books:add', request),
  listFrequencies: (query) => ipcRenderer.invoke('books:list-frequencies', query),
  listBooks: () => ipcRenderer.invoke('books:list-books'),
  listSubjectAreas: () => ipcRenderer.invoke('books:list-areas')
};

contextBridge.exposeInMainWorld('booksApi', api);
