import { fetchWrapper } from 'src/helpers';
import type { CategoryReportEntry, EvolutionEntry } from 'src/types';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/stats`;

interface EvolutionParams {
  mainCategory?: number;
  subCategory?: number;
}

export const statsService = {
  getEvolutionPerYear,
  getEvolutionPerMonth,
  getCategoryReportByYear,
};

function getEvolutionPerYear(params: EvolutionParams): Promise<EvolutionEntry[]> {
  const queryString = getQueryString(params);
  return fetchWrapper.get<EvolutionEntry[]>(`${baseUrl}/year-evolution${queryString}`);
}

function getEvolutionPerMonth(params: EvolutionParams): Promise<EvolutionEntry[]> {
  const queryString = getQueryString(params);
  return fetchWrapper.get<EvolutionEntry[]>(`${baseUrl}/month-evolution${queryString}`);
}

function getCategoryReportByYear(startYear: number, endYear: number, reportType: string): Promise<CategoryReportEntry[]> {
  return fetchWrapper.get<CategoryReportEntry[]>(`${baseUrl}/category-report?startYear=${startYear}&endYear=${endYear}&reportType=${reportType}`);
}

const getQueryString = ({ mainCategory, subCategory }: EvolutionParams): string => {
  let queryString = '';
  if (mainCategory) queryString += `?mainCategory=${mainCategory}`
  if (subCategory) queryString += `${mainCategory ? '&' : '?'}subCategory=${subCategory}`

  return queryString;
}
