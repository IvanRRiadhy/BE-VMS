import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    createApprovalWorkflow,
    updateApprovalWorkflow,
    deleteApprovalWorkflow,
} from 'src/customs/api/Admin/ApprovalWorkflow';

const QUERY_KEY = ['approval-workflow'];

const useApprovalWorkflowMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: QUERY_KEY,
        });

    const createMutation = useMutation({
        mutationFn: createApprovalWorkflow,
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: any;
        }) => updateApprovalWorkflow(id, payload),

        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteApprovalWorkflow(id),

        onSuccess: invalidate,
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};

export default useApprovalWorkflowMutation;