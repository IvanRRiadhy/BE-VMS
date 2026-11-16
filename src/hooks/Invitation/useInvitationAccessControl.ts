import { useQuery } from '@tanstack/react-query';
import { getInvitationAccessControl } from 'src/customs/api/Admin/InvitationData';

export const useInvitationAccessControl = () => {
  return useQuery({
    queryKey: ['invitation-access-control'],
    queryFn: () => getInvitationAccessControl(),
  });
};
