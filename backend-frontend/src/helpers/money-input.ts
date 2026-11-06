export {
  formatCentsInput,
  formatMoneyInput,
  parseMoneyInput,
};

// -------------------------------------------------------------------
// Helpers for the "cents mask" used by the amount fields in
// ExpenseForm: the user types digits only and they fill in from the
// right (5 -> 0,05 -> 0,50 -> 5,00). Only digits are needed, so the
// numeric keypad works on any phone, and there is no ambiguity about
// which character is the decimal separator.
//
// Formatting follows the browser locale (locale = undefined), the same
// rule customlocaleString uses for the expense list, so the form and
// the list always look alike. The locale parameter exists for tests.
// -------------------------------------------------------------------

// amount_paid is numeric(7,2): at most 99999.99 -> 7 digits
const MAX_DIGITS = 7;

function getFormatter(locale?: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Re-format whatever is in the input after a keystroke or paste.
// Non-digits are dropped and the digits are read as cents. A zero
// amount becomes an empty field — otherwise backspace could never
// clear it ("0,0" would turn back into "0,00").
function formatCentsInput(text: string, locale?: string): string {
  const digits = text.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS);
  if (digits === '') return '';

  return getFormatter(locale).format(Number(digits) / 100);
}

// Format a stored amount (e.g. "1234.50" from the API / query string)
// as the initial value of the field. Empty stays empty.
function formatMoneyInput(value: string | number | null | undefined, locale?: string): string {
  if (value === null || value === undefined || value === '') return '';

  const num = Number(value);
  if (Number.isNaN(num)) return '';

  return getFormatter(locale).format(num);
}

// Read the masked text back as a number for validation/submission.
// Returns undefined for an empty field so Yup's .required() applies.
function parseMoneyInput(text: unknown): number | undefined {
  if (typeof text === 'number') return text;
  if (typeof text !== 'string') return undefined;

  const digits = text.replace(/\D/g, '');
  if (digits === '') return undefined;

  return Number(digits) / 100;
}
