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
    mutationFn: ({ token, data }: { token: string; data: CreateOrganizationRequest }) =>
      createOrganization(data, token),

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
      data: CreateOrganizationRequest;
    }) => updateOrganization(id, data, token),

    onSuccess: invalidate,
  });

  const removeOrganization = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteOrganization(id, token),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    removeOrganization,
  };
};
