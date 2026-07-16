import { describe, it, expect } from 'vitest';
import { validateExpense, validateEvolution, validateCategoryReport, validateCopyRecurring } from 'src/helpers/api/validate';

// A fresh valid expense for each test to mutate
const validExpense = (overrides = {}) => ({
  year: 2026,
  month: 7,
  day: 11,
  description: 'Groceries',
  details: '',
  amountPaid: 100,
  amountReimbursed: 0,
  category: 1,
  recurring: false,
  ...overrides,
});

describe('validateExpense', () => {
  it('accepts a valid expense', () => {
    expect(validateExpense(validExpense()).isValid).toBe(true);
  });

  it('accepts day null (day does not matter)', () => {
    expect(validateExpense(validExpense({ day: null })).isValid).toBe(true);
  });

  it('accepts details null', () => {
    expect(validateExpense(validExpense({ details: null })).isValid).toBe(true);
  });

  it('accepts amountReimbursed equal to amountPaid', () => {
    expect(validateExpense(validExpense({ amountPaid: 50, amountReimbursed: 50 })).isValid).toBe(true);
  });

  it.each([
    ['year below range', { year: 2011 }],
    ['year above range', { year: 2051 }],
    ['year missing', { year: undefined }],
    ['month 0', { month: 0 }],
    ['month 13', { month: 13 }],
    ['day 0', { day: 0 }],
    ['day 32', { day: 32 }],
    ['day fractional', { day: 1.5 }],
    ['description missing', { description: undefined }],
    ['description too short', { description: 'ab' }],
    ['description too long', { description: 'x'.repeat(71) }],
    ['details undefined', { details: undefined }],
    ['details too long', { details: 'x'.repeat(71) }],
    ['amountPaid negative', { amountPaid: -1 }],
    ['amountPaid not a number', { amountPaid: 'abc' }],
    ['amountPaid boolean', { amountPaid: true }],
    ['amountPaid too big', { amountPaid: 100000 }],
    ['amountReimbursed negative', { amountReimbursed: -1 }],
    ['amountReimbursed greater than paid', { amountPaid: 10, amountReimbursed: 11 }],
    ['category missing', { category: undefined }],
    ['category 0', { category: 0 }],
    ['recurring string', { recurring: 'true' }],
    ['recurring missing', { recurring: undefined }],
  ])('rejects %s', (_label, overrides) => {
    const res = validateExpense(validExpense(overrides));
    expect(res.isValid).toBe(false);
    expect(res.msg).toBeTruthy();
  });
});

describe('validateCopyRecurring', () => {
  it('accepts a valid request', () => {
    expect(validateCopyRecurring({ year: 2026, month: 12, keepAmounts: false }).isValid).toBe(true);
  });

  it.each([
    ['missing year', { month: 1, keepAmounts: true }],
    ['month 13', { year: 2026, month: 13, keepAmounts: true }],
    ['keepAmounts not boolean', { year: 2026, month: 1, keepAmounts: 'yes' }],
  ])('rejects %s', (_label, params) => {
    expect(validateCopyRecurring(params).isValid).toBe(false);
  });
});

describe('validateEvolution', () => {
  it('accepts empty params (all categories)', () => {
    expect(validateEvolution({}).isValid).toBe(true);
  });

  it('accepts mainCategory alone', () => {
    expect(validateEvolution({ mainCategory: '3' }).isValid).toBe(true);
  });

  it('rejects mainCategory and subCategory together (mutually exclusive)', () => {
    expect(validateEvolution({ mainCategory: '3', subCategory: '7' }).isValid).toBe(false);
  });

  it('rejects non-integer mainCategory', () => {
    expect(validateEvolution({ mainCategory: '3.5' }).isValid).toBe(false);
  });

  it('rejects endYear before startYear', () => {
    expect(validateEvolution({ startYear: '2020', endYear: '2019' }).isValid).toBe(false);
  });

  it('rejects startYear before 2012', () => {
    expect(validateEvolution({ startYear: '2011' }).isValid).toBe(false);
  });
});

describe('validateCategoryReport', () => {
  it.each([['mainCategory'], ['subCategory'], ['12']])('accepts reportType %s', (reportType) => {
    expect(validateCategoryReport({ reportType }).isValid).toBe(true);
  });

  it('rejects an unknown reportType', () => {
    expect(validateCategoryReport({ reportType: 'bogus' }).isValid).toBe(false);
  });
});
