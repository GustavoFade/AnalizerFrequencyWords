import { access, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

interface PersistentDatabase {
  run(sql: string, params?: readonly unknown[]): void;
  exec(sql: string, params?: readonly unknown[]): Array<{ columns: string[]; values: unknown[][] }>;
  export(): Uint8Array;
  close(): void;
}

interface SqlJsStatic {
  Database: new (data?: Uint8Array) => PersistentDatabase;
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  const require = createRequire(__filename) as (specifier: string) => (options?: unknown) => Promise<SqlJsStatic>;
  return require('sql.js/dist/sql-asm.js')();
}

export async function openPersistentDatabase(databasePath: string): Promise<PersistentDatabase> {
  const sql = await loadSqlJs();
  try {
    await access(databasePath);
    return new sql.Database(await readFile(databasePath));
  } catch {
    return new sql.Database();
  }
}

export async function savePersistentDatabase(databasePath: string, database: PersistentDatabase): Promise<void> {
  await writeFile(databasePath, database.export());
}
