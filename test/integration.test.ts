import initSqlJs from 'sql.js';
import { AddBook } from '../src/application/add-book';
import { SqliteBookStore } from '../src/infrastructure/sqlite/sqlite-book-store';
import { TxtExtractor } from '../src/infrastructure/extractors/txt-extractor';
import { SCHEMA } from '../src/infrastructure/sqlite/schema';
import { join } from 'node:path';

describe('book import integration', () => {
  it('imports two TXT books and shares normalized words', async () => {
    const sql = await initSqlJs();
    const database = new sql.Database();
    database.run(SCHEMA);
    const store = new SqliteBookStore(database);
    const fixture = (name: string) => join(__dirname, 'fixtures', name);

    await new AddBook(new TxtExtractor(), store).execute({
      title: 'Book One', sourceIdentifier: fixture('book-one.txt'), subjectArea: 'fiction'
    });
    await new AddBook(new TxtExtractor(), store).execute({
      title: 'Book Two', sourceIdentifier: fixture('book-two.txt'), subjectArea: 'history'
    });

    expect(store.listSharedWords()).toEqual([
      { word: 'a', count: 2 },
      { word: 'common', count: 2 },
      { word: 'ideas', count: 2 },
      { word: 'language', count: 2 },
      { word: 'new', count: 2 },
      { word: 'share', count: 2 }
    ]);
    expect(store.listAreaFrequencies('history')).toContainEqual({ word: 'new', count: 1 });
    expect(database.exec('SELECT COUNT(*) FROM words')[0].values[0][0]).toBe(11);
  });
});
