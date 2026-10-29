import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createAssemblyPoint,
  updateAssemblyPoint,
  deleteAssemblyPoint,
} from 'src/customs/api/Admin/Evacuate/index';

const useAssemblyPointMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['assembly-points'],
    });

  const createMutation = useMutation({
    mutationFn: createAssemblyPoint,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateAssemblyPoint(id, payload),

    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAssemblyPoint(id),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export default useAssemblyPointMutation;
