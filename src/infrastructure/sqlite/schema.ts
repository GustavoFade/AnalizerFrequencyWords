export const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    source_identifier TEXT NOT NULL UNIQUE,
    subject_area TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    normalized_word TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS book_words (
    book_id INTEGER NOT NULL,
    word_id INTEGER NOT NULL,
    frequency INTEGER NOT NULL CHECK (frequency > 0),
    PRIMARY KEY (book_id, word_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
  );
`;
