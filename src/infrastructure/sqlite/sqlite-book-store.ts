import type { BookStore } from '../../application/ports/book-store';
import type { Book, WordFrequency } from '../../domain/word';
import { SCHEMA } from './schema';

interface SqlDatabase {
  run(sql: string, params?: readonly unknown[]): void;
  exec(sql: string, params?: readonly unknown[]): Array<{ columns: string[]; values: unknown[][] }>;
}

export class SqliteBookStore implements BookStore {
  constructor(private readonly database: SqlDatabase) {
    this.database.run(SCHEMA);
  }

  hasSourceIdentifier(sourceIdentifier: string): boolean {
    return this.scalarNumber('SELECT COUNT(*) FROM books WHERE source_identifier = ?', [sourceIdentifier]) > 0;
  }

  persistBook(book: Book, frequencies: readonly WordFrequency[]): void {
    if (frequencies.length === 0) throw new Error('Cannot persist a book without words');

    this.database.run('BEGIN');
    try {
      this.database.run(
        'INSERT INTO books (title, source_identifier, subject_area) VALUES (?, ?, ?)',
        [book.title, book.sourceIdentifier, book.subjectArea]
      );
      const bookId = this.scalarNumber('SELECT last_insert_rowid()');

      for (const frequency of frequencies) {
        this.database.run(
          'INSERT INTO words (normalized_word) VALUES (?) ON CONFLICT(normalized_word) DO NOTHING',
          [frequency.word]
        );
        const wordId = this.scalarNumber('SELECT id FROM words WHERE normalized_word = ?', [frequency.word]);
        this.database.run(
          'INSERT INTO book_words (book_id, word_id, frequency) VALUES (?, ?, ?)',
          [bookId, wordId, frequency.count]
        );
      }
      this.database.run('COMMIT');
    } catch (error) {
      this.database.run('ROLLBACK');
      throw error;
    }
  }

  listGlobalFrequencies(): WordFrequency[] {
    return this.rows(
      `SELECT w.normalized_word, SUM(bw.frequency) AS frequency
       FROM words w JOIN book_words bw ON bw.word_id = w.id
       GROUP BY w.id ORDER BY frequency DESC, w.normalized_word ASC`
    );
  }

  listBookFrequencies(bookId: number): WordFrequency[] {
    return this.rows(
      `SELECT w.normalized_word, bw.frequency
       FROM words w JOIN book_words bw ON bw.word_id = w.id
       WHERE bw.book_id = ? ORDER BY bw.frequency DESC, w.normalized_word ASC`,
      [bookId]
    );
  }

  listAreaFrequencies(subjectArea: string): WordFrequency[] {
    return this.rows(
      `SELECT w.normalized_word, SUM(bw.frequency) AS frequency
       FROM words w JOIN book_words bw ON bw.word_id = w.id
       JOIN books b ON b.id = bw.book_id WHERE b.subject_area = ?
       GROUP BY w.id ORDER BY frequency DESC, w.normalized_word ASC`,
      [subjectArea]
    );
  }

  listSharedWords(): WordFrequency[] {
    return this.rows(
      `SELECT w.normalized_word, COUNT(DISTINCT bw.book_id) AS frequency
       FROM words w JOIN book_words bw ON bw.word_id = w.id
       GROUP BY w.id HAVING COUNT(DISTINCT bw.book_id) > 1
       ORDER BY frequency DESC, w.normalized_word ASC`
    );
  }

  private scalarNumber(sql: string, params?: readonly unknown[]): number {
    const value = this.database.exec(sql, params)[0]?.values[0]?.[0];
    if (typeof value !== 'number') throw new Error('Expected a numeric SQLite result');
    return value;
  }

  private rows(sql: string, params?: readonly unknown[]): WordFrequency[] {
    const row = this.database.exec(sql, params)[0];
    return (row?.values ?? []).map(([word, count]) => ({
      word: String(word),
      count: Number(count)
    }));
  }
}
