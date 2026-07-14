import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBlacklist } from 'src/customs/api/admin';

export const useListVisitorMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['list-visitor'],
    });
  };

  const blacklistMutation = useMutation({
    mutationFn: createBlacklist,
    onSuccess: invalidate,
  });

  return {
    blacklistMutation,
  };
};
