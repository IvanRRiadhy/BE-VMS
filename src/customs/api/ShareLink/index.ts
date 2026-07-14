import axiosInstance from '../interceptor';

export const getShareLink = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/visitor-share-link');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

// get by id
export const getShareLinkById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/visitor-share-link/${id}`);
  return response.data;
};

// get by dt
export const getShareLinkByDt = async (
  start: number,
  length: number,
  keyword: string = '',
  sortDir: string,
): Promise<any> => {
  const response = await axiosInstance.get(`/visitor-share-link/dt`, {

    params: {
      start,
      length,
      // 'search[value]': keyword,
      ...(keyword && { 'search[value]': keyword }),
      sort_dir: sortDir,
      // 'start-date': startDate,
      // 'end-date': endDate,
    },
  });
  return response.data;
};

export const createShareLink = async ( data: any): Promise<any> => {
  const response = await axiosInstance.post('/visitor-share-link/new', data);
  return response.data;
};

// create by email
export const createShareLinkByEmail = async ( data: any): Promise<any> => {
  const response = await axiosInstance.post('/visitor-share-link/new/send-email', data);
  return response.data;
};

export const createShareLinkByEmailById = async (

  data: any,
  id: string,
): Promise<any> => {
  const response = await axiosInstance.post(`/visitor-share-link/send-email/${id}`, data);
  return response.data;
};

// Delete
export const deleteShareLink = async ( id: string): Promise<any> => {
  const response = await axiosInstance.delete('/visitor-share-link/' + id);
  return response.data;
};
