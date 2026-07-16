import type { EvolutionEntry } from 'src/types';

export {
  manipulateData,
};

type DateType = 'year' | 'month';
type ChartRow = [string, number];
type ChartData = [[string, string], ...ChartRow[]];

interface ManipulateOptions {
  evolutionDateType: DateType;
  hideEmptyMonths: boolean;
}

interface YearRange {
  minYear: number;
  maxYear: number;
  startingMonth: number;
  endingMonth?: number;
}

function manipulateData({ evolutionDateType: dateType, hideEmptyMonths }: ManipulateOptions, inputData: EvolutionEntry[]): ChartData {
  // Add column names as the first entry
  const outputData: ChartData = [["Date", "Spent"]];

  // -------------------------------------------------------------------
  // hideEmptyMonths == false will make the chart 'continuous'
  // meaning every year and month in the range will be represented
  // if hideEmptyMonths == true, months with spent = 0 might be skipped
  // -------------------------------------------------------------------
  if (hideEmptyMonths) {
    for (const entry of inputData) {
      outputData.push(getFormatedEntry(entry, dateType))
    }

    return outputData;
  }

  if (inputData.length > 0) {
    // First, get minimum and maximum dates
    const yearRange = getRange(inputData)

    if (dateType === 'year') {
      addDataYearType(yearRange, inputData, outputData, dateType);
    } else {
      addDataMonthType(yearRange, inputData, outputData, dateType);
    }
  }

  return outputData;
}

function getRange(data: EvolutionEntry[]): YearRange {
  return data.reduce<YearRange>((prev, current) => {
    return {
      minYear: Math.min(prev.minYear, current.year),
      maxYear: Math.max(prev.maxYear, current.year),
      startingMonth: current.year < prev.minYear ? (current.month ?? 0) : prev.startingMonth,
      endingMonth: current.month
    }
  }, { minYear: 9999, maxYear: 0, startingMonth: 0 });
}

function addDataYearType({ minYear, maxYear }: YearRange, inputData: EvolutionEntry[], outputData: ChartData, dateType: DateType): void {
  for (let year = minYear; year <= maxYear; year++) {
    const entry = inputData.find(item => item.year === year);
    addToDataArray(outputData, entry, year, null, dateType);
  }
}

function addDataMonthType({ minYear, maxYear, startingMonth, endingMonth }: YearRange, inputData: EvolutionEntry[], outputData: ChartData, dateType: DateType): void {
  for (let year = minYear; year <= maxYear; year++) {
    for (let month = getStartingMonth(year, minYear, startingMonth); month <= getEndingMonth(year, maxYear, endingMonth ?? 12); month++) {
      const entry = inputData.find(item => item.year === year && item.month === month);
      addToDataArray(outputData, entry, year, month, dateType);
    }
  }
}

function addToDataArray(outputData: ChartData, entry: EvolutionEntry | undefined, year: number, month: number | null, dateType: DateType): void {
  if (entry) {
    // If data is valid, use it
    outputData.push(getFormatedEntry(entry, dateType));
  } else {
    // Otherwise, add year with Spent = 0
    const emptyEntry: EvolutionEntry = { year, month: month ?? undefined, amountSpent: "0" };
    outputData.push(getFormatedEntry(emptyEntry, dateType));
  }
}

function getFormatedEntry(entry: EvolutionEntry, dateType: DateType): ChartRow {
  return [
    // Year (YYYY) or Year/Month (YYYY/MM)
    dateType === 'year' ? entry.year.toString() : `${entry.year}/${entry.month}`,

    // Amount spent, converted to number
    +entry.amountSpent
  ]
}

function getStartingMonth(year: number, minYear: number, startingMonth: number): number {
  if (year === minYear) return startingMonth;
  return 1;
}

function getEndingMonth(year: number, maxYear: number, endingMonth: number): number {
  if (year === maxYear) return endingMonth;
  return 12;
}
