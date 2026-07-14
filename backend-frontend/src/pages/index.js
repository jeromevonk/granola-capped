import * as React from 'react';
import PropTypes from 'prop-types';
import { Container, Box, Stack, Fab, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter, withRouter } from 'next/router'
import ExpensesTable from '../components/ExpensesTable';
import DateSelector from '../components/DateSelector';
import { expenseService, alertService } from 'src/services';
import { getCustomDateString, mapExpenseToRow, toExpenseFormQuery } from 'src/helpers'
import { useCategories, useExpenses, useInvalidateExpenses } from 'src/hooks/queries';
import { useKeydown } from 'src/hooks/use-keydown';
import { AppContext } from 'src/pages/_app';

function Index(props) {
  // Context (UI state)
  const context = React.useContext(AppContext);
  const largeScreen = context?.largeScreen;
  const [searchFocus] = context?.searchFocus || false;

  // Server state
  const { categories, isPending: categoriesPending } = useCategories();
  const invalidateExpenses = useInvalidateExpenses();

  // Router
  const router = useRouter();

  // Initial state is either what was passed via query
  // or current year and month
  const [selectedDate, setSelectedDate] = React.useState({
    year: Number(props.router.query.year) || new Date().getFullYear(),
    month: Number(props.router.query.month) || new Date().getMonth() + 1 // to get current month
  });

  const handleChange = (name, value) => {
    setSelectedDate(prev => ({
      ...prev,
      [name]: value
    }))
  };

  // -------------------------------------------
  // Left and right arrows change the month
  // (suspended while the search bar is focused)
  // -------------------------------------------
  useKeydown((event) => {
    if (event.key === 'ArrowLeft' && selectedDate.month > 1) {
      handleChange('month', selectedDate.month - 1)
    }

    if (event.key === 'ArrowRight' && selectedDate.month < 12) {
      handleChange('month', selectedDate.month + 1)
    }
  }, !searchFocus);

  // Initial filter
  const initialFilter = {
    mainCategory: props.router.query.mainCategory,
    subCategory: props.router.query.subCategory
  };

  // -----------------------------------------------------
  // Expenses for the selected year come from the query
  // cache — data is fetched once per year and survives
  // page navigation; mutations invalidate it explicitly
  // -----------------------------------------------------
  const { data: yearExpenses, isPending: expensesPending } = useExpenses(selectedDate.year);

  // Rows for the selected month, in the shape ExpensesTable consumes
  const monthRows = React.useMemo(() => {
    if (!yearExpenses || categories.length === 0) return [];

    return yearExpenses
      .filter(expense => expense.month === selectedDate.month)
      .map(expense => mapExpenseToRow(expense, categories));
  }, [yearExpenses, categories, selectedDate.month]);

  const isLoading = expensesPending || categoriesPending;

  const findExpense = (target) => {
    return monthRows.find(item => item.id === target);
  }

  // -------------------------------------------
  // Handler
  // -------------------------------------------
  const handleAction = (action, selected, options = {}) => {
    if (action === 'delete') {
      expenseService.deleteExpenses(selected)
        .then((response) => {
          invalidateExpenses();
          alertService.success(`${response.deleted.length} expense(s) deleted, ${response.failed.length} failed`);
        })
        .catch(err => alertService.error(`API error: ${err}`));
    } else if (action === 'edit' || action === 'duplicate') {
      // Find expense
      const exp = findExpense(selected[0]);

      // The query goes in the real URL so the form survives a reload
      if (action === 'duplicate') {
        // Do not add year and month, user will probably change it
        router.push({
          pathname: '/new-expense',
          query: toExpenseFormQuery(exp),
        });
      } else {
        router.push({
          pathname: '/edit-expense',
          query: {
            ...toExpenseFormQuery(exp),
            id: exp.id,
            year: selectedDate.year,
            month: selectedDate.month,
          },
        });
      }
    } else if (action === 'copy') {
      expenseService.copyRecurringToNextMonth(selectedDate.year, selectedDate.month, options.keepAmounts)
        .then((response) => {
          if (response.length === 0) {
            alertService.error('Nothing was copied');
            return;
          }

          // The copies live in "next month" — refresh the cache and
          // jump straight to where they landed
          invalidateExpenses();
          setSelectedDate({ year: response[0].year, month: response[0].month });
          alertService.success('Copied');
        })
        .catch(err => alertService.error(`API error: ${err}`));
    }
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ paddingLeft: '12px', paddingRight: '12px' }}
    >
      <Box sx={{ my: 2 }}>
        <Stack spacing={1}>
          <DateSelector
            handleChange={handleChange}
            year={selectedDate.year}
            month={selectedDate.month}
          />
          {
            // If loading, show 'progress'
            isLoading ?
              (
                <Box>
                  <LinearProgress color="primary" />
                </Box>
              ) :
              (
                <ExpensesTable
                  handleAction={handleAction}
                  title={getCustomDateString(selectedDate.year, selectedDate.month, largeScreen.width)}
                  expenses={monthRows}
                  filter={initialFilter}
                />
              )
          }
        </Stack>
      </Box>
      {/* Floating action button - new expense */}
      <Fab
        color="primary"
        size='small'
        onClick={() => router.push({ pathname: '/new-expense' })}
        sx={{
          margin: 0,
          top: 'auto',
          right: 'auto',
          bottom: 20,
          left: 20,
          position: 'fixed',
        }}
      >
        <AddIcon />
      </Fab>
      {
        // Only show the search icon on mobile
        !largeScreen.width &&
        <Container>
          <Fab
            color="primary"
            size='small'
            onClick={() => router.push({ pathname: '/search-mobile' })}
            sx={{
              margin: 0,
              top: 'auto',
              right: 20,
              bottom: 20,
              left: 'auto',
              position: 'fixed',
            }}
          >
            <SearchIcon />
          </Fab>
          { /* Add some blank space at the bottom, so user can scroll and search icon gives space to table pagination */}
          <Box sx={{ height: 25 }} />
        </Container>
      }
    </Container>
  );
}

export default withRouter(Index)

Index.propTypes = {
  router: PropTypes.object,
};
