import axiosInstance from 'src/customs/api/interceptor';

//#region Setting VMS
export const getSettingVms = async (): Promise<any> => {
  const response = await axiosInstance.get('/setting/vms');
  return response.data;
};

// update vms

export const updateSettingVms = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/setting/vms`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//#region Setting Apikey

export const getApiKey = async (): Promise<any> => {
  const response = await axiosInstance.get('/setting-apikey');
  return response.data;
};

export const getApiKeyById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/setting-apikey/${id}`);
  return response.data;
};

// reveal api key

export const getApiKeyDT = async (
  start: number,
  length: number,
  sort_column: string,
  sortDir: string,
  keyword: string = '',
): Promise<any> => {
  const params: any = {
    start,
    length,
    sort_dir: sortDir,
  };

  if (sort_column) params.sort_column = sort_column;
  if (keyword) params['search[value]'] = keyword;

  const response = await axiosInstance.get('/setting-apikey/dt', {
    params,
  });

  return response.data;
};

export const createApiKey = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/setting-apikey', data);
  return response.data;
};

export const updateApiKey = async (id: string, data: any): Promise<any> => {
  const response = await axiosInstance.put(`/setting-apikey/${id}`, data);
  return response.data;
};

// update api key active

export const updateApiKeyActive = async (id: string, is_active: boolean): Promise<any> => {
  const response = await axiosInstance.put(`/setting-apikey/${id}/active`, { is_active });

  return response.data;
};

export const updateApiKeyExpired = async (id: string, expired_at: string | null): Promise<any> => {
  const response = await axiosInstance.put(`/setting-apikey/${id}/expired`, { expired_at });

  return response.data;
};

export const deleteApiKey = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/setting-apikey/${id}`);
  return response.data;
};

export const generateApiKeyById = async (id: string): Promise<any> => {
  const response = await axiosInstance.post(`/setting-apikey/${id}/generate`);
  return response.data;
};

export const getRevealById = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/setting-apikey/${id}/reveal`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
