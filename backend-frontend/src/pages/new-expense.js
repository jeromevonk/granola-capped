import * as React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography } from '@mui/material';
import { withRouter } from 'next/router'
import ExpenseForm from '../components/ExpenseForm';

function NewExpense(props) {
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