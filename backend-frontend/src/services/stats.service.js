import { fetchWrapper } from 'src/helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/stats`;

export const statsService = {
  getEvolutionPerYear,
  getEvolutionPerMonth,
  getCategoryReportByYear,
};

function getEvolutionPerYear(params) {
  const queryString = getQueryString(params);
  return fetchWrapper.get(`${baseUrl}/year-evolution${queryString}`);
}

function getEvolutionPerMonth(params) {
  const queryString = getQueryString(params);
  return fetchWrapper.get(`${baseUrl}/month-evolution${queryString}`);
}

function getCategoryReportByYear(startYear, endYear, reportType) {
  return fetchWrapper.get(`${baseUrl}/category-report?startYear=${startYear}&endYear=${endYear}&reportType=${reportType}`);
}

const getQueryString = ({ mainCategory, subCategory }) => {
  let queryString = '';
  if (mainCategory) queryString += `?mainCategory=${mainCategory}`
  if (subCategory) queryString += `${mainCategory ? '&' : '?'}subCategory=${subCategory}`

  return queryString;
}