import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createApiKey,
  deleteApiKey,
  generateApiKeyById,
  getRevealById,
  updateApiKey,
  updateApiKeyActive,
  updateApiKeyExpired,
} from 'src/customs/api/Admin/Setting';

export const useApiKeyMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['api-keys'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ data }: { data: any }) => createApiKey(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateApiKey(id, data),

    onSuccess: invalidate,
  });

  const updateActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateApiKeyActive(id, is_active),

    onSuccess: invalidate,
  });

  const updateExpired = useMutation({
    mutationFn: ({ id, expired_at }: { id: string; expired_at: string | null }) =>
      updateApiKeyExpired(id, expired_at),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteApiKey(id),

    onSuccess: invalidate,
  });

  const generate = useMutation({
    mutationFn: ({ id }: { id: string }) => generateApiKeyById(id),

    onSuccess: invalidate,
  });

  const reveal = useMutation({
    mutationFn: ({ id }: { id: string }) => getRevealById(id),
  });

  return {
    create,
    update,
    updateActive,
    updateExpired,
    remove,
    generate,
    reveal,
  };
};
