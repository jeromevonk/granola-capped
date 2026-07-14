import { describe, it, expect } from 'vitest';
import { manipulateData } from 'src/helpers/chart-data-manipulation';

const opts = (evolutionDateType, hideEmptyMonths) => ({ evolutionDateType, hideEmptyMonths });

describe('manipulateData', () => {
  it('returns only the header row for empty input', () => {
    expect(manipulateData(opts('year', false), [])).toEqual([['Date', 'Spent']]);
    expect(manipulateData(opts('month', true), [])).toEqual([['Date', 'Spent']]);
  });

  it('fills year gaps with zero when hideEmptyMonths is false', () => {
    const input = [
      { year: 2020, amountSpent: '100.50' },
      { year: 2022, amountSpent: '200.00' },
    ];
    expect(manipulateData(opts('year', false), input)).toEqual([
      ['Date', 'Spent'],
      ['2020', 100.5],
      ['2021', 0],
      ['2022', 200],
    ]);
  });

  it('skips gaps when hideEmptyMonths is true', () => {
    const input = [
      { year: 2020, amountSpent: '100.50' },
      { year: 2022, amountSpent: '200.00' },
    ];
    expect(manipulateData(opts('year', true), input)).toEqual([
      ['Date', 'Spent'],
      ['2020', 100.5],
      ['2022', 200],
    ]);
  });

  it('fills months across a year boundary when hideEmptyMonths is false', () => {
    const input = [
      { year: 2021, month: 11, amountSpent: '10.00' },
      { year: 2022, month: 2, amountSpent: '20.00' },
    ];
    expect(manipulateData(opts('month', false), input)).toEqual([
      ['Date', 'Spent'],
      ['2021/11', 10],
      ['2021/12', 0],
      ['2022/1', 0],
      ['2022/2', 20],
    ]);
  });

  it('converts amounts to numbers', () => {
    const [, row] = manipulateData(opts('year', true), [{ year: 2024, amountSpent: '0.10' }]);
    expect(row[1]).toBeTypeOf('number');
    expect(row[1]).toBeCloseTo(0.1);
  });
});
