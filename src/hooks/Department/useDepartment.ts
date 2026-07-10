import { useQuery } from '@tanstack/react-query';
import { getAllDepartments } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDepartment = () => {
  const { token } = useSession();

  const query = useQuery({
    queryKey: ['departments', 'options'],
    enabled: !!token,
    queryFn: async () => {
      const res = await getAllDepartments(token!);
      return res?.collection ?? [];
    },
  });

  return {
    department: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
