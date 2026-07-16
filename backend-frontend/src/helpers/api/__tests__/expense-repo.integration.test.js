import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import knexLib from 'knex';
import { expenseRepo } from 'src/helpers/api/expense-repo';
import { categoryRepo } from 'src/helpers/api/category-repo';

// ---------------------------------------------------------------------
// Integration tests against a real local Postgres (granola_test).
// Setup: database/setup_test_db.sh; run with `npm run test:integration`.
// ---------------------------------------------------------------------

// Safety: refuse to run against anything that isn't localhost
const CONN = process.env.PG_CONNECTION_STRING || '';
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(CONN)) {
  throw new Error('Integration tests only run against a localhost database');
}

// Direct connection for fixtures (users are not created via the repos)
const db = knexLib({ client: 'pg', connection: CONN });

let userA, userB;
let mainA, subA, subA2, subB;

const validExpense = (overrides = {}) => ({
  year: 2026,
  month: 7,
  day: 11,
  description: 'Groceries',
  details: 'weekly',
  amountPaid: 100,
  amountReimbursed: 0,
  category: subA,
  recurring: false,
  ...overrides,
});

beforeAll(async () => {
  await db('expense').del();
  await db('category').del();
  await db('users').del();

  [{ id: userA }, { id: userB }] = await db('users')
    .insert([
      { username: 'test-user-a', hash: Buffer.from('not-a-real-hash') },
      { username: 'test-user-b', hash: Buffer.from('not-a-real-hash') },
    ], ['id']);

  // Categories through the repo, exercising the parent-ownership check
  [{ id: mainA }] = await categoryRepo.createCategory(userA, null, 'Home');
  [{ id: subA }] = await categoryRepo.createCategory(userA, mainA, 'Rent');
  [{ id: subA2 }] = await categoryRepo.createCategory(userA, mainA, 'Cleaning');

  const [{ id: mainB }] = await categoryRepo.createCategory(userB, null, 'Food');
  [{ id: subB }] = await categoryRepo.createCategory(userB, mainB, 'Groceries');
});

afterAll(async () => {
  // users cascade to categories and expenses
  await db('users').del();
  await db.destroy();

  // the repo's own knex pool must be torn down or vitest hangs
  await globalThis.__knex?.destroy();
});

beforeEach(async () => {
  await db('expense').del();
});

describe('expense CRUD', () => {
  it('creates and reads back an expense with camelCase fields', async () => {
    const [created] = await expenseRepo.createExpense(userA, validExpense());

    expect(created).toMatchObject({
      year: 2026,
      month: 7,
      day: 11,
      description: 'Groceries',
      category: subA,
      recurring: false,
    });
    expect(Number(created.amountPaid)).toBe(100);
    expect(Number(created.amountReimbursed)).toBe(0);

    const list = await expenseRepo.getExpenses(userA, null, 2026);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
  });

  it('accepts null details (nullable by validation)', async () => {
    const [created] = await expenseRepo.createExpense(userA, validExpense({ details: null }));
    expect(created.details).toBeNull();
  });

  it('updates an expense', async () => {
    const [created] = await expenseRepo.createExpense(userA, validExpense());
    const [updated] = await expenseRepo.updateExpense(userA, created.id,
      validExpense({ description: 'Rent July', amountPaid: 1500 }));

    expect(updated.description).toBe('Rent July');
    expect(Number(updated.amountPaid)).toBe(1500);
  });

  it('does not update another user\'s expense', async () => {
    const [created] = await expenseRepo.createExpense(userA, validExpense());

    const updated = await expenseRepo.updateExpense(userB, created.id, validExpense({ category: subB }));
    expect(updated).toHaveLength(0); // no row matched user B + this id
  });

  it('deletes multiple expenses, reporting ids that did not match', async () => {
    const [e1] = await expenseRepo.createExpense(userA, validExpense());
    const [e2] = await expenseRepo.createExpense(userA, validExpense({ description: 'Other' }));

    const deleted = await expenseRepo.deleteExpenses(userA, [e1.id, e2.id, 999999]);
    expect(deleted.map(d => d.id).sort()).toEqual([e1.id, e2.id].sort());

    expect(await expenseRepo.getExpenses(userA, null, 2026)).toHaveLength(0);
  });
});

describe('category ownership (regression for the audit finding)', () => {
  it('rejects creating an expense in another user\'s category', async () => {
    await expect(expenseRepo.createExpense(userA, validExpense({ category: subB })))
      .rejects.toThrow(/category/i);
  });

  it('rejects updating an expense into another user\'s category', async () => {
    const [created] = await expenseRepo.createExpense(userA, validExpense());

    await expect(expenseRepo.updateExpense(userA, created.id, validExpense({ category: subB })))
      .rejects.toThrow(/category/i);
  });

  it('rejects a nonexistent category', async () => {
    await expect(expenseRepo.createExpense(userA, validExpense({ category: 999999 })))
      .rejects.toThrow(/category/i);
  });
});

describe('database CHECK constraints as last line of defense', () => {
  it('rejects amountReimbursed greater than amountPaid at the DB level', async () => {
    await expect(expenseRepo.createExpense(userA, validExpense({ amountPaid: 10, amountReimbursed: 20 })))
      .rejects.toThrow();
  });
});

describe('copyRecurringToNextMonth', () => {
  it('copies only recurring expenses to the next month', async () => {
    await expenseRepo.createExpense(userA, validExpense({ month: 5, recurring: true, description: 'Rent May' }));
    await expenseRepo.createExpense(userA, validExpense({ month: 5, recurring: false, description: 'One-off' }));

    const copied = await expenseRepo.copyRecurringToNextMonth(userA, 2026, 5, true);

    expect(copied).toHaveLength(1);
    expect(copied[0]).toMatchObject({ year: 2026, month: 6, description: 'Rent May', recurring: true });
    expect(Number(copied[0].amountPaid)).toBe(100);
  });

  it('crosses the year boundary: December -> January of next year', async () => {
    await expenseRepo.createExpense(userA, validExpense({ month: 12, recurring: true, description: 'Rent Dec' }));

    const copied = await expenseRepo.copyRecurringToNextMonth(userA, 2026, 12, true);

    expect(copied).toHaveLength(1);
    expect(copied[0]).toMatchObject({ year: 2027, month: 1 });
  });

  it('clears amounts when keepAmounts is false', async () => {
    await expenseRepo.createExpense(userA, validExpense({ month: 5, recurring: true, amountPaid: 80 }));

    const copied = await expenseRepo.copyRecurringToNextMonth(userA, 2026, 5, false);

    expect(Number(copied[0].amountPaid)).toBe(0);
    expect(Number(copied[0].amountReimbursed)).toBe(0);
  });
});

describe('searchExpenses', () => {
  it('matches description and details, case-insensitively, scoped to the user', async () => {
    await expenseRepo.createExpense(userA, validExpense({ description: 'Supermarket ABC' }));
    await expenseRepo.createExpense(userA, validExpense({ description: 'Pharmacy', details: 'abc vitamins' }));
    await expenseRepo.createExpense(userB, validExpense({ description: 'ABC store', category: subB }));

    const found = await expenseRepo.searchExpenses(userA, 'abc');
    expect(found).toHaveLength(2);
    expect(found.every(e => e.description !== 'ABC store')).toBe(true);
  });
});

describe('getYears', () => {
  it('returns the distinct years, ascending, as a plain array', async () => {
    await expenseRepo.createExpense(userA, validExpense({ year: 2024 }));
    await expenseRepo.createExpense(userA, validExpense({ year: 2022 }));
    await expenseRepo.createExpense(userA, validExpense({ year: 2024, description: 'Another' }));

    expect(await expenseRepo.getYears(userA)).toEqual([2022, 2024]);
  });
});
