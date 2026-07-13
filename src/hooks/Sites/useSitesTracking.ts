import { useQuery } from '@tanstack/react-query';
import { getSitesTracking } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSitesTracking = () => {
  const { token } = useSession();

  return useQuery({
    queryKey: ['sites-tracking'],
    enabled: !!token,
    queryFn: () => getSitesTracking(token!),
  });
};
