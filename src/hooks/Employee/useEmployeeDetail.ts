import { useQuery } from '@tanstack/react-query';
import { getEmployeeById } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

interface Props {
  id?: string;
  enabled?: boolean;
}

export const useEmployeeDetail = ({ id, enabled = true }: Props) => {

  return useQuery({
    queryKey: ['employees-detail', id],
    enabled:  !!id && enabled,

    queryFn: async () => {
      const res = await getEmployeeById(id!);
      return res.collection;
    },
  });
};
