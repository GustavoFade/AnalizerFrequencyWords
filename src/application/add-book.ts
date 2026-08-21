import { IncrementalFrequencyAnalyzer } from '../domain/frequency-analyzer';
import type { Book } from '../domain/word';
import type { BookExtractor } from './ports/book-extractor';
import type { BookStore } from './ports/book-store';
import { DuplicateBookError, EmptyBookError, InvalidBookInputError } from './errors';

export interface AddBookInput {
  readonly title: string;
  readonly sourceIdentifier: string;
  readonly subjectArea: string;
}

export type ImportProgress = (chunksProcessed: number) => void;

export class AddBook {
  constructor(
    private readonly extractor: BookExtractor,
    private readonly store: BookStore,
    private readonly onProgress?: ImportProgress
  ) {}

  async execute(input: AddBookInput): Promise<void> {
    if (input.title.trim() === '' || input.sourceIdentifier.trim() === '' || input.subjectArea.trim() === '') {
      throw new InvalidBookInputError('Title, source and subject area are required');
    }
    if (this.store.hasSourceIdentifier(input.sourceIdentifier)) throw new DuplicateBookError();

    const analyzer = new IncrementalFrequencyAnalyzer();
    let chunksProcessed = 0;
    for await (const chunk of this.extractor.extract(input.sourceIdentifier)) {
      analyzer.addChunk(chunk);
      chunksProcessed += 1;
      this.onProgress?.(chunksProcessed);
    }
    const frequencies = analyzer.finish();
    if (frequencies.length === 0) throw new EmptyBookError();

    const book: Book = {
      title: input.title,
      sourceIdentifier: input.sourceIdentifier,
      subjectArea: input.subjectArea.trim()
    };
    this.store.persistBook(book, frequencies);
  }
}
