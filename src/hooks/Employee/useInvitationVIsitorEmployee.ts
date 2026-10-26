import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitorEmployee } from 'src/customs/api/Admin/InvitationData';

interface InvitationVisitorEmployeeParams {
  search: string;
  start: number;
  length: number;
}

export const useInvitationVisitorEmployee = (params: InvitationVisitorEmployeeParams) => {
  return useQuery({
    queryKey: ['invitationVisitorEmployee', params],
    queryFn: async () => {
      const res = await getInvitationVisitorEmployee({
        'search[value]': params.search,
        start: params.start,
        length: params.length,
      });

      return res.data.collection;
    },
    placeholderData: true,
  });
};
