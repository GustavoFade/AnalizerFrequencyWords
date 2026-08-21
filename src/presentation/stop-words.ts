import type { FrequencyRowDto } from '../application/frequency-query';

export const DEFAULT_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is',
  'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'were', 'with'
]);

export function hideStopWords(rows: readonly FrequencyRowDto[], hide: boolean): FrequencyRowDto[] {
  return hide ? rows.filter(({ word }) => !DEFAULT_STOP_WORDS.has(word)) : [...rows];
}
