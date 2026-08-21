declare module 'sql.js' {
  interface SqlJsDatabase {
    run(sql: string, params?: readonly unknown[]): void;
    exec(sql: string, params?: readonly unknown[]): Array<{
      columns: string[];
      values: unknown[][];
    }>;
    close(): void;
  }

  interface SqlJsStatic {
    Database: new (data?: Uint8Array) => SqlJsDatabase;
  }

  interface SqlJsOptions {
    locateFile?: (file: string) => string;
  }

  function initSqlJs(options?: SqlJsOptions): Promise<SqlJsStatic>;
  export default initSqlJs;
}
