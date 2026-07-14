import { useQuery } from '@tanstack/react-query';
import { getProfile } from 'src/customs/api/users';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getProfile();
      return response;
    },

    select: (response) => response.collection,
    staleTime: 5 * 60 * 1000,
  });
};
