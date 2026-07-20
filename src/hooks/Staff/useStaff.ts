import { useQuery } from '@tanstack/react-query';
import { getAllDriver, getDriverById } from 'src/customs/api/Delivery/Driver';

export const useDriverAll = () => {
    return useQuery({
        queryKey: ['staff'],
        queryFn: getAllDriver,
        select: (data) => data.collection,
    });
};

export const useStaffById = (id?: any) => {
    return useQuery({
        queryKey: ['staff', id],
        queryFn: () => getDriverById(id),
        select: (data) => data.collection.find((item: any) => item.id === id),
    });
};