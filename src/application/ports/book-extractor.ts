export interface BookExtractor {
  extract(sourcePath: string): AsyncIterable<string>;
}
