import axiosInstance from 'src/customs/api/interceptor';

export const getSettingVms = async (): Promise<any> => {
    const response = await axiosInstance.get('/setting/vms');
    return response.data;
};

// update vms

export const updateSettingVms = async (
    data: any,
): Promise<any> => {
    try {
        const response = await axiosInstance.put(`/setting/vms`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
