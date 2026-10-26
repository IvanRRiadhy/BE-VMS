import { useQuery } from '@tanstack/react-query';
import { getAllAccessControl } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useAccessControl = () => {

  const query = useQuery({
    queryKey: ['access-control'],

    queryFn: async () => {
      const res = await getAllAccessControl();
      return res.collection ?? [];
    },
  });

  return {
    accessControl: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
