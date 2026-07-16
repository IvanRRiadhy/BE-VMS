import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitorEmployee, getInvitationVisitorHost } from 'src/customs/api/Admin/InvitationData';

type InvitationVisitorEmployeeParams = {
  search?: string;
  start?: number;
  length?: number;
};

export const useInvitationVisitorEmployee = (
  params?: InvitationVisitorEmployeeParams,
) => {
  return useQuery({
    queryKey: ['invitation-visitor-host', params],
    queryFn: async () => {
      const res = await getInvitationVisitorHost( {
        'search[value]': params?.search,
        start: params?.start,
        length: params?.length,
      });

      return res?.collection ?? [];
    },
  });
};
