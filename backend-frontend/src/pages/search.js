import * as React from 'react';
import PropTypes from 'prop-types';
import { Container, Box, Stack, LinearProgress } from '@mui/material';
import { useRouter, withRouter } from 'next/router'
import ExpensesTable from '../components/ExpensesTable';
import { expenseService, alertService } from 'src/services';
import { mapExpenseToRow, toExpenseFormQuery, parseDate } from 'src/helpers'
import { useCategories, useExpenseSearch, useInvalidateExpenses } from 'src/hooks/queries';
import { AppContext } from 'src/pages/_app';

function Search(props) {
  const { query } = props.router.query;

  // Context (UI state)
  const context = React.useContext(AppContext);
  const largeScreen = context?.largeScreen;

  // Server state — results are cached per search term
  const { categories } = useCategories();
  const { data: searchResults, isPending } = useExpenseSearch(query);
  const invalidateExpenses = useInvalidateExpenses();

  // Router
  const router = useRouter();

  const rows = React.useMemo(() => {
    if (!searchResults || categories.length === 0) return [];

    return searchResults.map(expense => mapExpenseToRow(expense, categories, 'full'));
  }, [searchResults, categories]);

  const findExpense = (target) => {
    return rows.find(item => item.id === target);
  }

  // -------------------------------------------
  // Handler
  // -------------------------------------------
  const handleAction = (action, selected) => {
    if (action === 'delete') {
      expenseService.deleteExpenses(selected)
        .then((response) => {
          invalidateExpenses();
          alertService.success(`${response.deleted.length} expense(s) deleted, ${response.failed.length} failed`);
        })
        .catch(err => alertService.error(`API error: ${err}`));
    } else if (action === 'edit' || action === 'duplicate') {
      // Find expense (there should be only 1 selected, so use first position of the list)
      const exp = findExpense(selected[0]);

      // The query goes in the real URL so the form survives a reload
      if (action === 'duplicate') {
        // Do not add year and month, user will probably change it
        router.push({
          pathname: '/new-expense',
          query: toExpenseFormQuery(exp),
        });
      } else {
        const parsed = parseDate(exp.date);

        router.push({
          pathname: '/edit-expense',
          query: {
            ...toExpenseFormQuery(exp),
            id: exp.id,
            year: parsed.year,
            month: parsed.month,
          },
        });
      }
    }
  }

  // Title
  const title = largeScreen.width ? `Search results for: ${query}` : (query || '');

  return (
    <Container>
      <Box sx={{ my: 2 }}>
        <Stack spacing={1}>
          {
            // If loading, show 'progress'
            (query && isPending) ?
              (
                <Box>
                  <LinearProgress color="primary" />
                </Box>
              ) :
              (
                <ExpensesTable
                  handleAction={handleAction}
                  title={title}
                  expenses={rows}
                  order="desc"
                />
              )
          }
        </Stack>
      </Box>
      {
        // On mobile, leave breathing room below the table
        // (search now lives in the app bar)
        !largeScreen.width && <Box sx={{ height: 25 }} />
      }
    </Container>
  );
}

export default withRouter(Search)

Search.propTypes = {
  router: PropTypes.object,
};
