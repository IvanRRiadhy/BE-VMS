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
    mutationFn: ({ data }: { data: CreateDocumentRequest }) => createDocument(data),

    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDocumentRequest }) =>
      updateDocument(id, data),

    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDocument(id),

    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,

    isPending: create.isPending || update.isPending || remove.isPending,
  };
};
