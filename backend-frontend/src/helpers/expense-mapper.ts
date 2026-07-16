import { getCategoryTitles } from './category-helper';
import type { Category, Expense, ExpenseFormQuery, ExpenseRow } from 'src/types';

export {
  mapExpenseToRow,
  toExpenseFormQuery,
};

// -------------------------------------------------------------------
// Build the row object consumed by ExpensesTable from an API expense.
// dateStyle:
//   'day'  - date is just the day of month (month view on index page)
//   'full' - date is YYYY-MM-DD, with 'XX' as the day when it is null
//            (search results span multiple months)
// -------------------------------------------------------------------
function mapExpenseToRow(expense: Expense, categories: Category[], dateStyle: 'day' | 'full' = 'day'): ExpenseRow {
  const cat = getCategoryTitles(categories, expense.category);

  return {
    id: expense.id,
    day: expense.day,
    date: dateStyle === 'full' ? formatFullDate(expense.year, expense.month, expense.day) : expense.day,
    description: expense.description,
    details: expense.details,
    category: expense.category,
    categoryText: `${cat.parentCategoryTitle}: ${cat.categoryTitle}`,
    mainCategoryText: cat.parentCategoryTitle,
    subCategoryText: cat.categoryTitle,
    amountPaid: expense.amountPaid,
    amountReimbursed: expense.amountReimbursed,
    spent: (Number(expense.amountPaid) - Number(expense.amountReimbursed)).toFixed(2),
    recurring: expense.recurring,
  };
}

// -------------------------------------------------------------------
// Build the query object pushed to /new-expense and /edit-expense.
// It goes in the real URL (not masked), so the form survives a page
// reload — only the fields the form consumes, no derived ones.
// -------------------------------------------------------------------
function toExpenseFormQuery(row: ExpenseRow): ExpenseFormQuery {
  return {
    day: row.day ?? '',
    description: row.description,
    details: row.details || '',
    amountPaid: row.amountPaid,
    amountReimbursed: row.amountReimbursed,
    category: row.category,
    recurring: row.recurring,
  };
}

function formatFullDate(year: number, month: number, day: number | null): string {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = day !== null ? String(day).padStart(2, '0') : 'XX';

  return `${year}-${monthStr}-${dayStr}`;
}
