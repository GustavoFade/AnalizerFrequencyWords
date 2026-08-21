import type { BookSummary } from '../application/ports/book-store';
import type { FrequencyRowDto } from '../application/frequency-query';

export interface AddBookRequest {
  readonly title: string;
  readonly sourceIdentifier: string;
  readonly subjectArea: string;
}

export type FrequencyQuery =
  | { readonly scope: 'global' }
  | { readonly scope: 'book'; readonly bookId: number }
  | { readonly scope: 'area'; readonly subjectArea: string }
  | { readonly scope: 'shared' };

export interface BooksApi {
  chooseBookFile(): Promise<string | null>;
  addBook(request: AddBookRequest): Promise<void>;
  listFrequencies(query: FrequencyQuery): Promise<FrequencyRowDto[]>;
  listBooks(): Promise<BookSummary[]>;
  listSubjectAreas(): Promise<string[]>;
}
