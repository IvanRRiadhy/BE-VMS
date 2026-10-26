import { useQuery } from '@tanstack/react-query';
import { getAllDepartments } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDepartment = () => {
  const query = useQuery({
    queryKey: ['departments', 'options'],
    queryFn: async () => {
      const res = await getAllDepartments();
      return res?.collection ?? [];
    },
  });

  return {
    department: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
