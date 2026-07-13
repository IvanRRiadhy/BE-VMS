import { useQuery } from '@tanstack/react-query';
import { getSiteParking } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSiteParking = () => {
  const { token } = useSession();

  const query = useQuery({
    queryKey: ['site-parkings'],
    enabled: !!token,
    queryFn: async () => {
      const res = await getSiteParking(token!);
      return res.collection ?? [];
    },
  });

  return {
    siteParking: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
