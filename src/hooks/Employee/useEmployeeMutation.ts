import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadImageEmployee,
  createEmployeeBlacklist,
} from 'src/customs/api/admin';
import { CreateEmployeeRequest } from 'src/customs/api/models/Admin/Employee';

export const useEmployeeMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      }),
    //   queryClient.invalidateQueries({
    //     queryKey: ['employee-total'],
    //   }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateEmployeeRequest }) =>
      createEmployee(data, token),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, token, data }: { id: string; token: string; data: CreateEmployeeRequest }) =>
      updateEmployee(id, data as any, token),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteEmployee(id, token),

    onSuccess: invalidate,
  });

  const uploadImage = useMutation({
    mutationFn: ({ employeeId, file, token }: { employeeId: string; file: File; token: string }) =>
      uploadImageEmployee(employeeId, file, token),

    onSuccess: invalidate,
  });

  const blacklist = useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: {
        employee_id: string;
        action: 'blacklist' | 'whitelist';
        reason: string;
      };
    }) => createEmployeeBlacklist(token, data),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
    uploadImage,
    blacklist,

    isPending:
      create.isPending ||
      update.isPending ||
      remove.isPending ||
      uploadImage.isPending ||
      blacklist.isPending,
  };
};
