import axiosInstance from '../interceptor';

export const getAllPermissionAccessControl = async (
  groupId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user-group-access-control/group/' + groupId);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPermissionAccessControlById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-access-control/${id}`);
  return response.data;
};

export const createPermissionAccessControl = async (
  data: any,
  groupId: string,
): Promise<any> => {
  const response = await axiosInstance.post('/user-group-access-control/group/' + groupId, data);
  return response.data;
};

export const deletePermissionAccessControl = async ( id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-access-control/group/${id}`);
  return response.data;
};

export const getAllPermissionVisitorType = async ( groupId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user-group-visitortype/group/' + groupId);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPermissionVisitorTypeById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/user-group-visitortype/${id}`);
  return response.data;
};

export const createPermissionVisitorType = async (
  data: any,
  groupId: string,
): Promise<any> => {
  const response = await axiosInstance.post('/user-group-visitortype/group/' + groupId, data);
  return response.data;
};

export const deletePermissionVisitorType = async ( id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/user-group-visitortype/group/${id}`);
  return response.data;
};
