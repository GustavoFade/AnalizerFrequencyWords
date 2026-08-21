import { hideStopWords } from '../src/presentation/stop-words';

describe('stop word presentation filter', () => {
  const rows = [
    { word: 'the', frequency: 10 },
    { word: 'book', frequency: 4 }
  ];

  it('hides stop words without changing the source rows', () => {
    expect(hideStopWords(rows, true)).toEqual([{ word: 'book', frequency: 4 }]);
    expect(hideStopWords(rows, false)).toEqual(rows);
    expect(rows).toHaveLength(2);
  });
});
