export const postgresqlRepo = {
  getCategories,
  createCategory,
  editCategory,
  deleteCategory,
  findUser,
  deleteUser,
  getExpenses,
  getYears,
  searchExpenses,
  createExpense,
  copyRecurringToNextMonth,
  updateExpense,
  deleteExpense,
  deleteExpenses,
  getEvolutionPerYear,
  getEvolutionPerMonth,
  getMainCategoryReportByYear,
  getSubCategoryReportByYear,
};

const AIVEN_CA_CERT = `
-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUQV1M8z8RnEni4Od3sSYa31lFsB4wDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZDEwOGQ1YmYtY2Q5MS00ZDRmLThhYzMtNWRjYzM2Zjcx
OGYyIFByb2plY3QgQ0EwHhcNMjQwOTEyMTgxNTE1WhcNMzQwOTEwMTgxNTE1WjA6
MTgwNgYDVQQDDC9kMTA4ZDViZi1jZDkxLTRkNGYtOGFjMy01ZGNjMzZmNzE4ZjIg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKCg35Gf
evlqr8H63hPOnkGCSvlVnR7JGVKtAD+HPgMBl1sOofdJ7NqGDdcTyuwTVhhCo5Jb
ZbzPvD5FtdQhyl5r4ZV/gd4VBgIOk7Qsl+lFXAcge6+US7frGmTL634B/JyAnILW
tQcq1OI5rjClCEP/QO52w25urjqvC2vFBIbdPkLqMnL9jOWjbmcSRD8/PdOR29wL
6jypq93XjTOiBYUBD6lm5WWHWZFgFCcKOztJ3JqhDu45/Vn0W5oQRzSX4cWXLWO2
N57syeDsceXhit8zcEdQXmC6DIKf5h/cgUnFdO+jrmAo+8h/JbsFffwvmomwxWo7
TQujJyT1LVMYWO+3SE3LVNQRGOmrAlHTG4A7Jmq90Dq33em806rFwxWFGJChy0j2
7Z9VckiopudGzDZ4jkwONPU0jwZTtSuI2xKkNRmrtO/3Ih8WGUYCNEL+mWa+eaJD
O10AB6qFj6mllZ2p3aj5hLrNT7W6FYyzPwjX8ZvyJjNOoG0k1rp1zLeQxwIDAQAB
oz8wPTAdBgNVHQ4EFgQU6fQkggz3NqBSSldoxsquLESXgoEwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAEPqmPDwlSSEqxt6
voQi18ciD2oG7WM0WFOZvtYxFQsLbI3YkSZvAVZu5GUicmbDh9iIF2NH/1xMvUww
wl6uJxXf7oAefmyFLRpkTbWyh3jrETPLy4aAXgO3EaFeNgVTTPWoUj92qg78Ywad
50IfNNVqGDfk/e6rlU2q4Qj961PzJu8xY7FXhPPKMS0htJVc4mHwoCp2MDTGUiOT
M2UVb9WzAshnZgiBNHNxbEG/2g4ZvNPV0LrgRhmXbqiIC8JXXSaJYvw+rRwEdKeY
SB3AXNscpY8MhRmB35ojejzuea8t6nP8uyLTEjqpOxE7ZawkiO1LQffoz+6tlXl2
AYR3SPIV//EpnAFZ1fMRCON9nStuzOUELiTRC9Mt2+bzdatU368umk6QUs3vHpuS
5XvFEMAn6yXzO4gNqzLE7iR+ryhIYUI1V+Ene35EtgTfdMOiA3DWUJ6Abrum7xBy
z5Lb7+98JfTIywEuMfDfT3dksdw7epKiIYbpmWBM8B2IFJA7WA==
-----END CERTIFICATE-----
`


// ---------------------------------------
// Database connection config
// ---------------------------------------
const config = {
  client: 'pg',
  connection: {
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: true,
      ca: AIVEN_CA_CERT
    }
  }
}

