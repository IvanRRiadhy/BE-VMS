import { useQuery } from '@tanstack/react-query';
import { getSitesTracking } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSitesTracking = () => {

  return useQuery({
    queryKey: ['sites-tracking'],
    queryFn: () => getSitesTracking(),
  });
};
