import axios from 'axios';
import axiosInstance from '../interceptor';

export const getReportVisitorTransaction = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/report/visitor-transaction`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // if (axios.isAxiosError(error) && error.response?.status === 400) {
    //   throw error.response.data as ValidationErrorResponse;
    // }
    throw error;
  }
};

// by id
export const getReportVisitorTransactionById = async (token: string, id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/report/visitor-transaction` + `/${id}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // if (axios.isAxiosError(error) && error.response?.status === 400) {
    //   throw error.response.data as ValidationErrorResponse;
    // }
    throw error;
  }
};

// get dt
export const getReportVisitorTransactionDt = async (
  token: string,
  filters?: {
    // draw?: number;
    start?: number;
    length?: number;
    // sort_column?: string;
    sort_dir?: string;
    search?: string;
    // name?: string;
    host?: string;
    user?: string;
  },
): Promise<any> => {
  try {
    const params: any = {
      // draw: filters?.draw ?? 1,
      start: filters?.start ?? 0,
      length: filters?.length ?? 10,
      // sort_column: filters?.sort_column ?? 'name',
      sort_dir: filters?.sort_dir ?? 'desc',
    };

    // Tambahkan field opsional hanya jika ada
    // if (filters?.name) params.name = filters.name;
    if (filters?.search) params['search[value]'] = filters.search;
    if (filters?.host) params.host = filters.host;
    if (filters?.user) params.user = filters.user;

    const response = await axiosInstance.get(`/report/visitor-transaction/dt`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// update
export const updateReportVisitorTransaction = async (
  token: string,
  id: string,
  data: any,
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/report/visitor-transaction` + `/${id}`, data, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        RecordsTotal: 0,
        RecordsFiltered: 0,
        collection: [],
      };
    }
    throw error;
  }
};

export const createReportVisitorTransaction = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/report/visitor-transaction`, data, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // if (axios.isAxiosError(error) && error.response?.status === 400) {
    //   throw error.response.data as ValidationErrorResponse;
    // }
    throw error;
  }
};

export const generateReportVisitorById = async (token: string, id: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `/report/visitor-transaction/generate/${id}`,
      {},
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const generateReportVisitorById = async (
//   token: string,
//   id: string,
//   apiSearch?: string,
// ): Promise<any> => {
//   try {
//     const query = apiSearch ? `?search[value]=${encodeURIComponent(apiSearch)}` : '';

//     const response = await axiosInstance.post(
//       `/report/visitor-transaction/generate/${id}${query}`,
//       {},
//       {
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );

//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// generate export with excel
export const generateReportVisitorWithExcel = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/report/visitor-transaction/generate`, data, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete
export const deleteReportVisitorTransaction = async (token: string, id: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/report/visitor-transaction/${id}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
