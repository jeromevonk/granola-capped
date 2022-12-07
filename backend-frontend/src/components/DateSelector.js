import * as React from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import YearPicker from './YearPicker';
import MonthPickerToggle from './MonthPickerToggle';
import MonthPickerPagination from './MonthPickerPagination';
import { AppContext } from 'src/pages/_app';

export default function DateSelector(props) {
  const { handleChange, year, month } = props;

  const context = React.useContext(AppContext);
  const largeScreen = context?.largeScreen;

  return (
    <Stack
      spacing={1}
      direction={largeScreen.width ? 'row' : 'column'}
      alignItems="center"
    >
      <Stack sx={{ width: '200px' }}>
        <YearPicker
          handleChange={handleChange}
          year={year}
        />
      </Stack>
      {
        largeScreen.width ?
          // For bigger screens, use the button toggle
          <MonthPickerToggle
            month={month}
            handleChange={handleChange}
          /> :
          // For smaller screens, use pagination
          <MonthPickerPagination
            month={month}
            handleChange={handleChange}
          />
      }
      
    </Stack>
  );
}

DateSelector.propTypes = {
  handleChange: PropTypes.func.isRequired,
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
};