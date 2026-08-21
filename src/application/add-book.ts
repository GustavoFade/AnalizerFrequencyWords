import { IncrementalFrequencyAnalyzer } from '../domain/frequency-analyzer';
import type { Book } from '../domain/word';
import type { BookExtractor } from './ports/book-extractor';
import type { BookStore } from './ports/book-store';

export interface AddBookInput {
  readonly title: string;
  readonly sourceIdentifier: string;
  readonly subjectArea: string;
}

export class AddBook {
  constructor(
    private readonly extractor: BookExtractor,
    private readonly store: BookStore
  ) {}

  async execute(input: AddBookInput): Promise<void> {
    if (input.subjectArea.trim() === '') throw new Error('Subject area is required');
    if (this.store.hasSourceIdentifier(input.sourceIdentifier)) throw new Error('Book was already imported');

    const analyzer = new IncrementalFrequencyAnalyzer();
    for await (const chunk of this.extractor.extract(input.sourceIdentifier)) analyzer.addChunk(chunk);
    const frequencies = analyzer.finish();
    if (frequencies.length === 0) throw new Error('Book contains no readable text');

    const book: Book = {
      title: input.title,
      sourceIdentifier: input.sourceIdentifier,
      subjectArea: input.subjectArea.trim()
    };
    this.store.persistBook(book, frequencies);
  }
}
