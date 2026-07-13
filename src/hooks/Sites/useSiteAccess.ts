import { useQuery } from '@tanstack/react-query';
import { getSitesAccessById } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSiteAccess = (siteId?: string) => {
  const { token } = useSession();

  return useQuery({
    queryKey: ['site-access', siteId],
    enabled: !!token && !!siteId,
    queryFn: () => getSitesAccessById(token!, siteId!),
  });
};
