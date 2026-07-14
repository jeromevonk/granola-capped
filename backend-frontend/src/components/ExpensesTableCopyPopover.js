import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function ExpensesTableCopyPopover(props) {
  const { anchorEl, onClose, onCopy } = props;

  const [radioAmount, setRadioAmount] = React.useState('1');

  return (
    <Popover
      elevation={10}
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box sx={{ m: 2, p: 1 }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          style={{ position: 'absolute', right: '4px', top: '4px', zIndex: '1000' }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>Copy to next month</Typography>
        <Typography variant="body1" gutterBottom>This will copy <strong>recurring expenses</strong> from <br />this month to next month.</Typography>
        <Typography variant="body1" gutterBottom>You can choose whether to fully copy or to <br />set the spent as zero and edit later.</Typography>
        <FormControl sx={{ py: 1 }}>
          <FormLabel id="radio-label" sx={{ textAlign: "left" }}>Amount spent</FormLabel>
          <RadioGroup
            row
            aria-labelledby="radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={radioAmount}
            onChange={(event) => setRadioAmount(event.target.value)}
          >
            <FormControlLabel value="1" control={<Radio />} label="Keep amounts" />
            <FormControlLabel value="0" control={<Radio />} label="Clear amounts" />
          </RadioGroup>
        </FormControl>
        <Stack direction='row' justifyContent='space-around'>
          <Button
            color="primary"
            tabIndex={0}
            aria-label='Copy'
            onClick={() => {
              onCopy({ keepAmounts: !!Number(radioAmount) });
              onClose();
            }}
          >
            Copy
          </Button>
          <Button
            color="error"
            tabIndex={0}
            aria-label='Cancel'
            onClick={onClose}>
            CANCEL
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}

ExpensesTableCopyPopover.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
};
