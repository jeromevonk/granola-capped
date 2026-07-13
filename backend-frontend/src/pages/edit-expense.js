import * as React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography } from '@mui/material';
import { withRouter } from 'next/router'
import ExpenseForm from '../components/ExpenseForm';

function EditExpense(props) {
  // On a full page reload the query string is parsed after the first
  // render — wait for it so the form initializes with the expense data
  if (!props.router.isReady) return null;

  const {id, ...expense} = props.router.query;

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" component="h1" sx={{ mt: 4 }}>
        Edit expense
      </Typography>
      <ExpenseForm 
        expense={expense} 
        action="edit" 
        expenseId={Number(id)}
      />
    </Container>
  );
}

export default withRouter(EditExpense)

EditExpense.propTypes = {
  router: PropTypes.object,
};