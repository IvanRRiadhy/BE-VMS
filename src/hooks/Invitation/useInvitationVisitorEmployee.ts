// import { useEffect, useState } from 'react';
// import { getInvitationVisitorEmployee } from 'src/customs/api/Admin/InvitationData';

import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitorEmployee } from 'src/customs/api/Admin/InvitationData';

type InvitationVisitorEmployeeParams = {
  search?: string;
  start?: number;
  length?: number;
};

export const useInvitationVisitorEmployee = (
  params?: InvitationVisitorEmployeeParams,
) => {
  return useQuery({
    queryKey: ['invitation-visitor-employee', params],
    queryFn: async () => {
      const res = await getInvitationVisitorEmployee( {
        'search[value]': params?.search,
        start: params?.start,
        length: params?.length,
      });

      return res?.collection ?? [];
    },
  });
};
