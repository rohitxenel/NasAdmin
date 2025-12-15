import { authorizedFetch } from '@/lib/apiClient';

// Get AllUser
export async function getAllUser() {
  return authorizedFetch(`/admin/get-all-user`, {
    method: 'GET',
  });
}

export async function getAllUserById(id) {
  return authorizedFetch(`/admin/get-user-id?id=${id}`, {
    method: 'GET',
  });
}

export async function getAllUserTripById(id) {
  return authorizedFetch(`/admin/get-user-trips?userId=${id}`, {
    method: 'GET',
  });
}
