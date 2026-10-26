import axiosInstance from 'src/customs/api/interceptor';

export const getDeliveryStaffRegister = async (id?: string): Promise<any> => {
  const params = id ? { 'delivery-schedule-id': id } : {}; // hanya kirim kalau ada id

  const response = await axiosInstance.get('/delivery-staff-registered', {
    params,
  });

  return response.data;
};

export const getDeliveryStaffRegisterById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/delivery-staff-registered/${id}`);

  return response.data;
};

export const createDeliveryStaffRegister = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/delivery-staff-registered', data);

  return response.data;
};

export const updateDeliveryStaffRegister = async (data: any, id: string): Promise<any> => {
  const response = await axiosInstance.put('/delivery-staff-registered/' + id, data);

  return response.data;
};

export const deleteDeliveryStaffRegister = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/delivery-staff-registered/${id}`);

  return response.data;
};
