// import { useEffect, useState } from 'react';
// import { getInvitationVisitorEmployee } from 'src/customs/api/Admin/InvitationData';

import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitorEmployee } from 'src/customs/api/Admin/InvitationData';

// const useInvitationVisitorEmployee = (token?: string | null) => {
//   const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!token) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const res = await getInvitationVisitorEmployee(token);
//         setAllVisitorEmployee(res?.collection ?? []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [token]);

//   return {
//     allVisitorEmployee,
//     loading,
//     setAllVisitorEmployee,
//   };
// };

// export default useInvitationVisitorEmployee;

type InvitationVisitorEmployeeParams = {
  search?: string;
  start?: number;
  length?: number;
};

export const useInvitationVisitorEmployee = (
  token: string | null,
  params?: InvitationVisitorEmployeeParams,
) => {
  return useQuery({
    queryKey: ['invitation-visitor-employee', params],
    queryFn: async () => {
      const res = await getInvitationVisitorEmployee(token as string, {
        'search[value]': params?.search,
        start: params?.start,
        length: params?.length,
      });

      return res?.collection ?? [];
    },
    enabled: !!token,
  });
};
