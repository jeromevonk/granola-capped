import { fetchWrapper } from 'src/helpers';
import type { Category } from 'src/types';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/categories`;

export const categoryService = {
  getCategories,
  createCategory,
  editCategory,
  deleteCategory,
};

// Caching is handled by the query cache (see src/hooks/queries.ts);
// services are plain fetch functions
function getCategories(): Promise<Category[]> {
  return fetchWrapper.get<Category[]>(baseUrl);
}

function createCategory(category: { parentId: number | null, title: string }): Promise<Category[]> {
  return fetchWrapper.post<Category[]>(baseUrl, category);
}

function editCategory(categoryId: number, title: string): Promise<Category[]> {
  return fetchWrapper.patch<Category[]>(`${baseUrl}/${categoryId}`, { title });
}

function deleteCategory(categoryId: number): Promise<number> {
  return fetchWrapper.delete<number>(`${baseUrl}/${categoryId}`);
}
