import { authorizedFetch } from '@/lib/apiClient';



export async function getAllJob(page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();

  // ✅ Always include page & limit
  if (page) query.append("page", page);
  if (limit) query.append("limit", limit);

  // ✅ Pass filters as JSON string
  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }

  return authorizedFetch(`/admin/get-all-job?${query.toString()}`, {
    method: "GET",
  });
}

export async function gejobById(id) {
  return authorizedFetch(`/admin/get-job-by-id?id=${id}`, {
    method: 'GET',
  });
}

export async function GetAllBusRide(page = null, limit = null, filter = {}) {
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

  return authorizedFetch(`/admin/get-all-bus-ride?${query.toString()}`, {
    method: "GET",
  });
}