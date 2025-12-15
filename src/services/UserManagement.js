// services/driverManagement.js
import { authorizedFetch } from '@/lib/apiClient';

// Get All Drivers
export async function getAlluser(page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();

  // ✅ Always include page & limit
  if (page) query.append("page", page);
  if (limit) query.append("limit", limit);

  // ✅ Pass filters as JSON string
  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }

  return authorizedFetch(`/admin/get-all-user?${query.toString()}`, {
    method: "GET",
  });
}




export async function getdriverById(id) {
  return authorizedFetch(`/admin/get-user?id=${id}`, {
    method: 'GET',
  });
}//get-user-apply-job
export async function getPostJobData(id, page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();
  if (Object.keys(filter).length === 0) {
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
  }
  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }
  return authorizedFetch(`/admin/get-user-post-job?userId=${id}&${query.toString()}`, {
    method: "GET",
  });
}


export async function getApplyJobData(id, page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();
  if (Object.keys(filter).length === 0) {
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
  }
  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }
  return authorizedFetch(`/admin/get-user-apply-job?userId=${id}&${query.toString()}`, {
    method: "GET",
  });
}

export async function changeStatus(id, isActive) {
  console.log("api call ->", id, isActive);

  let body = { id };

  body.block = !isActive;

  return authorizedFetch(`/admin/change-user-status`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}



export async function getdriverState(id) {
  return authorizedFetch(`/admin/get-driver-trip-state?driverId=${id}`, {
    method: 'GET',
  });
}