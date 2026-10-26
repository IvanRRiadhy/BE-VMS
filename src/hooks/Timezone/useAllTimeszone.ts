import { useQuery } from '@tanstack/react-query';
import { getAllTimezone } from 'src/customs/api/admin';

export const useAllTimezone = () => {
    return useQuery({
        queryKey: ['timezone'],
        queryFn: async () => {
            const res = await getAllTimezone();
            return res.collection;
        }
    });
};