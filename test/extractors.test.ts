import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PdfExtractor } from '../src/infrastructure/extractors/pdf-extractor';
import { fileTypeFor } from '../src/infrastructure/extractors/file-validation';
import { TxtExtractor } from '../src/infrastructure/extractors/txt-extractor';

async function collect(chunks: AsyncIterable<string>): Promise<string[]> {
  const result: string[] = [];
  for await (const chunk of chunks) result.push(chunk);
  return result;
}

describe('book extractors', () => {
  it('reads TXT incrementally', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'frequency-words-'));
    const path = join(directory, 'book.txt');
    await writeFile(path, 'first chunk\nsecond chunk', 'utf8');

    const chunks = await collect(new TxtExtractor().extract(path));
    expect(chunks.join('')).toBe('first chunk\nsecond chunk');
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('processes PDF pages one at a time', async () => {
    const pages = [
      { items: [{ str: 'page one' }] },
      { items: [{ str: 'page two' }] }
    ];
    const extractor = new PdfExtractor(async () => ({
      getDocument: () => ({
        promise: Promise.resolve({
          numPages: pages.length,
          getPage: async (pageNumber) => ({ getTextContent: async () => pages[pageNumber - 1] })
        })
      })
    }));
    const directory = await mkdtemp(join(tmpdir(), 'frequency-words-'));
    const path = join(directory, 'book.pdf');
    await writeFile(path, 'fake pdf', 'utf8');

    expect(await collect(extractor.extract(path))).toEqual(['page one', 'page two']);
  });

  it('rejects unsupported formats', () => {
    expect(fileTypeFor('book.TXT')).toBe('txt');
    expect(() => fileTypeFor('book.docx')).toThrow(/txt|pdf/i);
  });
});
