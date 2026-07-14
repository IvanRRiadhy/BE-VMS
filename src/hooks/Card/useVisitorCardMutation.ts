import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVisitorCard, updateVisitorCard, deleteVisitorCard } from 'src/customs/api/admin';

export const useVisitorCardMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['visitor-card'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['visitor-card-summary'],
      }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createVisitorCard,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVisitorCard(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVisitorCard(id),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
