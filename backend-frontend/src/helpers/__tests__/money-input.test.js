import { describe, it, expect } from 'vitest';
import { formatCentsInput, formatMoneyInput, parseMoneyInput } from 'src/helpers/money-input';

describe('formatCentsInput', () => {
  it('fills digits in from the right as cents', () => {
    expect(formatCentsInput('5', 'pt-BR')).toBe('0,05');
    expect(formatCentsInput('0,050', 'pt-BR')).toBe('0,50');
    expect(formatCentsInput('0,500', 'pt-BR')).toBe('5,00');
    expect(formatCentsInput('123456', 'pt-BR')).toBe('1.234,56');
  });

  it('follows the locale separators', () => {
    expect(formatCentsInput('123456', 'en-US')).toBe('1,234.56');
  });

  it('ignores non-digits, so pasting a formatted value works', () => {
    expect(formatCentsInput('R$ 1.234,56', 'pt-BR')).toBe('1.234,56');
  });

  it('clears the field when the amount becomes zero (backspace)', () => {
    expect(formatCentsInput('0,0', 'pt-BR')).toBe('');
    expect(formatCentsInput('', 'pt-BR')).toBe('');
  });

  it('caps at 7 digits (numeric(7,2)), ignoring extra keystrokes', () => {
    expect(formatCentsInput('99.999,990', 'pt-BR')).toBe('99.999,99');
  });
});

describe('formatMoneyInput', () => {
  it('formats a stored amount as the initial field value', () => {
    expect(formatMoneyInput('1234.50', 'pt-BR')).toBe('1.234,50');
    expect(formatMoneyInput('0', 'pt-BR')).toBe('0,00');
    expect(formatMoneyInput(12.5, 'en-US')).toBe('12.50');
  });

  it('keeps empty or invalid values empty', () => {
    expect(formatMoneyInput('', 'pt-BR')).toBe('');
    expect(formatMoneyInput(undefined, 'pt-BR')).toBe('');
    expect(formatMoneyInput('abc', 'pt-BR')).toBe('');
  });
});

describe('parseMoneyInput', () => {
  it('reads the masked text back as a number', () => {
    expect(parseMoneyInput('1.234,56')).toBe(1234.56);
    expect(parseMoneyInput('1,234.56')).toBe(1234.56);
    expect(parseMoneyInput('0,05')).toBe(0.05);
  });

  it('returns undefined for an empty field', () => {
    expect(parseMoneyInput('')).toBeUndefined();
    expect(parseMoneyInput(undefined)).toBeUndefined();
  });

  it('passes numbers through', () => {
    expect(parseMoneyInput(12.5)).toBe(12.5);
  });
});
