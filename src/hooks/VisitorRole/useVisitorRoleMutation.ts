import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVisitorRole } from 'src/customs/api/Admin/VisitorRole';

export const useVisitorRoleMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['visitor-role'],
    });
  };

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => updateVisitorRole(id, data),

    onSuccess: invalidate,
  });

  return {
    updateMutation,
  };
};