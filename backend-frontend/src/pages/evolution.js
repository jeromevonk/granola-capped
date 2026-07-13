import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic';
const EvolutionChart = dynamic(() => import('../components/EvolutionChart'), { ssr: false });
import EvolutionSelector from '../components/EvolutionSelector';
import { useCategories, useEvolution } from 'src/hooks/queries';
import { getCategoryTitles, getParentCategoryId, capitalizeFirstLetter, manipulateData, parseDate } from 'src/helpers'

export default function Evolution() {
  // Server state
  const { categories } = useCategories();

  // Google Charts doesn't follow the MUI theme — build its options
  // from the current palette so dark mode doesn't show a white box
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const chartTextStyle = { color: isDark ? '#e0e0e0' : '#333333' };

  // Router
  const router = useRouter();

  // States
  const [selectedOptions, setSelectedOptions] = React.useState({
    hideEmptyMonths: false,
    evolutionDateType: 'year',
    evolutionCategory: {
      type: 'all',
      number: 0
    }
  });

  const handleChange = (name, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [name]: value
    }))
  };

  // ------------------------------------------------------------
  // Evolution data comes from the query cache, keyed by
  // (dateType, categoryType, categoryNumber) — every combination
  // the user visits stays cached across navigation
  // ------------------------------------------------------------
  const { data: selectedData, isPending } = useEvolution(
    selectedOptions.evolutionDateType,
    selectedOptions.evolutionCategory.type,
    selectedOptions.evolutionCategory.number
  );

  // -----------------------------------------------
  // Make the chart title
  // -----------------------------------------------
  const makeTitle = ({ evolutionDateType, evolutionCategory }) => {
    // Hacky way of getting the title
    let title = `${capitalizeFirstLetter(evolutionDateType)}ly evolution of expenses for `;

    const { type: categoryType, number: categoryNumber } = evolutionCategory;

    // Type
    if (categoryType === 'all') title += 'all categories';
    if (categoryType === 'mainCategory') title += `main category: ${getCategoryTitles(categories, categoryNumber).categoryTitle}`;
    if (categoryType === 'subCategory') title += `sub-category: ${getCategoryTitles(categories, categoryNumber).categoryTitle}`;

    return title;
  }

  // Callback function for chart events
  const eventCallback = (selected, evolutionCategory) => {
    const row = selected.row + 1; // we have to consider that first row is the header
    const column = 0; // date is always column 0

    // Parse date
    const dateString = chartData[row][column];
    const { year, month } = parseDate(dateString)

    if (!month) {
      // Set type to 'month', so user can click a specific month on chart
      setSelectedOptions(prev => ({
        ...prev,
        evolutionDateType: 'month'
      }))
    } else {
      // Navigate to expenses page, passing year and month
      const query = {
        year,
        month
      };

      // Add other needed parameters
      if (evolutionCategory.type === 'mainCategory') {
        query.mainCategory = evolutionCategory.number
      } else if (evolutionCategory.type === 'subCategory') {
        query.mainCategory = getParentCategoryId(categories, evolutionCategory.number);
        query.subCategory = evolutionCategory.number;
      }

      router.push({
        pathname: '/',
        query
      }, '/');
    }
  }

  // Prepare the data according to user selection of hideEmptyMonths
  const chartData = manipulateData(selectedOptions, selectedData || []);

  // Get chart title
  const chartTitle = makeTitle(selectedOptions);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 1 }}>
        <EvolutionSelector
          handleChange={handleChange}
          hideEmptyMonths={selectedOptions.hideEmptyMonths}
          evolutionDateType={selectedOptions.evolutionDateType}
          categoryType={selectedOptions.evolutionCategory.type}
        />
      </Box>
      <Box sx={{ width: '100%' }}>
        {
          // If loading, show 'progress'
          isPending ?
            (
              <Container maxWidth="lg">
                <LinearProgress color="primary" />
              </Container>
            ) :
            (
              <EvolutionChart
                data={chartData}
                options={{
                  title: chartTitle,
                  backgroundColor: 'transparent',
                  titleTextStyle: chartTextStyle,
                  hAxis: { textStyle: chartTextStyle },
                  vAxis: {
                    minValue: 0,
                    textStyle: chartTextStyle,
                    gridlines: { color: isDark ? '#444444' : '#cccccc' }
                  },
                  legend: { position: "none" },
                  colors: [isDark ? '26a69a' : '008080']
                }}
                eventCallback={eventCallback}
                evolutionCategory={selectedOptions.evolutionCategory}
              />
            )
        }
      </Box>
    </Container>
  );
}
