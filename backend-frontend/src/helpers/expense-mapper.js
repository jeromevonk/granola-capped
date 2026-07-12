import { getCategoryTitles } from './category-helper';

export {
  mapExpenseToRow,
};

// -------------------------------------------------------------------
// Build the row object consumed by ExpensesTable from an API expense.
// dateStyle:
//   'day'  - date is just the day of month (month view on index page)
//   'full' - date is YYYY-MM-DD, with 'XX' as the day when it is null
//            (search results span multiple months)
// -------------------------------------------------------------------
function mapExpenseToRow(expense, categories, dateStyle = 'day') {
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
    spent: (expense.amountPaid - expense.amountReimbursed).toFixed(2),
    recurring: expense.recurring,
  };
}

function formatFullDate(year, month, day) {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = day !== null ? String(day).padStart(2, '0') : 'XX';

  return `${year}-${monthStr}-${dayStr}`;
}
