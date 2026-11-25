import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSite, updateSite, deleteSiteSpace, deleteSiteTracking, updateSiteTracking, createSiteTracking, deleteSiteParking, updateSiteParking, createSiteParking } from 'src/customs/api/admin';
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

    const invalidateTrackingParking = async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['site-trackings'] }),
        queryClient.invalidateQueries({ queryKey: ['site-parkings'] }),
        queryClient.invalidateQueries({ queryKey: ['sites-tracking'] }),
        queryClient.invalidateQueries({ queryKey: ['sites-parking'] }),
      ]);
    };

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateSiteRequest }) => createSite(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteRequest }) => updateSite(id, data),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSiteSpace(id),

    onSuccess: invalidate,
  });

  const updateActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateSiteActive(id, active),

    onSuccess: invalidate,
  });

  // Tracking mutations
  const deleteTracking = useMutation({
    mutationFn: (id: string) => deleteSiteTracking(id),
    onSuccess: invalidateTrackingParking,
  });

  const updateTracking = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSiteTracking(id, data),
    onSuccess: invalidateTrackingParking,
  });

  const createTracking = useMutation({
    mutationFn: (data: any) => createSiteTracking(data),
    onSuccess: invalidateTrackingParking,
  });

  // Parking mutations
  const deleteParking = useMutation({
    mutationFn: (id: string) => deleteSiteParking(id),
    onSuccess: invalidateTrackingParking,
  });

  const updateParking = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSiteParking(id, data),
    onSuccess: invalidateTrackingParking,
  });

  const createParking = useMutation({
    mutationFn: (data: any) => createSiteParking(data),
    onSuccess: invalidateTrackingParking,
  });

  return {
    create,
    update,
    remove,
    updateActive,
    deleteTracking,
    updateTracking,
    createTracking,

    deleteParking,
    updateParking,
    createParking,
    isPending:
      create.isPending ||
      update.isPending ||
      remove.isPending ||
      updateActive.isPending ||
      deleteTracking.isPending ||
      updateTracking.isPending ||
      createTracking.isPending ||
      deleteParking.isPending ||
      updateParking.isPending ||
      createParking.isPending,
  };
};;
