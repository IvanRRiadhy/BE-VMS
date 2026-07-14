import axiosInstance from '../../interceptor';

export const getActivities = async (
  start: number,
  length: number,
  start_date: string,
  end_date: string,
): Promise<any> => {
  const params = {
    start,
    length,
    'start-date': start_date,
    'end-date': end_date,
  };
  const response = await axiosInstance.get('/dashboard/today/activities', {
    params,
  });
  return response.data;
};
