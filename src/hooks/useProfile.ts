import { useQuery } from '@tanstack/react-query';
import { getProfile } from 'src/customs/api/users';

export const useProfile = (token?: string | null) => {
  return useQuery({
    queryKey: ['profile', token],
    enabled: !!token,

    queryFn: async () => {
      const response = await getProfile(token!);
      return response;
    },

    select: (response) => response.collection,
    staleTime: 5 * 60 * 1000,
  });
};
