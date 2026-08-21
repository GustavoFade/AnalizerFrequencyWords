import { ListFrequencies } from '../src/application/frequency-query';
import type { BookStore } from '../src/application/ports/book-store';

function storeWithGlobal(): BookStore {
  return {
    hasSourceIdentifier: () => false,
    persistBook: () => undefined,
    listGlobalFrequencies: () => [{ word: 'new', count: 3 }],
    listBookFrequencies: () => [{ word: 'new', count: 2 }],
    listAreaFrequencies: () => [{ word: 'new', count: 1 }],
    listSharedWords: () => [{ word: 'shared', count: 2 }],
    listBooks: () => [],
    listSubjectAreas: () => []
  };
}

describe('ListFrequencies', () => {
  it('maps store counts to presentation DTOs for each scope', () => {
    const query = new ListFrequencies(storeWithGlobal());
    expect(query.execute({ scope: 'global' })).toEqual([{ word: 'new', frequency: 3 }]);
    expect(query.execute({ scope: 'book', bookId: 1 })).toEqual([{ word: 'new', frequency: 2 }]);
    expect(query.execute({ scope: 'area', subjectArea: 'fiction' })).toEqual([{ word: 'new', frequency: 1 }]);
    expect(query.execute({ scope: 'shared' })).toEqual([{ word: 'shared', frequency: 2 }]);
  });
});
