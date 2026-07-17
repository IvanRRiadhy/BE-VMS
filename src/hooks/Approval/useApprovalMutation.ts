import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    approveMeetingHost,
    approveTicket,
    rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';

const QUERY_KEY = ['approval'];

export const useApprovalMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: QUERY_KEY,
        });

    const approveMutation = useMutation({
        mutationFn: (id: string) => approveTicket(id),

        onSuccess: invalidate,
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => rejectTicket(id),

        onSuccess: invalidate,
    });

    const approveMeetingHostMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: {
                list_trx_visitor_id: string[];
            };
        }) => approveMeetingHost(id, payload),

        onSuccess: invalidate,
    });

    return {
        approveMutation,
        rejectMutation,
        approveMeetingHostMutation,
    };
};