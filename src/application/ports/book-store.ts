import type { Book, WordFrequency } from '../../domain/word';

export interface BookSummary {
  readonly id: number;
  readonly title: string;
  readonly subjectArea: string;
}

export interface BookStore {
  hasSourceIdentifier(sourceIdentifier: string): boolean;
  persistBook(book: Book, frequencies: readonly WordFrequency[]): void;
  listGlobalFrequencies(): WordFrequency[];
  listBookFrequencies(bookId: number): WordFrequency[];
  listAreaFrequencies(subjectArea: string): WordFrequency[];
  listSharedWords(): WordFrequency[];
  listBooks(): BookSummary[];
  listSubjectAreas(): string[];
}
