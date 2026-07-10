import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment, updateDepartment, deleteDepartment } from 'src/customs/api/admin';
import { CreateDepartmentRequest } from 'src/customs/api/models/Admin/Department';

export const useDepartmentMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['department-total'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateDepartmentRequest }) =>
      createDepartment(data, token),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      token,
      data,
    }: {
      id: string;
      token: string;
      data: CreateDepartmentRequest;
    }) => updateDepartment(id, data, token),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteDepartment(id, token),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
  };
};
