import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVehicle } from 'src/customs/api/Admin/Setting';

export const useVehicleMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['vehicle'],
      }),
    ]);
  };

  const create = useMutation({
    mutationFn: ({ data }: { data: any }) => createVehicle(data),
    onSuccess: invalidate,
  });

  return {
    create,
  };
};
