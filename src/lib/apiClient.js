import { API_BASE_URL } from './apiConfig';
import { getTokenFromCookies } from './getTokenFromCookies';

export async function authorizedFetch(path, options = {}) {
  const token = getTokenFromCookies();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // If the response is not JSON (e.g. empty body), handle gracefully
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) throw new Error(data?.message || 'Request failed');

  return data;
}
