import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitorType } from 'src/customs/api/Admin/InvitationData';

interface InvitationVisitorTypeParams {
  start?: number;
  length?: number;
  'search[value]'?: string;
}

const useInvitationVisitorType = (params: InvitationVisitorTypeParams = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['invitation-visitor-type', params],
    queryFn: async () => {
      const res = await getInvitationVisitorType(params);
      return res?.collection ?? [];
    },
  });

  return {
    visitorType: data ?? [],
    loading: isLoading,
    isFetching,
    error,
    refetch,
  };
};

export default useInvitationVisitorType;
