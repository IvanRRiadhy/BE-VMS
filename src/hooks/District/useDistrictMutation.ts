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
    mutationFn: ({ data }: { data: CreateDistrictRequest }) => createDistrict(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDistrictRequest }) =>
      updateDistrict(id, data),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDistrict(id),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
  };
};
