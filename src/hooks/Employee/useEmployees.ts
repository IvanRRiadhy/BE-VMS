import { useQuery } from '@tanstack/react-query';
import { getAllEmployee } from 'src/customs/api/admin';

export const useEmployees = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await getAllEmployee();
      return res.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });

  return {
    employee: data ?? [],
    loading: isLoading,
  };
};