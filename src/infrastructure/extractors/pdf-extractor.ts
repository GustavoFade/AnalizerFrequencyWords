import { readFile } from 'node:fs/promises';
import type { BookExtractor } from '../../application/ports/book-extractor';
import { fileTypeFor } from './file-validation';

interface PdfTextContent {
  items: Array<{ str?: string }>;
}

interface PdfPage {
  getTextContent(): Promise<PdfTextContent>;
}

interface PdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPage>;
}

interface PdfJsModule {
  getDocument(options: { data: Uint8Array }): { promise: Promise<PdfDocument> };
}

type PdfLoader = () => Promise<PdfJsModule>;

const loadPdfJs: PdfLoader = async () => {
  const load = Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<PdfJsModule>;
  return load('pdfjs-dist/legacy/build/pdf.mjs');
};

export class PdfExtractor implements BookExtractor {
  constructor(private readonly loadPdf: PdfLoader = loadPdfJs) {}

  async *extract(sourcePath: string): AsyncIterable<string> {
    if (fileTypeFor(sourcePath) !== 'pdf') throw new Error('PdfExtractor accepts only .pdf files');

    const pdf = await this.loadPdf();
    const document = await pdf.getDocument({ data: new Uint8Array(await readFile(sourcePath)) }).promise;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const content = await document.getPage(pageNumber).then((page) => page.getTextContent());
      const text = content.items.map((item) => item.str ?? '').join(' ');
      if (text.length > 0) yield text;
    }
  }
}
