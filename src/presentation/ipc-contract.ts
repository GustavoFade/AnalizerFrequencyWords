import type { WordFrequency } from '../domain/word';

export interface AddBookRequest {
  readonly title: string;
  readonly sourceIdentifier: string;
  readonly subjectArea: string;
}

export interface BooksApi {
  chooseBookFile(): Promise<string | null>;
  addBook(request: AddBookRequest): Promise<void>;
  listGlobalFrequencies(): Promise<WordFrequency[]>;
}
