import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeVisitor } from 'src/customs/api/admin';
import { cancelVisitor } from 'src/customs/api/users';

export const useTransactionVisitorMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['transaction-visitor'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['transaction-visitor-detail'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['visitors'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['quick-access'],
      }),
    ]);
  };

  const cancelMutation = useMutation({
    mutationFn: cancelVisitor,
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: removeVisitor,
    onSuccess: invalidate,
  });

  return {
    cancelMutation,
    removeMutation,
  };
};
