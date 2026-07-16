export {
  getCustomDateString,
  getCustomMonthInitials,
  formatCompactDate,
  parseDate,
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getCustomDateString(year: number, month: number, isLarge: boolean): string {
  let monthStr = months[month - 1];
  if (!isLarge) monthStr = monthStr.substring(0, 3);
  return `${monthStr} ${year}`
}

function getCustomMonthInitials(monthId: number, isLarge: boolean): string {
  if (isLarge) {
    return months[monthId - 1].substring(0, 3);
  } else {
    return months[monthId - 1].substring(0, 2);
  }
}

// 'YYYY-MM-DD' -> 'DD/MM/YY', for narrow screens where the ISO date
// doesn't fit (day may be 'XX' when it doesn't matter)
function formatCompactDate(isoDate: string): string {
  const [year, month, day] = isoDate.split(/[-/]/);
  return `${day}/${month}/${year.slice(2)}`;
}

function parseDate(dateString: string): { year: string, month: string } {
  // This will parse dates of the following forms:
  // YYYY-MM-DD and YYYY/MM/DD
  const parsed = dateString.split(/[-/]/);
  return { year: parsed[0], month: parsed[1] }
}
