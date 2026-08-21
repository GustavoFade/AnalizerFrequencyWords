import type { BooksApi } from './ipc-contract';

declare global {
  interface Window { booksApi: BooksApi; }
}

const form = document.querySelector<HTMLFormElement>('#add-book-form');
const fileInput = document.querySelector<HTMLInputElement>('#file');
const areaInput = document.querySelector<HTMLInputElement>('#subject-area');
const chooseButton = document.querySelector<HTMLButtonElement>('#choose-file');
const status = document.querySelector<HTMLElement>('#status');
const wordList = document.querySelector<HTMLUListElement>('#word-list');
let selectedFile: string | null = null;

function setStatus(message: string): void {
  if (status) status.textContent = message;
}

function renderWords(): void {
  void window.booksApi.listGlobalFrequencies().then((frequencies) => {
    if (!wordList) return;
    wordList.replaceChildren();
    if (frequencies.length === 0) {
      wordList.innerHTML = '<li>No books imported yet.</li>';
      return;
    }
    for (const frequency of frequencies) {
      const item = document.createElement('li');
      item.textContent = `${frequency.word} ${frequency.count}`;
      wordList.append(item);
    }
  }).catch(() => setStatus('Could not load frequencies.'));
}

chooseButton?.addEventListener('click', async () => {
  selectedFile = await window.booksApi.chooseBookFile();
  if (fileInput) fileInput.value = selectedFile ?? '';
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedFile || !areaInput?.value.trim()) {
    setStatus('Choose a book and enter a subject area.');
    return;
  }
  setStatus('Importing book...');
  try {
    await window.booksApi.addBook({
      title: selectedFile.split(/[\\/]/u).pop() ?? selectedFile,
      sourceIdentifier: selectedFile,
      subjectArea: areaInput.value
    });
    setStatus('Book imported successfully.');
    renderWords();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Could not import book.');
  }
});

renderWords();
