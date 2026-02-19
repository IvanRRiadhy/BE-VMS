import { useQuery } from '@tanstack/react-query';
import { getAllOrganizations, getAllSite } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSites = () => {
  const { token } = useSession();
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await getAllSite(token as string);
      return res.collection;
    },
  });
};
