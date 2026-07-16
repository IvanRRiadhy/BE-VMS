import { useQuery } from '@tanstack/react-query';
import { getVisitorEmployee } from 'src/customs/api/admin';

export const useVisitorEmployees = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['visitor-employees'],
    queryFn: async () => {
      const res = await getVisitorEmployee();
      return res.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });

  return {
    allVisitorEmployee: data ?? [],
    loading: isLoading,
  };
};