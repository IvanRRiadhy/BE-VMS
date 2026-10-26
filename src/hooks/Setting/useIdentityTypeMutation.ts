import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createIdentityType,
  createVehicle,
  deleteIdentityType,
  updateIdentityType,
} from 'src/customs/api/Admin/Setting';

export const useIdentityTypeMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['identity-type'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ data }: { data: any }) => createIdentityType(data),
    onSuccess: invalidate,
  });

  const deleteIdentityTypes = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteIdentityType(id),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateIdentityType(id, data),
    onSuccess: invalidate,
  });

  return {
    create,
    deleteIdentityTypes,
    update,
  };
};
