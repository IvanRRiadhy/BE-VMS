import { useQuery } from '@tanstack/react-query';
import { getAllUserGroup } from 'src/customs/api/admin';

const useUserGroup = () => {
    return useQuery({
        queryKey: ['users-groups'],
        queryFn: async () => {
            const res = await getAllUserGroup();
            return res?.collection ?? [];
        },
    });
};

export default useUserGroup;