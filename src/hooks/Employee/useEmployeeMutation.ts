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
      queryClient.invalidateQueries({
        queryKey: ['visitor-employees'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateEmployeeRequest }) => createEmployee(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateEmployeeRequest }) =>
      updateEmployee(id, data as any),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteEmployee(id),

    onSuccess: invalidate,
  });

  const uploadImage = useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: string; file: File }) =>
      uploadImageEmployee(employeeId, file),

    onSuccess: invalidate,
  });

  const blacklist = useMutation({
    mutationFn: ({
      data,
    }: {
      data: {
        employee_id: string;
        action: 'blacklist' | 'whitelist';
        reason: string;
      };
    }) => createEmployeeBlacklist(data),

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
