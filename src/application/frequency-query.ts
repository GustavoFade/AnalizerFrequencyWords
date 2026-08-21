import type { BookStore } from './ports/book-store';
import type { WordFrequency } from '../domain/word';

export type FrequencyQueryInput =
  | { readonly scope: 'global' }
  | { readonly scope: 'book'; readonly bookId: number }
  | { readonly scope: 'area'; readonly subjectArea: string }
  | { readonly scope: 'shared' };

export interface FrequencyRowDto {
  readonly word: string;
  readonly frequency: number;
}

export class ListFrequencies {
  constructor(private readonly store: BookStore) {}

  execute(query: FrequencyQueryInput): FrequencyRowDto[] {
    let rows: WordFrequency[];
    if (query.scope === 'book') rows = this.store.listBookFrequencies(query.bookId);
    else if (query.scope === 'area') rows = this.store.listAreaFrequencies(query.subjectArea);
    else if (query.scope === 'shared') rows = this.store.listSharedWords();
    else rows = this.store.listGlobalFrequencies();
    return rows.map(({ word, count }) => ({ word, frequency: count }));
  }
}
