import { fetchWrapper } from 'src/helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/categories`;

export const categoryService = {
  getCategories,
  createCategory,
  editCategory,
  deleteCategory,
};

// Caching is handled by the query cache (see src/hooks/queries.js);
// services are plain fetch functions
function getCategories() {
  return fetchWrapper.get(baseUrl);
}

function createCategory(category) {
  return fetchWrapper.post(baseUrl, category);
}

function editCategory(categoryId, title) {
  return fetchWrapper.patch(`${baseUrl}/${categoryId}`, { title });
}

function deleteCategory(categoryId) {
  return fetchWrapper.delete(`${baseUrl}/${categoryId}`);
}
