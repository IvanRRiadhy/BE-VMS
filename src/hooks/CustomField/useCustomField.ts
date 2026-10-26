import { useQuery } from '@tanstack/react-query';
import { getAllCustomField } from 'src/customs/api/admin';

export const useCustomField = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['custom-field'],
    queryFn: async () => {
      const res = await getAllCustomField();
      return res.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });

  return {
    customField: data ?? [],
    loading: isLoading,
  };
};