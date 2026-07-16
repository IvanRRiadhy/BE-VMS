import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createTimezone,
  updateTimezone,
  deleteTimezone,
} from 'src/customs/api/admin';

export const useTimezoneMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['timezone'],
    });
  };

  const createMutation = useMutation({
    mutationFn: createTimezone,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => updateTimezone(id, data),

    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteTimezone(id),

    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};