import { useQuery } from '@tanstack/react-query';
import { getSitesParking } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSitesParking = () => {
  return useQuery({
    queryKey: ['sites-parking'],
    queryFn: () => getSitesParking(),
  });
};
