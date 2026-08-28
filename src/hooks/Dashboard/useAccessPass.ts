import { useQuery } from '@tanstack/react-query';
import { getAccessPass } from 'src/customs/api/admin';

export const useAccessPass = () => {
  const query = useQuery({
    queryKey: ['access-pass'],
    queryFn: getAccessPass,
  });

  return {
    accessPass: query.data?.collection ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
