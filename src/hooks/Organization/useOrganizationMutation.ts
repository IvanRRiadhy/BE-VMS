import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganization, updateOrganization, deleteOrganization } from 'src/customs/api/admin';
import { CreateOrganizationRequest } from 'src/customs/api/models/Admin/Organization';

export const useOrganizationMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['organization-total'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateOrganizationRequest }) =>
      createOrganization(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateOrganizationRequest;
    }) => updateOrganization(id, data),

    onSuccess: invalidate,
  });

  const removeOrganization = useMutation({
    mutationFn: ({ id }: { id: string}) => deleteOrganization(id),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    removeOrganization,
  };
};
