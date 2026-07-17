import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import {
    createCustomField,
    updateCustomField,
    deleteCustomField,
} from 'src/customs/api/admin';

import { CUSTOM_FIELD_QUERY_KEY } from './useCustomFieldPagination';

const useCustomFieldMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: CUSTOM_FIELD_QUERY_KEY,
        });

    const createMutation = useMutation({
        mutationFn: createCustomField,
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: any;
        }) => updateCustomField(payload, id),

        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCustomField(id),

        onSuccess: invalidate,
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};

export default useCustomFieldMutation;