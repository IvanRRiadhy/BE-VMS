import { useQuery } from '@tanstack/react-query';
import { getListVisitor } from 'src/customs/api/admin';

export const useListVisitor = () => {
  return useQuery({
    queryKey: ['list-visitor'],

    queryFn: async () => {
      const response = await getListVisitor();
      return response.collection ?? [];
    },

    placeholderData: (previousData) => previousData,
  });
};
