import { authorizedFetch } from '@/lib/apiClient';




export async function GetBankAccountType() {
  return authorizedFetch(`/admin/get-account-type`, {
    method: 'GET',
  });
}


export async function AddBankAccountType(data) {
  return authorizedFetch(`/admin/add-account-type`, {
    body:JSON.stringify(data),
    method: 'POST',
  });
}


export async function EditBankAccountType(data) {
  return authorizedFetch(`/admin/edit-account-type`, {
    body:JSON.stringify(data),
    method: 'POST',
  });
}


export async function DeleteBankAccountType(id) {
  return authorizedFetch(`/admin/delete-account-type`, {
    body:JSON.stringify({id}),
    method: 'POST',
  });
}


export async function ChangeStatusAccountType(id , status) {
  console.log("hiting api" , status)
  return authorizedFetch(`/admin/change-status-account-type`, {
    body:JSON.stringify({id , status}),
    method: 'POST',
  });
}


//Vehicle Management

export async function GetAllVehicleData() {
  return authorizedFetch(`/admin/get-all-vehicle`, {
    method: 'GET',
  });
}



export async function AddNewVehicle(data) {
  return authorizedFetch(`/admin/add-vehicle-price`, {
    body:JSON.stringify(data),
    method: 'POST',
  });
}


export async function EditVehiclePrice(data) {
  return authorizedFetch(`/admin/edit-vehicle-price`, {
    body:JSON.stringify(data),
    method: 'POST',
  });
}

//delete-vehicle-type

export async function DeleteVehicleType(id) {
  return authorizedFetch(`/admin/delete-vehicle-type`, {
    body:JSON.stringify({id}),
    method: 'POST',
  });
}




export async function dashboardState(scope) {
  return authorizedFetch(`/admin/dashboard-state?scope=${scope}`, {
    method: 'GET',
  });
}

//recent-order

export async function RecentOrder(limit) {
  return authorizedFetch(`/admin/recent-order?limit=${limit}`, {
    method: 'GET',
  });
}

//weekly-performance
export async function TopRider() {
  return authorizedFetch(`/admin/top-rider`, {
    method: 'GET',
  });
}

export async function Performance() {
  return authorizedFetch(`/admin/weekly-performance`, {
    method: 'GET',
  });
}



export async function GetChatBoxs() {
  return authorizedFetch(`/admin/get-all-chatbox`, {
    method: 'GET',
  });
}




export async function getChatBoxsById(id ,page = null, limit = null, filter = {}) {
  const query = new URLSearchParams();
  if (Object.keys(filter).length === 0) {
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
  }
  if (Object.keys(filter).length > 0) {
    query.append("filter", JSON.stringify(filter));
  }
  return authorizedFetch(`/admin/get-chat-by-id?chatBoxId=${id}&type=admin&${query.toString()}`, {
    method: "GET",
  });
}


export async function AddMessage(data) {
  return authorizedFetch(`/admin/add-message`, {
    body:JSON.stringify(data),
    method: 'POST',
  });
}
