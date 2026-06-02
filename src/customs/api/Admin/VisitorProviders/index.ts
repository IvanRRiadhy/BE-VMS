import axiosInstance from '../../interceptor';

export const getAllVisitorProviders = async (token: string) => {
  const response = await axiosInstance.get('/visitor-provider/active', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorProviders = async (token: string) => {
  const response = await axiosInstance.get(`/visitor-provider`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorProvidersById = async (token: string | null, id: string) => {
  const response = await axiosInstance.get(`/visitor-provider/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVisitorProvidersByDt = async (
  token: string,
  start: number,
  length: number,
  sort_dir: string,
  keyword?: string,
  role?: string,
) => {
  const response = await axiosInstance.get(`/visitor-provider/dt`, {
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

export const updateVisitorProviders = async (token: string, id: string, data: any) => {
  const response = await axiosInstance.put(`/visitor-provider/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createVisitorProvider = async (token: string, data: any) => {
  const response = await axiosInstance.post(`/visitor-provider`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadLogoVisitorProvider = async (
  id: string,
  data: any,
  token: string,
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('faceimage', data);
    const response = await axiosInstance.post(`/visitor-provider/upload/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload Image Site Response:', response.data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteVisitorProvider = async (token: string, id: string) => {
  const response = await axiosInstance.delete(`/visitor-provider/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
