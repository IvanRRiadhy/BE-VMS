import { useQuery } from '@tanstack/react-query';
import {
    getAllIntegration,
    getAvailableIntegration,
} from 'src/customs/api/admin';

export const integrationKeys = {
    all: ['integrations'] as const,
    available: ['integrations', 'available'] as const,
};

export const useIntegration = () => {
    return useQuery({
        queryKey: integrationKeys.all,
        queryFn: getAllIntegration,
        select: (res) => res.collection,
        // staleTime: 1000 * 60 * 5, // 5 menit
    });
};

export const useAvailableIntegration = () => {
    return useQuery({
        queryKey: integrationKeys.available,
        queryFn: getAvailableIntegration,
        // staleTime: Infinity,
        // gcTime: Infinity,
    });
};