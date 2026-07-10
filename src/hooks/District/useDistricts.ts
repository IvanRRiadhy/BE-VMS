import { useQuery } from '@tanstack/react-query';
import { getAllDistricts } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDistricts = () => {
  const { token } = useSession();

  const query = useQuery({
    queryKey: ['districts', 'options'],
    enabled: !!token,
    queryFn: async () => {
      const res = await getAllDistricts(token!);
      return res?.collection ?? [];
    },
  });

  return {
    districts: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
