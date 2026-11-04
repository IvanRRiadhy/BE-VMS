import axiosInstance from '../../interceptor';

// Admin/Security/Operator
export const getInsightSummary = async (
  start_date: string,
  end_date: string,
  include_details: boolean,
): Promise<any> => {
  try {
    const params = {
      'start-date': start_date,
      'end-date': end_date,
      'include-details': include_details,
    };
    const response = await axiosInstance.get('/dashboard/analytics', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Summary
export const getSummaryCount = async (
  start_date: string,
  end_date: string,
  include_details: boolean,
): Promise<any> => {
  try {
    const params = {
      'start-date': start_date,
      'end-date': end_date,
      'include-details': include_details,
    };
    const response = await axiosInstance.get('/dashboard/overview', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export
export const exportDashboardInsight = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/dashboard/export', data, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Employee

export const getInsightSummaryEmployee = async (
  start_date: string,
  end_date: string,
  include_details: boolean,
): Promise<any> => {
  try {
    const params = {
      'start-date': start_date,
      'end-date': end_date,
      'include-details': include_details,
    };
    const response = await axiosInstance.get('/dashboard-visitor/analytics', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Summary
export const getSummaryCountEmployee = async (
  start_date: string,
  end_date: string,
  include_details: boolean,
): Promise<any> => {
  try {
    const params = {
      'start-date': start_date,
      'end-date': end_date,
      'include-details': include_details,
    };
    const response = await axiosInstance.get('/dashboard-visitor/overview', {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export
export const exportDashboardInsightEmployee = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/dashboard-visitor/export', data, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
