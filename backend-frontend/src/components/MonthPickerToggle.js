import * as React from 'react';
import PropTypes from 'prop-types';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Grid from '@mui/material/Grid';
import { getCustomMonthInitials } from 'src/helpers';
import { AppContext } from 'src/pages/_app';


export default function MonthPickerToggle(props) {
  const { handleChange, month } = props;

  const context = React.useContext(AppContext);
  const largeScreen = context?.largeScreen;

  // Custom padding
  const padding = { padding: { xs: '7px 4px', md: '7px 20px' } };
  return (
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > :not(style) + :not(style)': { mb: 2 },
      }}
    >
      <ToggleButtonGroup
        color="primary"
        exclusive
        onChange={(_event, value) => { handleChange('month', value) }}
      >
        {
          // ------------------------------------------
          // Create 12 buttons representing months
          // ------------------------------------------
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(monthId => {
            return (
              <ToggleButton
                key={monthId}
                value={monthId}
                size="small" sx={padding}
                selected={monthId === month}
              >
                {getCustomMonthInitials(monthId, largeScreen.width)}
              </ToggleButton>)
          })
        }
      </ToggleButtonGroup>
    </Grid>
  );
}

MonthPickerToggle.propTypes = {
  handleChange: PropTypes.func.isRequired,
  month: PropTypes.number.isRequired,
};