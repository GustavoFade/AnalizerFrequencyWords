import { createReadStream } from 'node:fs';
import type { BookExtractor } from '../../application/ports/book-extractor';
import { fileTypeFor } from './file-validation';

export class TxtExtractor implements BookExtractor {
  async *extract(sourcePath: string): AsyncIterable<string> {
    if (fileTypeFor(sourcePath) !== 'txt') throw new Error('TxtExtractor accepts only .txt files');

    const stream = createReadStream(sourcePath, {
      encoding: 'utf8',
      highWaterMark: 64 * 1024
    });
    for await (const chunk of stream) yield typeof chunk === 'string' ? chunk : chunk.toString('utf8');
  }
}
