import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLogdevs } from 'src/customs/api/admin';
import {
  createIntegrationEventInstance,
  getIntegrationEventInstance,
  getIntegrationEventInstanceTab,
} from 'src/customs/api/Admin/Integration';

export const useIntegrationInstances = () => {
  return useQuery({
    queryKey: ['integration-instances'],
    queryFn: async () => {
      const response = await getIntegrationEventInstance();

      return response?.collection ?? [];
    },
  });
};

export const useIntegrationList = () => {
  return useQuery({
    queryKey: ['integration-list'],
    queryFn: async () => {
      const response = await getIntegrationEventInstanceTab();

      const collection = response?.collection ?? [];

      return collection;
    },
  });
};

export const useCreateIntegrationEventInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIntegrationEventInstance,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['integration-instances'],
      });
    },
  });
};

export const useLogdevs = (integrationId?: string, enabled = false) => {
  return useQuery({
    queryKey: ['integration-logdevs', integrationId],
    queryFn: async () => {
      if (!integrationId) {
        return [];
      }

      const response = await getLogdevs(integrationId);

      return response?.collection ?? [];
    },
    enabled: enabled && !!integrationId,
  });
};
