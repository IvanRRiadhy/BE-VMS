import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAccessControl,
  updateAccessControl,
  deleteAccessControl,
} from 'src/customs/api/admin';

export const useAccessControlMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['access-control'],
    });
  };

  const createMutation = useMutation({
    mutationFn: createAccessControl,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAccessControl(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccessControl(id),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
