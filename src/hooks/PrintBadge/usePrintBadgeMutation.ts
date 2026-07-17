import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePrintBadgeConfig } from 'src/customs/api/Admin/PrintBadge';

const usePrintBadgeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: any;
        }) => {
            return await updatePrintBadgeConfig(id, payload);
        },

        onSuccess: (_, variables) => {
            queryClient.setQueryData(
                ['print-badge-config'],
                (old: any) => ({
                    ...old,
                    ...variables.payload,
                })
            );

            // atau
            // queryClient.invalidateQueries({
            //   queryKey: ['print-badge-config'],
            // });
        },
    });
};

export default usePrintBadgeMutation;