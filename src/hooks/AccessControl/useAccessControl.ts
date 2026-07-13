import { useQuery } from '@tanstack/react-query';
import { getAllAccessControl, getAllDocument } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useAccessControl = () => {
  const { token } = useSession();

  const query = useQuery({
    queryKey: ['access-control'],
    enabled: !!token,
    queryFn: async () => {
      const res = await getAllAccessControl(token!);
      return res.collection ?? [];
    },
  });

  return {
    accessControl: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
