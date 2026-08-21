import initSqlJs from 'sql.js';
import { SqliteBookStore } from '../src/infrastructure/sqlite/sqlite-book-store';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openPersistentDatabase, savePersistentDatabase } from '../src/infrastructure/sqlite/persistent-database';

async function createStore(): Promise<SqliteBookStore> {
  const sql = await initSqlJs();
  return new SqliteBookStore(new sql.Database());
}

describe('SqliteBookStore', () => {
  it('reuses words and keeps frequency per book', async () => {
    const store = await createStore();
    store.persistBook(
      { title: 'One', sourceIdentifier: 'one.txt', subjectArea: 'fiction' },
      [{ word: 'new', count: 3 }, { word: 'book', count: 1 }]
    );
    store.persistBook(
      { title: 'Two', sourceIdentifier: 'two.txt', subjectArea: 'history' },
      [{ word: 'new', count: 1 }, { word: 'past', count: 2 }]
    );

    expect(store.listBookFrequencies(1)).toEqual([{ word: 'new', count: 3 }, { word: 'book', count: 1 }]);
    expect(store.listGlobalFrequencies()).toEqual([
      { word: 'new', count: 4 },
      { word: 'past', count: 2 },
      { word: 'book', count: 1 }
    ]);
    expect(store.listSharedWords()).toEqual([{ word: 'new', count: 2 }]);
    expect(store.listBooks()).toEqual([
      { id: 1, title: 'One', subjectArea: 'fiction' },
      { id: 2, title: 'Two', subjectArea: 'history' }
    ]);
    expect(store.listSubjectAreas()).toEqual(['fiction', 'history']);
  });

  it('filters frequencies by subject area', async () => {
    const store = await createStore();
    store.persistBook(
      { title: 'One', sourceIdentifier: 'one.txt', subjectArea: 'fiction' },
      [{ word: 'shared', count: 2 }]
    );
    store.persistBook(
      { title: 'Two', sourceIdentifier: 'two.txt', subjectArea: 'history' },
      [{ word: 'shared', count: 5 }]
    );

    expect(store.listAreaFrequencies('fiction')).toEqual([{ word: 'shared', count: 2 }]);
  });

  it('rolls back a failed import and blocks duplicate sources', async () => {
    const store = await createStore();
    expect(() =>
      store.persistBook(
        { title: 'Broken', sourceIdentifier: 'broken.txt', subjectArea: 'fiction' },
        [{ word: 'valid', count: 1 }, { word: 'invalid', count: 0 }]
      )
    ).toThrow();
    expect(store.listGlobalFrequencies()).toEqual([]);

    store.persistBook(
      { title: 'Valid', sourceIdentifier: 'same.txt', subjectArea: 'fiction' },
      [{ word: 'word', count: 1 }]
    );
    expect(() =>
      store.persistBook(
        { title: 'Duplicate', sourceIdentifier: 'same.txt', subjectArea: 'other' },
        [{ word: 'word', count: 2 }]
      )
    ).toThrow();
    expect(store.listGlobalFrequencies()).toEqual([{ word: 'word', count: 1 }]);
  });

  it('saves and reopens the SQLite database', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'frequency-db-'));
    const databasePath = join(directory, 'books.sqlite');
    const firstDatabase = await openPersistentDatabase(databasePath);
    const firstStore = new SqliteBookStore(firstDatabase);
    firstStore.persistBook(
      { title: 'Saved', sourceIdentifier: 'saved.txt', subjectArea: 'fiction' },
      [{ word: 'remembered', count: 2 }]
    );
    await savePersistentDatabase(databasePath, firstDatabase);

    const reopenedStore = new SqliteBookStore(await openPersistentDatabase(databasePath));
    expect(reopenedStore.listGlobalFrequencies()).toEqual([{ word: 'remembered', count: 2 }]);
    await rm(directory, { recursive: true, force: true });
  });
});
