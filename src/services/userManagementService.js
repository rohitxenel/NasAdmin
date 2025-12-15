import { authorizedFetch } from '@/lib/apiClient';



export async function getAllUser(page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();

  // ✅ Only include page & limit if filter is empty
  if (Object.keys(filter).length === 0) {
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
  }

  // ✅ Pass filters as JSON string
  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }

  return authorizedFetch(`/admin/get-all-user?${query.toString()}`, {
    method: "GET",
  });
}

export async function getAllUserById(id) {
  return authorizedFetch(`/admin/get-user-id?id=${id}`, {
    method: 'GET',
  });
}


export async function getUserTripState(id) {
  return authorizedFetch(`/admin/get-user-trip-state?userId=${id}`, {
    method: 'GET',
  });
}



export async function getAllUserTripById(userId, page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();

  query.append("userId", userId);

  if (page) query.append("page", page);
  if (limit) query.append("limit", limit);

  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }

  return authorizedFetch(`/admin/get-user-trips?${query.toString()}`, {
    method: "GET",
  });
}



export async function ChangeUserStatus(id , status) {
  console.log("block pass api" , status)
  const block = status === "inactive" ? true : false;
  console.log("block" , block)
  return authorizedFetch(`/admin/change-user-status`, {
    body:JSON.stringify({id, block}),
    method: 'POST',
  });
}