import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api barrel so importing expense-repo doesn't pull in the real
// knex pool (postgresql-repo) or the jwt middleware
vi.mock('src/helpers/api', () => ({
  postgresqlRepo: {
    categoryExistsForUser: vi.fn(),
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
  },
}));

import { postgresqlRepo } from 'src/helpers/api';
import { expenseRepo } from 'src/helpers/api/expense-repo';

const USER_A = 1;
const CATEGORY_OF_USER_B = 42;
const OWN_CATEGORY = 7;

const expenseWithCategory = (category) => ({
  year: 2026,
  month: 7,
  day: 11,
  description: 'Groceries',
  details: '',
  amountPaid: 100,
  amountReimbursed: 0,
  category,
  recurring: false,
});

describe('expense category ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createExpense rejects a category the user does not own', async () => {
    postgresqlRepo.categoryExistsForUser.mockResolvedValue(false);

    await expect(expenseRepo.createExpense(USER_A, expenseWithCategory(CATEGORY_OF_USER_B)))
      .rejects.toThrow(/category/i);

    expect(postgresqlRepo.categoryExistsForUser).toHaveBeenCalledWith(USER_A, CATEGORY_OF_USER_B);
    expect(postgresqlRepo.createExpense).not.toHaveBeenCalled();
  });

  it('updateExpense rejects a category the user does not own', async () => {
    postgresqlRepo.categoryExistsForUser.mockResolvedValue(false);

    await expect(expenseRepo.updateExpense(USER_A, 99, expenseWithCategory(CATEGORY_OF_USER_B)))
      .rejects.toThrow(/category/i);

    expect(postgresqlRepo.updateExpense).not.toHaveBeenCalled();
  });

  it('createExpense goes through when the category belongs to the user', async () => {
    postgresqlRepo.categoryExistsForUser.mockResolvedValue(true);
    postgresqlRepo.createExpense.mockResolvedValue([{ id: 1 }]);

    const expense = expenseWithCategory(OWN_CATEGORY);
    await expect(expenseRepo.createExpense(USER_A, expense)).resolves.toEqual([{ id: 1 }]);

    expect(postgresqlRepo.createExpense).toHaveBeenCalledWith(USER_A, expense);
  });

  it('updateExpense goes through when the category belongs to the user', async () => {
    postgresqlRepo.categoryExistsForUser.mockResolvedValue(true);
    postgresqlRepo.updateExpense.mockResolvedValue([{ id: 99 }]);

    const expense = expenseWithCategory(OWN_CATEGORY);
    await expect(expenseRepo.updateExpense(USER_A, 99, expense)).resolves.toEqual([{ id: 99 }]);

    expect(postgresqlRepo.updateExpense).toHaveBeenCalledWith(USER_A, 99, expense);
  });
});
