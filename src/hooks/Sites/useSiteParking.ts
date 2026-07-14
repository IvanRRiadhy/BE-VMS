import { useQuery } from '@tanstack/react-query';
import { getSiteParking } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSiteParking = () => {
  const query = useQuery({
    queryKey: ['site-parkings'],
    queryFn: async () => {
      const res = await getSiteParking();
      return res.collection ?? [];
    },
  });

  return {
    siteParking: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
