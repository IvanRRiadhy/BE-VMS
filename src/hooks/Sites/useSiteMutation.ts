import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSite, updateSite, deleteSiteSpace } from 'src/customs/api/admin';
import { updateSiteActive } from 'src/customs/api/Admin/Site';
import { CreateSiteRequest, UpdateSiteRequest } from 'src/customs/api/models/Admin/Sites';

export const useSiteMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['sites'],
      }),

      queryClient.invalidateQueries({
        queryKey: ['registeredSites'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateSiteRequest }) =>
      createSite(data, token),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, token, data }: { id: string; token: string; data: UpdateSiteRequest }) =>
      updateSite(id, data, token),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteSiteSpace(id, token),

    onSuccess: invalidate,
  });

  const updateActive = useMutation({
    mutationFn: ({ id, token, active }: { id: string; token?: string | null; active: boolean }) =>
      updateSiteActive(token as string, id, active),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
    updateActive,

    isPending: create.isPending || update.isPending || remove.isPending || updateActive.isPending,
  };
};
