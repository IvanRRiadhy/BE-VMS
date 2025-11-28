import axiosInstance from 'src/customs/api/interceptor';

export const getDeliveryStaffRegister = async (token: string, id?: string): Promise<any> => {
  const params = id ? { 'delivery-schedule-id': id } : {}; // hanya kirim kalau ada id

  const response = await axiosInstance.get('/delivery-staff-registered', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const getDeliveryStaffRegisterById = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.get(`/delivery-staff-registered/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const createDeliveryStaffRegister = async (token: string, data: any): Promise<any> => {
  const response = await axiosInstance.post('/delivery-staff-registered', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const updateDeliveryStaffRegister = async (
  token: string,
  data: any,
  id: string,
): Promise<any> => {
  const response = await axiosInstance.put('/delivery-staff-registered/' + id, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const deleteDeliveryStaffRegister = async (token: string, id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/delivery-staff-registered/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
