import * as React from 'react';
import PropTypes from 'prop-types';
import Pagination from '@mui/material/Pagination';

export default function MonthPickerPagination(props) {
  const { handleChange, month } = props;

  return (
    <Pagination
      count={12}
      page={month}
      size="small"
      color="primary"
      boundaryCount={6}
      hidePrevButton hideNextButton
      onChange={(_event, value) => { handleChange('month', value) }}
    />
  );
}

MonthPickerPagination.propTypes = {
  handleChange: PropTypes.func.isRequired,
  month: PropTypes.number.isRequired,
};