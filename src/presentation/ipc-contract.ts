import type { WordFrequency } from '../domain/word';
import type { BookSummary } from '../application/ports/book-store';

export interface AddBookRequest {
  readonly title: string;
  readonly sourceIdentifier: string;
  readonly subjectArea: string;
}

export type FrequencyQuery =
  | { readonly scope: 'global' }
  | { readonly scope: 'book'; readonly bookId: number }
  | { readonly scope: 'area'; readonly subjectArea: string };

export interface BooksApi {
  chooseBookFile(): Promise<string | null>;
  addBook(request: AddBookRequest): Promise<void>;
  listFrequencies(query: FrequencyQuery): Promise<WordFrequency[]>;
  listBooks(): Promise<BookSummary[]>;
  listSubjectAreas(): Promise<string[]>;
}
