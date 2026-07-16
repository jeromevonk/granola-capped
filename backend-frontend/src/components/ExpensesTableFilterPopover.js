import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { sortTitleAlphabetically } from 'src/helpers';

export default function ExpensesTableFilterPopover(props) {
  const { anchorEl, onClose, filter, setFilter, filterable } = props;

  // ----------------------------------------------------
  // Categories/sub-categories available in the current
  // rows (the 'filterable' map), sorted for the selects
  // ----------------------------------------------------
  let availableCategories = [];
  let availableSubCategories = [];
  for (let [key, value] of Object.entries(filterable)) {
    // The key represents the main category
    const [cat, catTitle] = key.split('-');
    availableCategories.push({
      id: cat,
      title: catTitle
    });

    // If mainCategory filter is not selected
    // or if it is selected, but this is the selected category
    // then add the subCategories to the list
    if (cat == 0 || cat == filter.mainCategory) {
      // The value (array) represents the subcategories
      for (const item of value) {
        availableSubCategories.push({
          id: item.id,
          title: item.title
        });
      }
    }
  }

  availableCategories = availableCategories.sort(sortTitleAlphabetically);
  availableSubCategories = availableSubCategories.sort(sortTitleAlphabetically);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    if (name === 'mainCategory') {
      setFilter({ mainCategory: value, subCategory: 0 });
    } else {
      setFilter(prevFilter => ({
        ...prevFilter,
        [name]: value
      }));
    }
  }

  const resetFilter = () => {
    setFilter({ mainCategory: 0, subCategory: 0 });
  }

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
      <IconButton
        aria-label="Close"
        onClick={onClose}
        style={{ position: 'absolute', right: '4px', top: '4px', zIndex: '1000' }}>
        <CloseIcon />
      </IconButton>
      <Stack direction="row" spacing={5} alignItems="center" justifyContent="flex-start">
        <Typography sx={{ p: 2 }}>Filter</Typography>
        <Button
          color="error"
          tabIndex={0}
          aria-label={'Reset filter'}
          onClick={resetFilter}>
          RESET
        </Button>
      </Stack>
      <FormControl variant="standard" sx={{ m: 1, minWidth: '150px' }}>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-label"
          id="mainCategory"
          name="mainCategory"
          label="Category"
          value={filter.mainCategory}
          onChange={handleFilterChange}
        >
          <MenuItem key={'category-all'} value='0'>All</MenuItem>
          {
            availableCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>{category.title}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ m: 1, minWidth: '150px' }}>
        <InputLabel id="subCategory-select-label">Sub-category</InputLabel>
        <Select
          labelId="subCategory-label"
          id="subCategory"
          name="subCategory"
          label="Sub-category"
          value={filter.subCategory}
          onChange={handleFilterChange}
        >
          <MenuItem key={'subcategory-all'} value='0'>All</MenuItem>
          {
            availableSubCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>{category.title}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </Popover>
  );
}

ExpensesTableFilterPopover.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  filterable: PropTypes.object.isRequired,
};
