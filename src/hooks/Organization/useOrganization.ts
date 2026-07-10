import { useQuery } from '@tanstack/react-query';
import { getAllOrganizations } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useOrganization = () => {
  const { token } = useSession();

  const query = useQuery({
    queryKey: ['organizations', 'options'],
    enabled: !!token,
    queryFn: async () => {
      const res = await getAllOrganizations(token!);
      return res?.collection ?? [];
    },
  });

  return {
    organizations: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
