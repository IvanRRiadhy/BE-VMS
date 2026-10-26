import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createBlacklist,
  updateVisitorInvitation,
  deleteVisitorInvitation,
} from 'src/customs/api/admin';

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

  const updateVisitorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVisitorInvitation(id, data),
    onSuccess: invalidate,
  });

  const deleteVisitorMutation = useMutation({
    mutationFn: (id: string) => deleteVisitorInvitation(id),
    onSuccess: invalidate,
  });

  return {
    blacklistMutation,
    updateVisitorMutation,
    deleteVisitorMutation,
  };
};
