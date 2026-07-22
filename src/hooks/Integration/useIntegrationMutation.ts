import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createIntegration,
    updateIntegration,
    deleteIntegration,
} from 'src/customs/api/admin';
import { CreateIntegrationRequest } from 'src/customs/api/models/Admin/Integration';
import { integrationKeys } from './useIntegration';

export const useIntegrationMutation = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: integrationKeys.all,
        });

        queryClient.invalidateQueries({
            queryKey: integrationKeys.available,
        });
    };

    const createMutation = useMutation({
        mutationFn: (data: CreateIntegrationRequest) => createIntegration(data),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: CreateIntegrationRequest;
        }) => updateIntegration(id, data),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteIntegration(id),
        onSuccess: invalidate,
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
};