import axiosInstance from '../../interceptor';

export const getAllVisitorRole = async (token: string) => {
  const response = await axiosInstance.get('/visitor-roles/active', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorRole = async (token: string) => {
  const response = await axiosInstance.get(`/visitor-roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorRoleById = async (token: string, id: string) => {
  const response = await axiosInstance.get(`/visitor-roles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorRoleByDt = async (
  token: string,
  start: number,
  length: number,
  sort_dir: string,
  keyword?: string,
  role?: string,
) => {
  const response = await axiosInstance.get(`/visitor-roles/dt`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      start,
      length,
      sort_dir,
      ...(keyword && { 'search[value]': keyword }),
      ...(role && { role }),
    },
  });

  return response.data;
};

export const updateVisitorRole = async (token: string, id: string, data: any) => {
  const response = await axiosInstance.put(`/visitor-roles/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
