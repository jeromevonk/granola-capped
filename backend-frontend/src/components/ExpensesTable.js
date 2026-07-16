import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, Paper } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { AppContext } from 'src/pages/_app';
import { useCategories } from 'src/hooks/queries';
import { useKeydown } from 'src/hooks/use-keydown';
import ExpensesTableToolbar from './ExpensesTableToolbar';
import ExpensesTableHead from './ExpensesTableHead';
import {
  getCategoryTitles,
  customlocaleString,
  formatCompactDate,
  getParentCategoryId,
  getComparator,
} from 'src/helpers'

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 160,
  },
});

const StyledTableRow = styled(TableRow)(({ theme: appTheme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: appTheme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Hoisted static sx objects to keep identity stable across renders
const boxFullWidthSx = { width: '100%' };
const paperSx = { width: '100%', mb: 2 };
const tableSx = { minWidth: 250 };

function ExpensesTable(props) {
  // Context (UI state)
  const context = React.useContext(AppContext);
  const largeScreen = context?.largeScreen;
  const [visibility] = context?.visibility || false;
  const [searchFocus] = context?.searchFocus || false;

  // Server state
  const { categories } = useCategories();

  // States
  const [order, setOrder] = React.useState(props.order || 'asc');
  const [orderBy, setOrderBy] = React.useState('date');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [filter, setFilter] = React.useState({
    mainCategory: props.filter?.mainCategory || 0,
    subCategory: props.filter?.subCategory || 0
  });

  // Rows per page: derived from screen height until the user picks a
  // value explicitly — then the explicit choice wins
  const [rowsPerPageOverride, setRowsPerPageOverride] = React.useState(null);
  const rowsPerPage = rowsPerPageOverride ?? (largeScreen.height ? 20 : 8);

  // When month/year changes (the title identifies the period), clear
  // the selection and go back to the first page — adjusted during
  // render instead of via an effect
  const [prevTitle, setPrevTitle] = React.useState(props.title);
  if (prevTitle !== props.title) {
    setPrevTitle(props.title);
    setSelected([]);
    setPage(0);
  }

  // Filter changes also reset pagination
  const updateFilter = (value) => {
    setFilter(value);
    setPage(0);
  };

  const rows = props.expenses || [];

  // ----------------------------------------
  //  Button handlers
  // ----------------------------------------
  const handleRequestSort = (_event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPageOverride(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.includes(id);

  // Full dates (search view) don't fit on narrow screens — compact them.
  // Month view dates are just day numbers and pass through untouched.
  const formatDateCell = (date) => {
    if (!date) return '-';
    if (!largeScreen.width && typeof date === 'string') return formatCompactDate(date);
    return date;
  };

  // ----------------------------------------
  // Filterable
  // Get categories and sub-categories
  // from the rows
  // ----------------------------------------
  const getFilterableCategories = (data) => {
    return data.reduce((prev, current) => {
      const sub = current.category;
      const cat = getParentCategoryId(categories, sub);
      const titles = getCategoryTitles(categories, sub);

      const key = `${cat}-${titles.parentCategoryTitle}`
      if (!(key in prev)) {
        // Add category with an empty array
        prev[key] = [];
      }

      // Add the sub-category, if not there already
      if (!prev[key].some(item => item.id === sub)) {
        prev[key].push({
          id: sub,
          title: titles.categoryTitle
        });
      }

      return prev;
    }, {});
  }

  // Filter the rows
  const filteredRows = rows.slice().filter(item => {
    if (filter.subCategory > 0) {
      return item.category == filter.subCategory;
    } else if (filter.mainCategory > 0) {
      return getParentCategoryId(categories, item.category) == filter.mainCategory;
    } else {
      return true;
    }
  });

  // Number of pages
  const pageCount = Math.floor(filteredRows.length / rowsPerPage);

  // -------------------------------------------
  // Keyboard shortcuts (suspended while the
  // search bar is focused)
  // -------------------------------------------
  useKeydown((event) => {
    switch (event.key) {
    // pagination: home / previous / next / last
    case 'h': setPage(0); break;
    case 'j': setPage(prev => Math.max(0, prev - 1)); break;
    case 'k': setPage(prev => Math.min(pageCount, prev + 1)); break;
    case 'l': setPage(pageCount); break;

      // ordering: toggle direction / by date / by spent
    case 't': setOrder(prev => prev === 'asc' ? 'desc' : 'asc'); break;
    case 'd': setOrderBy('date'); break;
    case 's': setOrderBy('spent'); break;

      // actions on a single selected expense
    case 'e': if (selected.length === 1) props.handleAction('edit', selected); break;
    case '2': if (selected.length === 1) props.handleAction('duplicate', selected); break;

    default: break;
    }
  }, !searchFocus);

  // -------------------------------------------------------
  // Sum expenses
  // If none is selected, sum them all
  // If there is at least one selection, sum the selected
  // -------------------------------------------------------
  let expensesSum = filteredRows.reduce((prev, current) => {
    let sum = prev;

    if (selected.length === 0 || isSelected(current.id)) {
      sum += Number(current.spent);
    }

    return sum;
  }, 0);

  expensesSum = customlocaleString(expensesSum);


  return (
    <Box sx={boxFullWidthSx}>
      <Paper sx={paperSx}>
        <ExpensesTableToolbar
          selected={selected}
          setSelected={setSelected}
          setFilter={updateFilter}
          filter={filter}
          expensesSum={expensesSum}
          handleAction={props.handleAction}
          title={props.title}
          filterable={getFilterableCategories(rows)}
          largeScreen={largeScreen}
        />
        <TableContainer>
          <Table
            sx={tableSx}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <ExpensesTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              largeScreen={largeScreen}
            />
            <TableBody>
              {filteredRows
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {

                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <StyledTableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      {
                        // Date - might be a day (in month view) or a full
                        // date (in search view); the full date is shown
                        // compact on narrow screens
                      }
                      <TableCell align="center">{formatDateCell(row.date)}</TableCell>
                      {
                        // Description
                      }
                      <CustomWidthTooltip title={`Category: ${row.mainCategoryText} Subcategory: ${row.subCategoryText} ${row.recurring ? 'Recurring' : ''}`}>
                        <TableCell
                          align="left"
                          style={{
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                            fontWeight: row.recurring ? "bold" : "normal"
                          }}>{row.description} {'\n'} {row.details && <span style={{ color: 'grey', fontSize: '12px' }}>{row.details}</span>}
                        </TableCell>
                      </CustomWidthTooltip>
                      {
                        // Category
                      }
                      {
                        // Only show this column if screen is large enough
                        largeScreen.width && <TableCell align="center">{row.categoryText}</TableCell>
                      }
                      {
                        // Spent
                      }
                      <Tooltip align="right" title={visibility ? `Paid: ${row.amountPaid}, Reimbursed: ${row.amountReimbursed}` : ''}>
                        <TableCell
                          align="right"
                        >{visibility ? customlocaleString(row.spent) : '••••••••'}</TableCell>
                      </Tooltip>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[8, 20, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton={!!largeScreen.width}
          showLastButton={!!largeScreen.width}
          labelRowsPerPage='Rows:'
        />
      </Paper>
    </Box>
  );
}

ExpensesTable.propTypes = {
  handleAction: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  expenses: PropTypes.array,
  filter: PropTypes.object,
  order: PropTypes.string,
};

export default React.memo(ExpensesTable);
