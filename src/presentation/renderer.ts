import type { BooksApi, FrequencyQuery } from './ipc-contract';
import { hideStopWords } from './stop-words';

declare global {
  interface Window { booksApi: BooksApi; }
}

const form = document.querySelector<HTMLFormElement>('#add-book-form');
const fileInput = document.querySelector<HTMLInputElement>('#file');
const areaInput = document.querySelector<HTMLInputElement>('#subject-area');
const chooseButton = document.querySelector<HTMLButtonElement>('#choose-file');
const status = document.querySelector<HTMLElement>('#status');
const wordList = document.querySelector<HTMLUListElement>('#word-list');
const scopeSelect = document.querySelector<HTMLSelectElement>('#view-scope');
const filterLabel = document.querySelector<HTMLLabelElement>('#filter-label');
const filterSelect = document.querySelector<HTMLSelectElement>('#view-filter');
const stopWordsCheckbox = document.querySelector<HTMLInputElement>('#hide-stop-words');
let selectedFile: string | null = null;

function setStatus(message: string): void {
  if (status) status.textContent = message;
}

function currentQuery(): FrequencyQuery {
  if (scopeSelect?.value === 'book') return { scope: 'book', bookId: Number(filterSelect?.value) };
  if (scopeSelect?.value === 'area') return { scope: 'area', subjectArea: filterSelect?.value ?? '' };
  if (scopeSelect?.value === 'shared') return { scope: 'shared' };
  return { scope: 'global' };
}

function renderWords(): void {
  void window.booksApi.listFrequencies(currentQuery()).then((frequencies) => {
    const visibleFrequencies = hideStopWords(frequencies, stopWordsCheckbox?.checked ?? false);
    if (!wordList) return;
    wordList.replaceChildren();
    if (visibleFrequencies.length === 0) {
      wordList.innerHTML = '<li>No books imported yet.</li>';
      return;
    }
    for (const frequency of visibleFrequencies) {
      const item = document.createElement('li');
      item.textContent = `${frequency.word} ${frequency.frequency}`;
      wordList.append(item);
    }
  }).catch(() => setStatus('Could not load frequencies.'));
}

async function updateFilterOptions(): Promise<void> {
  if (!scopeSelect || !filterLabel || !filterSelect) return;
  if (scopeSelect.value === 'global' || scopeSelect.value === 'shared') {
    filterLabel.hidden = true;
    renderWords();
    return;
  }
  filterLabel.hidden = false;
  filterSelect.replaceChildren();
  if (scopeSelect.value === 'book') {
    for (const book of await window.booksApi.listBooks()) {
      filterSelect.add(new Option(`${book.title} (${book.subjectArea})`, String(book.id)));
    }
  } else {
    for (const area of await window.booksApi.listSubjectAreas()) filterSelect.add(new Option(area, area));
  }
  renderWords();
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

scopeSelect?.addEventListener('change', () => { void updateFilterOptions(); });
filterSelect?.addEventListener('change', renderWords);
stopWordsCheckbox?.addEventListener('change', renderWords);

void updateFilterOptions();
