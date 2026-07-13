import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, expenseService, statsService } from 'src/services';
import { getMainCategories } from 'src/helpers';

export {
  useCategories,
  useExpenses,
  useYears,
  useExpenseSearch,
  useEvolution,
  useCategoryReport,
  useInvalidateExpenses,
};

// ---------------------------------------------------------------------
// Server-state hooks (TanStack Query).
//
// The cache lives above the router (see _app.js), so data survives
// navigation. Mutations refresh it via explicit invalidation; the
// stale-while-revalidate defaults (5-min staleTime, refetch on window
// focus) keep a tab in sync when the same user writes from another
// device.
// ---------------------------------------------------------------------

function useCategories() {
  const { data, isPending } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const categories = useMemo(() => (data || []), [data]);
  const mainCategories = useMemo(() => getMainCategories(categories), [categories]);

  return { categories, mainCategories, isPending };
}

function useExpenses(year) {
  return useQuery({
    queryKey: ['expenses', year],
    queryFn: () => expenseService.getExpenses(year),
  });
}

function useYears() {
  return useQuery({
    queryKey: ['years'],
    queryFn: () => expenseService.getYears(),
  });
}

function useExpenseSearch(query) {
  return useQuery({
    queryKey: ['expenses', 'search', query],
    queryFn: () => expenseService.searchExpenses(query),
    enabled: !!query,
  });
}

function useEvolution(dateType, categoryType, categoryNumber) {
  return useQuery({
    queryKey: ['stats', 'evolution', dateType, categoryType, categoryNumber],
    queryFn: () => {
      const params = {};
      if (categoryType === 'mainCategory') params.mainCategory = categoryNumber;
      if (categoryType === 'subCategory') params.subCategory = categoryNumber;

      return dateType === 'year'
        ? statsService.getEvolutionPerYear(params)
        : statsService.getEvolutionPerMonth(params);
    },
  });
}

function useCategoryReport(year, reportType) {
  return useQuery({
    queryKey: ['stats', 'report', year, reportType],
    queryFn: () => statsService.getCategoryReportByYear(year, year, reportType),
  });
}

// Every expense mutation must call this: it refreshes expense lists,
// search results, the year list and the stats-derived pages
function useInvalidateExpenses() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['years'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };
}
