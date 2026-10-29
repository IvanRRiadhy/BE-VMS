//Assembly Point
import axiosInstance from 'src/customs/api/interceptor';

export const getAssemblyPoint = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/evacuate/assembly-points');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAssemblyPointById = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/evacuate/assembly-points/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAssemblyPointDt = async (
  start: number,
  length: number,
  sort_dir?: string,
  keyword?: string,
): Promise<any> => {
  if (keyword) keyword = keyword.trim();

  const params: any = {
    start,
    length,
    sort_dir,
  };

  if (keyword) {
    params['search[value]'] = keyword;
  }

  try {
    const response = await axiosInstance.get('/evacuate/assembly-points/dt', {
      params,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAssemblyPoint = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/evacuate/assembly-points', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAssemblyPoint = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/evacuate/assembly-points/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAssemblyPoint = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/evacuate/assembly-points/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Personal Report
export const getPersonalReport = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/evacuate/${id}/report`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// History
export const getHistory = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/evacuate/history/chart/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createHistoryChart = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/evacuate/history`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const startEvacuate = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/evacuate/trigger`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get active
export const getActive = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/evacuate/active');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get evacuate by id
export const getEvacuateById = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/evacuate/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// confirm visitor
export const confirmVisitor = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/evacuate/confirm-visitor`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// confirm employee
export const confirmEmployee = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/evacuate/confirm-employee`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// end evacuate
export const endEvacuate = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/evacuate/complete`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
