import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createVisitorProvider,
  updateVisitorProviders,
  deleteVisitorProvider,
  uploadLogoVisitorProvider,
} from 'src/customs/api/Admin/VisitorProviders';

export const useVisitorProviderMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['visitor-provider'],
    });
  };

  const createMutation = useMutation({
    mutationFn: createVisitorProvider,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => updateVisitorProviders(id, data),

    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVisitorProvider(id),

    onSuccess: invalidate,
  });

  const uploadLogoMutation = useMutation({
    mutationFn: ({
      id,
      file,
    }: {
      id: string;
      file: File;
    }) => uploadLogoVisitorProvider(id, file),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    uploadLogoMutation,
  };
};