import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDistrict, updateDistrict, deleteDistrict } from 'src/customs/api/admin';
import { CreateDistrictRequest } from 'src/customs/api/models/Admin/District';

export const useDistrictMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['districts'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['district-total'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateDistrictRequest }) =>
      createDistrict(data, token),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, token, data }: { id: string; token: string; data: CreateDistrictRequest }) =>
      updateDistrict(id, data, token),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteDistrict(id, token),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
  };
};
