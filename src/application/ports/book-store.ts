import type { Book, WordFrequency } from '../../domain/word';

export interface BookStore {
  persistBook(book: Book, frequencies: readonly WordFrequency[]): void;
  listGlobalFrequencies(): WordFrequency[];
  listBookFrequencies(bookId: number): WordFrequency[];
  listAreaFrequencies(subjectArea: string): WordFrequency[];
  listSharedWords(): WordFrequency[];
}
