import { describe, it, expect } from 'vitest';
import { getCategoryTitles, getParentCategoryId, getMainCategories, getSubCategories } from 'src/helpers/category-helper';

const categories = [
  { id: 1, parentId: null, title: 'Home' },
  { id: 2, parentId: 1, title: 'Rent' },
  { id: 3, parentId: 1, title: 'Água' },     // accent must not break sorting
  { id: 4, parentId: null, title: 'Food' },
  { id: 5, parentId: 4, title: 'Groceries' },
];

describe('getMainCategories', () => {
  it('returns only root categories, sorted alphabetically', () => {
    expect(getMainCategories(categories).map(c => c.title)).toEqual(['Food', 'Home']);
  });
});

describe('getSubCategories', () => {
  it('returns children of the given main category, accent-insensitively sorted', () => {
    // 'Água' normalizes to 'agua' and must sort before 'Rent'
    expect(getSubCategories(categories, 1).map(c => c.title)).toEqual(['Água', 'Rent']);
  });

  it('returns empty array for a category without children', () => {
    expect(getSubCategories(categories, 2)).toEqual([]);
  });
});

describe('getCategoryTitles', () => {
  it('resolves both the category and its parent title', () => {
    expect(getCategoryTitles(categories, 5)).toEqual({
      parentCategoryTitle: 'Food',
      categoryTitle: 'Groceries',
    });
  });

  it('returns undefined titles for an unknown id', () => {
    expect(getCategoryTitles(categories, 999)).toEqual({
      parentCategoryTitle: undefined,
      categoryTitle: undefined,
    });
  });
});

describe('getParentCategoryId', () => {
  it('finds the parent of a sub-category', () => {
    expect(getParentCategoryId(categories, 5)).toBe(4);
  });

  it('returns undefined for a main category (it has no parent)', () => {
    expect(getParentCategoryId(categories, 1)).toBeUndefined();
  });
});
