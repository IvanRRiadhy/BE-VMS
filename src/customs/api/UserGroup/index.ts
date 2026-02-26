import axiosInstance from '../interceptor';

export const getAllPermissionAccessControl = async (
  token: string,
  groupId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user-group-access-control/group/' + groupId, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPermissionAccessControlById = async (id: string, token: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-access-control/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createPermissionAccessControl = async (
  token: string,
  data: any,
  groupId: string,
): Promise<any> => {
  const response = await axiosInstance.post('/user-group-access-control/group/' + groupId, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deletePermissionAccessControl = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-access-control/group/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAllPermissionVisitorType = async (token: string, groupId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user-group-visitortype/group/' + groupId, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPermissionVisitorTypeById = async (id: string, token: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-visitortype/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createPermissionVisitorType = async (
  token: string,
  data: any,
  groupId: string,
): Promise<any> => {
  const response = await axiosInstance.post('/user-group-visitortype/group/' + groupId, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deletePermissionVisitorType = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-visitortype/group/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
