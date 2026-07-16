import { useQuery } from '@tanstack/react-query';
import { getAllVisitorType } from 'src/customs/api/admin';

export const useVisitorType = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['visitor-type'],
    queryFn: async () => {
      const res = await getAllVisitorType();
      return res.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });

  return {
    visitorType: data ?? [],
    loading: isLoading,
  };
};