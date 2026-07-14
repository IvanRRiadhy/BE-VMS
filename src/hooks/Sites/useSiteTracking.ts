import { useQuery } from '@tanstack/react-query';
import { getSiteTracking } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSiteTracking = () => {

  const query = useQuery({
    queryKey: ['site-trackings'],
    queryFn: async () => {
      const res = await getSiteTracking();
      return res.collection ?? [];
    },
  });

  return {
    siteTracking: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
