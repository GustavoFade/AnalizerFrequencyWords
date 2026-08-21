import { AddBook } from '../src/application/add-book';
import type { BookExtractor } from '../src/application/ports/book-extractor';
import type { BookStore } from '../src/application/ports/book-store';
import type { Book, WordFrequency } from '../src/domain/word';

function fakeStore(existing: string[] = []): BookStore & { persisted?: { book: Book; frequencies: WordFrequency[] } } {
  let persisted: { book: Book; frequencies: WordFrequency[] } | undefined;
  const store = {
    hasSourceIdentifier: (sourceIdentifier: string) => existing.includes(sourceIdentifier),
    persistBook: (book: Book, frequencies: readonly WordFrequency[]) => {
      store.persisted = { book, frequencies: [...frequencies] };
    },
    listGlobalFrequencies: () => [],
    listBookFrequencies: () => [],
    listAreaFrequencies: () => [],
    listSharedWords: () => [],
    listBooks: () => [],
    listSubjectAreas: () => [],
    persisted
  };
  return store;
}

function extractorFrom(...chunks: string[]): BookExtractor {
  return { extract: async function* () { for (const chunk of chunks) yield chunk; } };
}

describe('AddBook', () => {
  it('extracts, analyzes and persists incrementally', async () => {
    const store = fakeStore();
    await new AddBook(extractorFrom('New bo', 'ok new'), store).execute({
      title: 'Book', sourceIdentifier: 'book.txt', subjectArea: ' fiction '
    });

    expect(store.persisted).toEqual({
      book: { title: 'Book', sourceIdentifier: 'book.txt', subjectArea: 'fiction' },
      frequencies: [{ word: 'new', count: 2 }, { word: 'book', count: 1 }]
    });
  });

  it('rejects empty areas, empty books and duplicate sources', async () => {
    const store = fakeStore(['duplicate.txt']);
    await expect(new AddBook(extractorFrom('text'), store).execute({
      title: 'Book', sourceIdentifier: 'duplicate.txt', subjectArea: 'fiction'
    })).rejects.toThrow(/already/i);
    await expect(new AddBook(extractorFrom('text'), fakeStore()).execute({
      title: 'Book', sourceIdentifier: 'empty-area.txt', subjectArea: ' '
    })).rejects.toThrow(/area/i);
    await expect(new AddBook(extractorFrom('---'), fakeStore()).execute({
      title: 'Book', sourceIdentifier: 'empty.txt', subjectArea: 'fiction'
    })).rejects.toThrow(/text/i);
  });
});
