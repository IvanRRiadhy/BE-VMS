import { useQuery } from '@tanstack/react-query';
import { getAllSite } from 'src/customs/api/admin';

export const useSites = () =>
  useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await getAllSite();
      return res.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });