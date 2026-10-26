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
    mutationFn: ({ data }: { data: CreateSiteRequest }) => createSite(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteRequest }) =>
      updateSite(id, data),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string; }) => deleteSiteSpace(id),

    onSuccess: invalidate,
  });

  const updateActive = useMutation({
    mutationFn: ({ id, active }: { id: string;active: boolean }) =>
      updateSiteActive(id, active),

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
