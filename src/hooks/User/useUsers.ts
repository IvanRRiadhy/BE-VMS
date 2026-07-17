import { useQuery } from '@tanstack/react-query';
import { getAllUser } from 'src/customs/api/admin';

const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await getAllUser();

            return {
                collection: response.collection,
            };
        },
    });
};

export default useUsers;