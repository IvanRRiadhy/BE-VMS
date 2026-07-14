import axiosInstance from '../../interceptor';

export const getAllVisitorRole = async () => {
  const response = await axiosInstance.get('/visitor-roles/active');
  return response.data;
};

export const getVisitorRole = async () => {
  const response = await axiosInstance.get(`/visitor-roles`);
  return response.data;
};

export const getVisitorRoleById = async ( id: string) => {
  const response = await axiosInstance.get(`/visitor-roles/${id}`);
  return response.data;
};

export const getVisitorRoleByDt = async (
  start: number,
  length: number,
  sort_dir: string,
  keyword?: string,
  role?: string,
) => {
  const response = await axiosInstance.get(`/visitor-roles/dt`, {
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

export const updateVisitorRole = async ( id: string, data: any) => {
  const response = await axiosInstance.put(`/visitor-roles/${id}`, data);
  return response.data;
};
