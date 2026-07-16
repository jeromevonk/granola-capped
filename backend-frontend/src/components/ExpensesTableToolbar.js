import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { Delete as DeleteIcon, ContentCopy as ContentCopyIcon, Edit as EditIcon, DoubleArrow as DoubleArrowIcon, FilterAlt, FilterAltOff } from '@mui/icons-material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ExpensesTableFilterPopover from './ExpensesTableFilterPopover';
import ExpensesTableCopyPopover from './ExpensesTableCopyPopover';

const getTotalString = (expensesSum, largeScreen, numSelected) => {
  let totalStr = '';
  if (largeScreen.width) {
    totalStr = numSelected > 0 ? `Selected total: $ ${expensesSum}` : `Total: $ ${expensesSum}`;
  } else {
    totalStr = `R$ ${expensesSum}`
  }

  return totalStr;
}

export default function ExpensesTableToolbar(props) {
  const { selected, title, setSelected, filter, setFilter, handleAction, expensesSum, filterable, largeScreen } = props;
  const numSelected = selected.length;

  // -----------------------------------
  // States for the Popovers
  // -----------------------------------
  const [filterPopoverAnchor, setFilterPopoverAnchor] = React.useState(null);
  const [copyPopoverAnchor, setCopyPopoverAnchor] = React.useState(null);

  const filterIsActive = !(filter.mainCategory == 0 && filter.subCategory == 0);

  // Tooltips
  const duplicateTooltip = numSelected > 1 ? "Can't duplicate multiple at once" : "Duplicate";
  const editTooltip = numSelected > 1 ? "Can't edit multiple at once" : "Edit";

  // Sum total
  const totalStr = getTotalString(expensesSum, largeScreen, numSelected);

  return (
    <Toolbar
      variant="dense"
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (appTheme) =>
            alpha(appTheme.palette.primary.main, appTheme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 40%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 40%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {title}
        </Typography>
      )}
      <Typography
        sx={{ flex: '1 1 40%', color: 'primary.main', fontWeight: 700 }}
        variant="subtitle1"
        id="tableTitle"
        component="div"
      >
        {totalStr}
      </Typography>

      <Box sx={{ width: 120 }}>
        {numSelected > 0 ? (
          <Stack direction="row">
            <Tooltip title={editTooltip}>
              <span>
                <IconButton
                  onClick={() => {
                    handleAction('edit', selected)
                  }}
                  disabled={numSelected > 1}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={duplicateTooltip}>
              <span>
                <IconButton
                  onClick={() => {
                    handleAction('duplicate', selected)
                  }}
                  disabled={numSelected > 1}
                >
                  <ContentCopyIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                onClick={() => {
                  handleAction('delete', selected);

                  // After the action, clear the selected array
                  setSelected([]);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Tooltip title="Filter expenses per category">
              <IconButton
                sx={{ alignContent: "right" }}
                onClick={(event) => setFilterPopoverAnchor(event.currentTarget)}
              >
                {filterIsActive ? <FilterAltOff htmlColor="#04d164" /> : <FilterAlt />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy recurring expenses to next month">
              <IconButton
                sx={{ alignContent: "right" }}
                onClick={(event) => setCopyPopoverAnchor(event.currentTarget)}
              >
                <DoubleArrowIcon />
              </IconButton>
            </Tooltip>
            <ExpensesTableFilterPopover
              anchorEl={filterPopoverAnchor}
              onClose={() => setFilterPopoverAnchor(null)}
              filter={filter}
              setFilter={setFilter}
              filterable={filterable}
            />
            <ExpensesTableCopyPopover
              anchorEl={copyPopoverAnchor}
              onClose={() => setCopyPopoverAnchor(null)}
              onCopy={(options) => handleAction('copy', [], options)}
            />
          </Stack>
        )}
      </Box>
    </Toolbar>
  );
}

ExpensesTableToolbar.propTypes = {
  selected: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  handleAction: PropTypes.func.isRequired,
  setSelected: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  expensesSum: PropTypes.string.isRequired,
  filterable: PropTypes.object.isRequired,
  largeScreen: PropTypes.object.isRequired,
};
