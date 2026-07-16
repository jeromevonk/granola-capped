// ---------------------------------------------------------------------
// Shared data shapes. These mirror what the API actually returns —
// note that Postgres numeric columns arrive as *strings* through pg,
// hence `string | number` on the money fields.
// ---------------------------------------------------------------------

export interface Category {
  id: number;
  parentId: number | null;
  title: string;
}

export interface CategoryTitles {
  parentCategoryTitle: string | undefined;
  categoryTitle: string | undefined;
}

/** An expense as returned by /api/expenses */
export interface Expense {
  id: number;
  year: number;
  month: number;
  day: number | null;
  description: string;
  details: string | null;
  category: number;
  recurring: boolean;
  amountPaid: string | number;
  amountReimbursed: string | number;
}

/** The row shape consumed by ExpensesTable (built by mapExpenseToRow) */
export interface ExpenseRow {
  id: number;
  day: number | null;
  /** day of month ('day' style) or YYYY-MM-DD ('full' style) */
  date: number | string | null;
  description: string;
  details: string | null;
  category: number;
  categoryText: string;
  mainCategoryText: string | undefined;
  subCategoryText: string | undefined;
  amountPaid: string | number;
  amountReimbursed: string | number;
  /** paid minus reimbursed, fixed to 2 decimals */
  spent: string;
  recurring: boolean;
}

/** The query-string payload pushed to /new-expense and /edit-expense */
export interface ExpenseFormQuery {
  day: number | string;
  description: string;
  details: string;
  amountPaid: string | number;
  amountReimbursed: string | number;
  category: number;
  recurring: boolean;
}

/** One point of /api/stats/year-evolution and month-evolution */
export interface EvolutionEntry {
  year: number;
  month?: number;
  amountSpent: string;
}

/** One point of /api/stats/category-report */
export interface CategoryReportEntry {
  year: number;
  month: number;
  category: number;
  amountSpent: string;
}
