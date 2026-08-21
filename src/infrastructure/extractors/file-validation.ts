import { extname } from 'node:path';

export type BookFileType = 'txt' | 'pdf';

export function fileTypeFor(sourcePath: string): BookFileType {
  const extension = extname(sourcePath).toLocaleLowerCase('en-US');
  if (extension === '.txt') return 'txt';
  if (extension === '.pdf') return 'pdf';
  throw new Error('Unsupported book format. Use a .txt or .pdf file.');
}
