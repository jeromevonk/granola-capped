import { fetchWrapper } from 'src/helpers';
import type { Expense } from 'src/types';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/expenses`;

/** Payload for creating/updating an expense (no id — it goes in the URL) */
export type ExpensePayload = Omit<Expense, 'id' | 'amountPaid' | 'amountReimbursed'> & {
  amountPaid: number | string;
  amountReimbursed: number | string;
};

export interface DeleteExpensesResponse {
  deleted: number[];
  failed: number[];
}

export const expenseService = {
  createNewExpense,
  editExpense,
  deleteExpense,
  deleteExpenses,
  getExpenses,
  getYears,
  searchExpenses,
  copyRecurringToNextMonth,
};

function createNewExpense(expense: ExpensePayload): Promise<Expense> {
  return fetchWrapper.post<Expense>(baseUrl, expense);
}

function editExpense(expenseId: number, expense: ExpensePayload): Promise<Expense> {
  return fetchWrapper.put<Expense>(`${baseUrl}/${expenseId}`, expense);
}

function deleteExpense(expenseId: number): Promise<number> {
  return fetchWrapper.delete<number>(`${baseUrl}/${expenseId}`);
}

function deleteExpenses(expenseList: number[]): Promise<DeleteExpensesResponse> {
  return fetchWrapper.delete<DeleteExpensesResponse>(baseUrl, expenseList);
}

function getExpenses(year: number): Promise<Expense[]> {
  return fetchWrapper.get<Expense[]>(`${baseUrl}/${year}`);
}

function getYears(): Promise<number[]> {
  return fetchWrapper.get<number[]>(`${baseUrl}/years`);
}

function searchExpenses(search: string): Promise<Expense[]> {
  return fetchWrapper.get<Expense[]>(`${baseUrl}?search=${encodeURIComponent(search)}`);
}

function copyRecurringToNextMonth(year: number, month: number, keepAmounts: boolean): Promise<Expense[]> {
  return fetchWrapper.post<Expense[]>(`${baseUrl}/recurring`, { year, month, keepAmounts });
}
