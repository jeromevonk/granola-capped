import * as React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography } from '@mui/material';
import { withRouter } from 'next/router'
import ExpenseForm from '../components/ExpenseForm';

function NewExpense(props) {
  // On a full page reload the query string is parsed after the first
  // render — wait for it so the form initializes with the expense data
  if (!props.router.isReady) return null;

  const { id, ...expense } = props.router.query;

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" component="h1" sx={{ mt: 4 }}>
        New expense
      </Typography>
      <ExpenseForm
        expense={expense}
        action="create"
      />
    </Container>
  );
}

export default withRouter(NewExpense)

NewExpense.propTypes = {
  router: PropTypes.object,
};