if (process.env.NODE_ENV == 'development') {
  delete config.connection.ssl;
}

const knex = require('knex')(config);

// Get current year
const CURRENT_YEAR = new Date().getFullYear();

// ------------------------------------------
// Categories
// ------------------------------------------
async function getCategories(user) {
  return knex
    .select('c1.id', 'c1.parent_id as parentId', 'c1.title')
    .from({ c1: 'category' })
    .leftJoin({ c2: 'category' }, 'c1.parent_id', '=', 'c2.id')
    .where({ 'c1.user_id': user });
}

async function createCategory(user, parentId, title) {
  return knex('category').insert({
    user_id: user,
    parent_id: parentId,
    title: title
  }, [
    'id',
    'title',
    'parent_id as parentId'
  ]);
}

async function editCategory(user, categoryId, title) {
  return knex('category')
    .where({ user_id: user, id: categoryId })
    .update({ title: title }, [
      'id',
      'title',
      'parent_id as parentId'
    ]);
}

async function deleteCategory(user, categoryId) {
  return knex('category')
    .where({ user_id: user, id: categoryId })
    .del();
}

// ------------------------------------------
// User
// ------------------------------------------
async function findUser(username) {
  return knex
    .select('*')
    .from({ u: 'users' })
    .where({ username: username });
}

async function deleteUser(user) {
  return knex('users')
    .where({ id: user })
    .del();
}


// ------------------------------------------
// Expenses
// ------------------------------------------
async function getExpenses(user, expenseId = null, year = null, month = null) {
  return knex
    .select(
      'id',
      'year',
      'month',
      'day',
      'description',
      'details',
      'category',
      'recurring',
      'amount_paid as amountPaid',
      'amount_reimbursed as amountReimbursed')
    .from('expense')
    .where({ user_id: user })
    .modify((queryBuilder) => {
      if (expenseId) {
        // If id is provided, ignore other parameters
        queryBuilder.andWhere({ id: expenseId });
      }
      else if (year && month) {
        queryBuilder.andWhere({ year: year, month: month });
      } else if (year && !month) {
        queryBuilder.andWhere({ year: year });
      } else if (!year && month) {
        queryBuilder.andWhere({ month: month });
      }
    });
}

async function getYears(user) {
  return knex
    .select('year')
    .from('expense')
    .where({ user_id: user })
    .groupBy('year')
    .orderBy(['year']);
}

async function searchExpenses(user, search) {
  return knex
    .select(
      'id',
      'year',
      'month',
      'day',
      'description',
      'details',
      'category',
      'recurring',
      'amount_paid as amountPaid',
      'amount_reimbursed as amountReimbursed')
    .from('expense')
    .where({ user_id: user })
    .andWhere(queryBuilder => {
      queryBuilder
        .whereILike('description', `%${search}%`)
        .orWhereILike('details', `%${search}%`);
    });
}

async function createExpense(user, expense) {
  return knex('expense')
    .insert({
      user_id: user,
      year: expense.year,
      month: expense.month,
      day: expense.day,
      description: expense.description.trim(),
      details: expense.details.trim(),
      amount_paid: expense.amountPaid,
      amount_reimbursed: expense.amountReimbursed,
      category: expense.category,
      recurring: expense.recurring,
    }, [
      'id',
      'year',
      'month',
      'day',
      'description',
      'details',
      'amount_paid as amountPaid',
      'amount_reimbursed as amountReimbursed',
      'category',
      'recurring'
    ]);
}

async function copyRecurringToNextMonth(user, year, month, keepAmounts = true) {
  return knex
    .into(knex.raw('expense(user_id, year, month, day, description, details, category, recurring,  amount_paid, amount_reimbursed)'))
    .insert(builder => {
      builder
        .select(
          'user_id',
          knex.raw('CASE WHEN month = 12 THEN year+1 ELSE year END'),
          knex.raw('CASE WHEN month = 12 THEN 1 ELSE month+1 END'),
          'day',
          'description',
          'details',
          'category',
          'recurring',
          keepAmounts ? 'amount_paid' : 0,
          keepAmounts ? 'amount_reimbursed' : 0)
        .from('expense')
        .where({ user_id: user, year: year, month: month, recurring: true })
    }, [
      'id',
      'year',
      'month',
      'day',
      'description',
      'details',
      'amount_paid as amountPaid',
      'amount_reimbursed as amountReimbursed',
      'category',
      'recurring'
    ]);
}

