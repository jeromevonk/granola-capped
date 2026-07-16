import { describe, it, expect } from 'vitest';
import { mapExpenseToRow, toExpenseFormQuery } from 'src/helpers/expense-mapper';

const categories = [
  { id: 1, parentId: null, title: 'Home' },
  { id: 2, parentId: 1, title: 'Rent' },
];

const expense = (overrides = {}) => ({
  id: 42,
  year: 2026,
  month: 7,
  day: 5,
  description: 'July rent',
  details: 'apartment',
  category: 2,
  recurring: true,
  amountPaid: '1500.00',
  amountReimbursed: '100.00',
  ...overrides,
});

describe('mapExpenseToRow', () => {
  it('maps fields and resolves category titles', () => {
    const row = mapExpenseToRow(expense(), categories);

    expect(row).toMatchObject({
      id: 42,
      day: 5,
      date: 5, // 'day' style: date is just the day of month
      description: 'July rent',
      category: 2,
      categoryText: 'Home: Rent',
      mainCategoryText: 'Home',
      subCategoryText: 'Rent',
      recurring: true,
    });
  });

  it('computes spent as paid minus reimbursed, with 2 decimals', () => {
    expect(mapExpenseToRow(expense(), categories).spent).toBe('1400.00');
  });

  it('formats a zero-padded full date when dateStyle is full', () => {
    expect(mapExpenseToRow(expense(), categories, 'full').date).toBe('2026-07-05');
  });

  it('uses XX as the day in full style when day is null', () => {
    expect(mapExpenseToRow(expense({ day: null }), categories, 'full').date).toBe('2026-07-XX');
  });
});

describe('toExpenseFormQuery', () => {
  it('keeps only the fields the expense form consumes', () => {
    const query = toExpenseFormQuery(mapExpenseToRow(expense(), categories));

    expect(query).toEqual({
      day: 5,
      description: 'July rent',
      details: 'apartment',
      amountPaid: '1500.00',
      amountReimbursed: '100.00',
      category: 2,
      recurring: true,
    });
    // derived/display fields must not leak into the URL
    expect(query).not.toHaveProperty('id');
    expect(query).not.toHaveProperty('categoryText');
    expect(query).not.toHaveProperty('spent');
  });

  it('normalizes null day and details to empty strings', () => {
    const query = toExpenseFormQuery({ ...expense(), day: null, details: null });
    expect(query.day).toBe('');
    expect(query.details).toBe('');
  });
});
