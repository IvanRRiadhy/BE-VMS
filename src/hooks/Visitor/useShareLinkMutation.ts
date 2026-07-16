import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createShareLink, createShareLinkByEmailById, deleteShareLink } from 'src/customs/api/Admin/ShareLink';

export const useShareLinkMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['share-link'],
        });
    };

    const createMutation = useMutation({
        mutationFn: createShareLink,
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShareLink,
        onSuccess: invalidate,
    });

    const sendEmailMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: any;
            }) => createShareLinkByEmailById(id,payload),
        onSuccess: invalidate,
    });

    return {
        createMutation,
        deleteMutation,
        sendEmailMutation,
    };
};