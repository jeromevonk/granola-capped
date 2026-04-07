import { fetchWrapper } from 'src/helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/expenses`;

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

function createNewExpense(expense) {
  return fetchWrapper.post(baseUrl, expense);
}

function editExpense(expenseId, expense) {
  return fetchWrapper.put(`${baseUrl}/${expenseId}`, expense);
}

function deleteExpense(expenseId) {
  return fetchWrapper.delete(`${baseUrl}/${expenseId}`);
}

function deleteExpenses(expenseList) {
  return fetchWrapper.delete(baseUrl, expenseList);
}

function getExpenses(year) {
  return fetchWrapper.get(`${baseUrl}/${year}`);
}

function getYears() {
  return fetchWrapper.get(`${baseUrl}/years`);
}

function searchExpenses(search) {
  return fetchWrapper.get(`${baseUrl}?search=${encodeURIComponent(search)}`);
}

function copyRecurringToNextMonth(year, month, keepAmounts) {
  return fetchWrapper.post(`${baseUrl}/recurring`, { year, month, keepAmounts });
}


