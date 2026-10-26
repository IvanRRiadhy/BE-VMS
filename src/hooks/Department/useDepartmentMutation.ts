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
    mutationFn: ({ data }: { data: CreateDepartmentRequest }) => createDepartment(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,

      data,
    }: {
      id: string;

      data: CreateDepartmentRequest;
    }) => updateDepartment(id, data),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDepartment(id),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
  };
};
