import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import {
    createDriver,
    updateDriver,
    deleteDriver,
} from 'src/customs/api/Delivery/Driver';


export const useStaffMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: ['staff'],
        });

    const createMutation = useMutation({
        mutationFn: createDriver,
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: any;
        }) => updateDriver(id, data),

        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDriver,
        onSuccess: invalidate,
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};