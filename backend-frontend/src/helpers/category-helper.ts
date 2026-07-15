import { sortTitleAlphabetically } from './utils';
import type { Category, CategoryTitles } from 'src/types';

export {
  getCategoryTitles,
  getParentCategoryId,
  getMainCategories,
  getSubCategories,
};

type CategoryOption = Pick<Category, 'id' | 'title'>;

function getCategoryTitles(categories: Category[], categoryId: number): CategoryTitles {
  const cat = categories.find(item => item.id === categoryId);
  const parentCat = categories.find(item => item.id === cat?.parentId);

  return {
    parentCategoryTitle: parentCat?.title,
    categoryTitle: cat?.title
  }
}

function getParentCategoryId(categories: Category[], subCategoryId: number): number | undefined {
  const subCat = categories.find(item => item.id === subCategoryId);
  const mainCat = categories.find(item => item.id === subCat?.parentId);

  return mainCat?.id;
}

function getMainCategories(categories: Category[]): CategoryOption[] {
  const mainCategories: CategoryOption[] = []
  for (const item of categories) {
    if (item.parentId === null) {
      mainCategories.push({
        title: item.title,
        id: item.id
      });
    }
  }

  return mainCategories.sort(sortTitleAlphabetically);
}

function getSubCategories(categories: Category[], mainCategoryId: number | string): CategoryOption[] {
  const subCategories: CategoryOption[] = [];

  for (const item of categories) {
    if (item.parentId === mainCategoryId) {
      subCategories.push({
        title: item.title,
        id: item.id
      });
    }
  }

  return subCategories.sort(sortTitleAlphabetically);
}
