import { describe, it, expect } from 'vitest';
import { formatCompactDate, getCustomDateString, parseDate } from 'src/helpers/date-helper';

describe('formatCompactDate', () => {
  it('converts YYYY-MM-DD to DD/MM/YY', () => {
    expect(formatCompactDate('2026-07-05')).toBe('05/07/26');
  });

  it('keeps the XX placeholder when the day does not matter', () => {
    expect(formatCompactDate('2026-07-XX')).toBe('XX/07/26');
  });
});

describe('parseDate', () => {
  it('parses dash and slash separated dates', () => {
    expect(parseDate('2026-07-05')).toEqual({ year: '2026', month: '07' });
    expect(parseDate('2026/07/05')).toEqual({ year: '2026', month: '07' });
  });
});

describe('getCustomDateString', () => {
  it('spells the month out on large screens and abbreviates on small', () => {
    expect(getCustomDateString(2026, 7, true)).toBe('July 2026');
    expect(getCustomDateString(2026, 7, false)).toBe('Jul 2026');
  });
});
