export interface WordFrequency {
  readonly word: string;
  readonly count: number;
}

export interface Book {
  readonly id?: string;
  readonly title: string;
  readonly sourceIdentifier: string;
  readonly subjectArea: string;
}

export function normalizeToken(rawToken: string): string | null {
  const token = rawToken.normalize('NFKC').toLocaleLowerCase('en-US');
  const normalized = token.replace(/^'+|'+$/g, '');

  return /^[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*$/u.test(normalized)
    ? normalized
    : null;
}

export function tokenize(text: string): string[] {
  return text
    .normalize('NFKC')
    .split(/[^\p{L}\p{N}']+/u)
    .map(normalizeToken)
    .filter((token): token is string => token !== null);
}

export function sortFrequencies(frequencies: ReadonlyMap<string, number>): WordFrequency[] {
  return [...frequencies.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((left, right) => right.count - left.count || left.word.localeCompare(right.word, 'en'));
}
