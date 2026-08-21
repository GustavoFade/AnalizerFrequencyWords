import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { BooksApi } from './ipc-contract';

const api: BooksApi = {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  addBook: (request) => ipcRenderer.invoke('books:add', request),
  listFrequencies: (query) => ipcRenderer.invoke('books:list-frequencies', query),
  listBooks: () => ipcRenderer.invoke('books:list-books'),
  listSubjectAreas: () => ipcRenderer.invoke('books:list-areas')
};

contextBridge.exposeInMainWorld('booksApi', api);
