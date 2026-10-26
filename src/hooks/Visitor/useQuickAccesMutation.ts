import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuickAccess } from 'src/customs/api/Admin/Visitor';

const QUERY_KEY = ['quick-access'];

export const useQuickAccessMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createQuickAccess,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEY,
            });
        },
    });

    return {
        createMutation,
    };
};