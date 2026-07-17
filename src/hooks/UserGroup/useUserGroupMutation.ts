import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createUserGroup,
    updateUserGroup,
    deleteUserGroup,
} from 'src/customs/api/admin';

const QUERY_KEY = ['users-group'];

const useUserGroupMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: QUERY_KEY,
        });

    const createMutation = useMutation({
        mutationFn: createUserGroup,
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: any;
        }) => updateUserGroup(id, payload),

        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUserGroup(id),
        onSuccess: invalidate,
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};

export default useUserGroupMutation;