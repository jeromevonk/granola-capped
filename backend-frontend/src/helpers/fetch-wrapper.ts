import { userService } from 'src/services';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const fetchWrapper = {
  get,
  post,
  put,
  patch,
  delete: _delete
};

function get<T = unknown>(url: string): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: authHeader(url)
  };
  return fetch(url, requestOptions).then(handleResponse) as Promise<T>;
}

function post<T = unknown>(url: string, body?: unknown): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(url) },
    credentials: 'include',
    body: JSON.stringify(body)
  };
  return fetch(url, requestOptions).then(handleResponse) as Promise<T>;
}

function put<T = unknown>(url: string, body?: unknown): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(url) },
    body: JSON.stringify(body)
  };
  return fetch(url, requestOptions).then(handleResponse) as Promise<T>;
}

function patch<T = unknown>(url: string, body?: unknown): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(url) },
    body: JSON.stringify(body)
  };
  return fetch(url, requestOptions).then(handleResponse) as Promise<T>;
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete<T = unknown>(url: string, body?: unknown): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader(url) },
    body: JSON.stringify(body)
  };
  return fetch(url, requestOptions).then(handleResponse) as Promise<T>;
}

// helper functions

function authHeader(url: string): Record<string, string> {
  // return auth header with jwt if user is logged in and request is to the api url
  const user = userService.userValue;
  const isLoggedIn = user?.token;
  const isApiUrl = url.startsWith(apiUrl ?? '');
  if (isLoggedIn && isApiUrl) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
}

function handleResponse(response: Response): Promise<unknown> {
  return response.text().then(text => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      if ([401, 403].includes(response.status) && userService.userValue) {
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        userService.logout();
      }

      return Promise.reject(new Error((data?.message) || response.statusText));
    }

    return data;
  });
}
