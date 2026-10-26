import { useQuery } from '@tanstack/react-query';
import { getSitesAccessById } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSiteAccess = (siteId?: string) => {
  return useQuery({
    queryKey: ['site-access', siteId],
    enabled: !!siteId,
    queryFn: () => getSitesAccessById(siteId!),
  });
};
