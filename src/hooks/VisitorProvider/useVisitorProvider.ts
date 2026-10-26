import { useQuery } from '@tanstack/react-query';
import { getAllVisitorProviders } from 'src/customs/api/Admin/VisitorProviders';

export const useVisitorProvider = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['visitor-providers'],
    queryFn: async () => {
      const res = await getAllVisitorProviders();

      return (res.collection ?? []).filter(
        (item: any) => item.is_quick_access === true,
      );
    },
    placeholderData: (prev) => prev,
  });

  return {
    visitorProviders: data ?? [],
    loading: isLoading,
  };
};