import { useQuery } from '@tanstack/react-query';
import { getAllDistricts, getAllOrganizations } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDistricts = () => {
  const { token } = useSession();
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const res = await getAllDistricts(token as string);
      return res.collection;
    },
  });
};
