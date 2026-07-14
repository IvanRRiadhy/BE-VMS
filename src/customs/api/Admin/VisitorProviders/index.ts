import axiosInstance from '../../interceptor';

export const getAllVisitorProviders = async () => {
  const response = await axiosInstance.get('/visitor-provider');
  return response.data;
};

export const getVisitorProviders = async () => {
  const response = await axiosInstance.get(`/visitor-provider`);
  return response.data;
};

export const getVisitorProvidersById = async (id: string) => {
  const response = await axiosInstance.get(`/visitor-provider/${id}`);
  return response.data;
};

export const getVisitorProvidersByDt = async (
  start: number,
  length: number,
  sort_dir: string,
  keyword?: string,
  role?: string,
) => {
  const response = await axiosInstance.get(`/visitor-provider/dt`, {
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

export const updateVisitorProviders = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/visitor-provider/${id}`, data);
  return response.data;
};

export const createVisitorProvider = async (data: any) => {
  const response = await axiosInstance.post(`/visitor-provider`, data);
  return response.data;
};

export const uploadLogoVisitorProvider = async (id: string, data: any): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('faceimage', data);
    const response = await axiosInstance.post(`/visitor-provider/upload/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload Image Site Response:', response.data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteVisitorProvider = async (id: string) => {
  const response = await axiosInstance.delete(`/visitor-provider/${id}`);
  return response.data;
};
