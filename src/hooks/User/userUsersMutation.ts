import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createUser,
    updateUser,
    deleteUser,
} from 'src/customs/api/admin';

const QUERY_KEY = ['users'];

const useUsersMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: any;
        }) => updateUser(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUser(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};

export default useUsersMutation;