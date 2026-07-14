import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVisitorType, updateVisitorType, deleteVisitorType } from 'src/customs/api/admin';

import { updateQuickVisitorType, updateVisitorTypeActive } from 'src/customs/api/Admin/VisitorType';

export const useVisitorTypeMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['visitor-type'],
    });
  };

  const createMutation = useMutation({
    mutationFn: createVisitorType,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVisitorType(id, data),

    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVisitorType(id),

    onSuccess: invalidate,
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateVisitorTypeActive(id, active),

    onSuccess: invalidate,
  });

  const quickAccessMutation = useMutation({
    mutationFn: ({ id, quickAccess }: { id: string; quickAccess: boolean }) =>
      updateQuickVisitorType(id, quickAccess),

    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    activeMutation,
    quickAccessMutation,
  };
};
