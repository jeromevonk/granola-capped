export {
  capitalizeFirstLetter,
  customlocaleString,
  sortTitleAlphabetically,
  getComparator,
};

function capitalizeFirstLetter(string: string): string {
  return string[0].toUpperCase() + string.slice(1);
}

function customlocaleString(value: string | number): string {
  if (typeof value === 'string') {
    value = Number(value);
  }

  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sortTitleAlphabetically(a: { title: string }, b: { title: string }): number {
  // See https://stackoverflow.com/a/37511463/660711
  const x = a.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const y = b.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (x > y) {
    return 1;
  }
  if (x < y) {
    return -1;
  }

  return 0;
}

// Rows are heterogeneous (expense rows, report rows), so the comparator
// stays structurally loose on purpose
type SortableRow = Record<string, unknown>;

function getComparator(order: 'asc' | 'desc', orderBy: string) {
  return order === 'desc'
    ? (a: SortableRow, b: SortableRow) => descendingComparator(a, b, orderBy)
    : (a: SortableRow, b: SortableRow) => -descendingComparator(a, b, orderBy);
}

const textHeadCells = ['date', 'description', 'categoryText', 'category'];

function descendingComparator(a: SortableRow, b: SortableRow, orderBy: string): number {
  let x, y;

  if (textHeadCells.includes(orderBy)) {
    x = a[orderBy] as string | number;
    y = b[orderBy] as string | number;
  } else {
    // Must convert to a number in order to compare correctly
    x = Number(a[orderBy]);
    y = Number(b[orderBy]);
  }

  if (y < x) {
    return -1;
  }

  if (y > x) {
    return 1;
  }

  return 0;
}
