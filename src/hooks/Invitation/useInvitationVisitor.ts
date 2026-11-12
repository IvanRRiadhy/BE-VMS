import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitor } from 'src/customs/api/Admin/InvitationData';

export const useInvitationVisitor = ({
  search,
  page,
  rowsPerPage,
}: {
  search: string;
  page: number;
  rowsPerPage: number;
}) => {
  return useQuery({
    queryKey: ['invitation-visitor', search, page, rowsPerPage],
    queryFn: () =>
      getInvitationVisitor({
        'search[value]': search,
        start: page * rowsPerPage,
        length: rowsPerPage,
      }),
    placeholderData: (previousData) => previousData,
  });
};
