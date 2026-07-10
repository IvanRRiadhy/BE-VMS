import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDocument, updateDocument, deleteDocument } from 'src/customs/api/admin';

import { CreateDocumentRequest } from 'src/customs/api/models/Admin/Document';

export const useDocumentMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['documents'],
    });
  };

  const create = useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateDocumentRequest }) =>
      createDocument(data, token),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, token, data }: { id: string; token: string; data: CreateDocumentRequest }) =>
      updateDocument(id, data, token),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteDocument(id, token),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,

    isPending: create.isPending || update.isPending || remove.isPending,
  };
};
