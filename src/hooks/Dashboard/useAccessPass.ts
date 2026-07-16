import { useQuery } from '@tanstack/react-query';
import { getAccessPass } from 'src/customs/api/admin';

export const useAccessPass = () => {
  const query = useQuery({
    queryKey: ['access-pass'],
    queryFn: async () => {
      const res = await getAccessPass();
      return res ?? [];
    },
    staleTime: 1 * 60 * 1000,
  });

  return {
    accessPass: query.data ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
