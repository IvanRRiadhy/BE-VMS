import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    createSchedulerDelivery,
    updateSchedulerDelivery,
    deleteSchedulerDelivery,
} from 'src/customs/api/Delivery/Scheduler';

export const useSchedulerMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['scheduler'],
        });
    };

    const createMutation = useMutation({
        mutationFn: createSchedulerDelivery,
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: any;
        }) => updateSchedulerDelivery(id, data),

        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSchedulerDelivery(id),

        onSuccess: invalidate,
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};