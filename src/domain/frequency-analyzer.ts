import { normalizeToken, sortFrequencies, type WordFrequency } from './word';

const TOKEN_BOUNDARY = /[^\p{L}\p{N}']+/u;

export class IncrementalFrequencyAnalyzer {
  private carry = '';
  private readonly counts = new Map<string, number>();

  addChunk(chunk: string): void {
    const text = this.carry + chunk;
    const parts = text.split(TOKEN_BOUNDARY);
    this.carry = parts.pop() ?? '';

    for (const part of parts) this.addToken(part);
  }

  finish(): WordFrequency[] {
    this.addToken(this.carry);
    this.carry = '';
    return sortFrequencies(this.counts);
  }

  private addToken(rawToken: string): void {
    const token = normalizeToken(rawToken);
    if (token !== null) this.counts.set(token, (this.counts.get(token) ?? 0) + 1);
  }
}

export function analyzeText(text: string): WordFrequency[] {
  const analyzer = new IncrementalFrequencyAnalyzer();
  analyzer.addChunk(text);
  return analyzer.finish();
}
