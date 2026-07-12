import * as React from 'react';
import { Container, Box, Stack, Typography, LinearProgress } from '@mui/material';
import ReportTable from '../components/ReportTable';
import YearPicker from '../components/YearPicker';
import CategorySelector from '../components/CategorySelector';
import { useCategories, useCategoryReport } from 'src/hooks/queries';
import { AppContext } from 'src/pages/_app';
import { getCategoryTitles, sortTitleAlphabetically } from 'src/helpers'

const groupByCategory = (data, categoryList) => {
  const grouped = {};

  // How many months do we need to display as columns?
  const numMonths = data.reduce((previous, current) => Math.max(previous, current.month), 0);

  // There's data for several months. First, group by category
  for (const entry of data) {
    if (!(entry.category in grouped)) grouped[entry.category] = {}
    grouped[entry.category][entry.month] = entry.amountSpent;
  }

  // Now, convert to an array
  const year = [];

  // For every category
  for (let [key, value] of Object.entries(grouped)) {
    const entry = {
      category: Number(key),
      categoryText: getCategoryTitles(categoryList, Number(key)).categoryTitle
    };

    // Get the amount for every month (and sum)
    let sum = 0;
    for (let i = 1; i <= numMonths; i++) {
      let spent = value[i] || "0.00";
      entry[i] = spent;
      sum += Number(spent);
    }
    // Add YTD sum
    entry.year = sum.toFixed(2);

    // Push to resulting array
    year.push(entry);
  }

  return { grouped: year, numMonths };
}

export default function Report() {
  // Context (UI state)
  const context = React.useContext(AppContext);
  const largeScreen = context?.largeScreen;

  // Server state
  const { categories } = useCategories();

  // ------------------------------------------
  // States
  // ------------------------------------------
  const [selectedOptions, setSelectedOptions] = React.useState({
    year: new Date().getFullYear(),
    type: 'mainCategory'
  });

  const handleChange = (name, value) => {
    setSelectedOptions(prev => {
      const newState = {
        ...prev,
        [name]: value
      }

      if (name === 'year') {
        newState.type = 'mainCategory';
      }

      return newState;
    })
  };

  // ------------------------------------------------------------------
  // Report data comes from the query cache, keyed by (year, type).
  // The mainCategory report of the selected year is always fetched too
  // (it feeds the category selector); when type === 'mainCategory'
  // both hooks share the same key, so only one request is made.
  // ------------------------------------------------------------------
  const { data: reportData, isPending } = useCategoryReport(selectedOptions.year, selectedOptions.type);
  const { data: mainReportData } = useCategoryReport(selectedOptions.year, 'mainCategory');

  const selectedData = React.useMemo(() => {
    if (!reportData || categories.length === 0) return {};

    const { grouped, numMonths } = groupByCategory(reportData, categories);
    return { values: grouped, numMonths };
  }, [reportData, categories]);

  // Categories with a non-zero sum in the selected year, for the
  // "one category detailed" selector
  const mainCategories = React.useMemo(() => {
    if (!mainReportData || categories.length === 0) return [];

    const { grouped } = groupByCategory(mainReportData, categories);

    return grouped
      .map(item => ({ id: item.category, title: item.categoryText }))
      .sort(sortTitleAlphabetically);
  }, [mainReportData, categories]);

  const makeTitle = ({ year, type }) => {

    if (type === 'mainCategory') {
      return <span>Sum of expenses by category in ${year}</span>;
    }
    else if (type === 'subCategory') {
      return <span>Sum of expenses by sub-category in ${year}</span>;
    }
    else {
      return <span>Sum of expenses by sub-category of <i>{getCategoryTitles(categories, Number(type)).categoryTitle}</i> in {year}</span>;
    }

  }

  // Enough space in screen?
  if (!largeScreen.width) {
    return (
      <Container maxWidth="xl">
        <Typography component="h1" variant="h5">
          <Box sx={{ my: 2 }}>
            {"Sorry, this page can't be viewed on smaller screens 😬"}
          </Box>
        </Typography>

      </Container>
    );
  }

  // Prepare props for ReportTable component
  const tableTitle = makeTitle(selectedOptions);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={10} alignItems="center" justifyContent="flex-start">
            <YearPicker
              handleChange={handleChange}
              year={selectedOptions.year}
            />
            <CategorySelector
              handleChange={handleChange}
              mainCategories={mainCategories}
              radio={selectedOptions.type}
            />
          </Stack>
          {
            // If loading, show 'progress'
            isPending ?
              (
                <LinearProgress color="primary" />

              ) :
              (
                <ReportTable
                  title={tableTitle}
                  data={selectedData.values || []}
                  numMonths={selectedData.numMonths || 0}
                />
              )
          }

        </Stack>
      </Box>
    </Container>
  );
}
