import { IncrementalFrequencyAnalyzer, analyzeText } from '../src/domain/frequency-analyzer';
import { normalizeToken, sortFrequencies, tokenize } from '../src/domain/word';

describe('word normalization', () => {
  it('folds case and keeps internal apostrophes', () => {
    expect(normalizeToken("DON'T")).toBe("don't");
    expect(normalizeToken("'James's'")).toBe("james's");
  });

  it('rejects punctuation-only and splits hyphenated words', () => {
    expect(normalizeToken('...')).toBeNull();
    expect(tokenize('state-of-the-art')).toEqual(['state', 'of', 'the', 'art']);
  });
});

describe('frequency analysis', () => {
  it('aggregates and sorts by count, then word', () => {
    expect(analyzeText('Beta alpha beta ALPHA beta')).toEqual([
      { word: 'beta', count: 3 },
      { word: 'alpha', count: 2 }
    ]);
  });

  it('preserves a token split between chunks', () => {
    const analyzer = new IncrementalFrequencyAnalyzer();
    analyzer.addChunk('The fre');
    analyzer.addChunk('quency of the word');

    expect(analyzer.finish()).toEqual([
      { word: 'the', count: 2 },
      { word: 'frequency', count: 1 },
      { word: 'of', count: 1 },
      { word: 'word', count: 1 }
    ]);
  });

  it('handles empty input and deterministic ordering', () => {
    expect(analyzeText('')).toEqual([]);
    expect(sortFrequencies(new Map([['z', 1], ['a', 1]]))).toEqual([
      { word: 'a', count: 1 },
      { word: 'z', count: 1 }
    ]);
  });
});