async function updateExpense(user, expenseId, expense) {
  return knex('expense')
    .where({ user_id: user, id: expenseId })
    .update({
      year: expense.year,
      month: expense.month,
      day: expense.day,
      description: expense.description,
      details: expense.details,
      amount_paid: expense.amountPaid,
      amount_reimbursed: expense.amountReimbursed,
      category: expense.category,
      recurring: expense.recurring,
    }, [
      'id',
      'year',
      'month',
      'day',
      'description',
      'details',
      'amount_paid as amountPaid',
      'amount_reimbursed as amountReimbursed',
      'category',
      'recurring'
    ]);
}

async function deleteExpense(user, expenseId) {
  return knex('expense')
    .where({ user_id: user, id: expenseId })
    .del();
}

async function deleteExpenses(user, expenseList) {
  return knex('expense')
    .where({ user_id: user })
    .whereIn('id', expenseList)
    .del(['id']);
}

async function buildEvolutionQuery(user, mainCategory, category, startYear, endYear, selectMonths = false) {
  const selection = ['year'];
  if (selectMonths) selection.push('month')

  return {
    query: knex
      .select(...selection)
      .sum({ amountSpent: 'amount_spent' })
      .from({ exp: 'expense_view' })
      .modify((queryBuilder) => {
        if (mainCategory) queryBuilder.join('category as cat', 'exp.category', '=', 'cat.id');
      })
      .where({ 'exp.user_id': user })
      .whereBetween('year', [startYear, endYear])
      .modify((queryBuilder) => {
        if (category) queryBuilder.where({ category: category });
        if (mainCategory) queryBuilder.where({ parent_id: mainCategory });
      })
      .groupBy('year')
  }
}

async function getEvolutionPerYear(user, mainCategory = null, category = null, startYear = 2012, endYear = CURRENT_YEAR) {
  const { query } = await buildEvolutionQuery(user, mainCategory, category, startYear, endYear, false);
  return query
    .orderBy(['year']);
}


async function getEvolutionPerMonth(user, mainCategory = null, category = null, startYear = 2012, endYear = CURRENT_YEAR) {
  const { query } = await buildEvolutionQuery(user, mainCategory, category, startYear, endYear, true);
  return query
    .groupBy('month')
    .orderBy(['year', 'month']);
}

async function getMainCategoryReportByYear(user, startYear = 2012, endYear = CURRENT_YEAR) {
  return knex
    .select('year', 'month', 'parent_id as category')
    .sum({ amountSpent: 'amount_spent' })
    .from({ exp: 'expense_view' })
    .join('category as cat', 'exp.category', '=', 'cat.id')
    .where({ 'exp.user_id': user })
    .whereBetween('year', [startYear, endYear])
    .groupBy('year')
    .groupBy('month')
    .groupBy('parent_id')
    .orderBy(['year', 'month']);
}

async function getSubCategoryReportByYear(user, startYear = 2012, endYear = CURRENT_YEAR, parentId = null) {
  return knex
    .select('year', 'month', 'category')
    .sum({ amountSpent: 'amount_spent' })
    .from({ exp: 'expense_view' })
    .join('category as cat', 'exp.category', '=', 'cat.id')
    .where({ 'exp.user_id': user })
    .whereBetween('year', [startYear, endYear])
    .modify((queryBuilder) => {
      if (parentId) queryBuilder.where({ parent_id: parentId });
    })
    .groupBy('year')
    .groupBy('month')
    .groupBy('category')
    .orderBy(['year', 'month']);
}