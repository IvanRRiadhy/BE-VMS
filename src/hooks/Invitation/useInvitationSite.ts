// import { useEffect, useState } from 'react';
// import { getInvitationSite } from 'src/customs/api/Admin/InvitationData';

// const useInvitationSite = () => {
//   const [sitesOperator, setSitesOperator] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const res = await getInvitationSite();

//         const filteredSites =
//           res?.collection?.filter((site: any) => site.can_visited === true) ?? [];

//         setSitesOperator(filteredSites);
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return {
//     sitesOperator,
//     loading,
//     setSitesOperator,
//   };
// };

// export default useInvitationSite;

import { useQuery } from '@tanstack/react-query';
import { getInvitationSite } from 'src/customs/api/Admin/InvitationData';

const useInvitationSite = () => {
  const {
    data: sites= [],
    isPending: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['invitation-sites'],
    queryFn: async () => {
      const res = await getInvitationSite();

      return res?.collection?.filter((site: any) => site.can_visited === true) ?? [];
    },
  });

  return {
    sites,
    loading,
    isError,
    error,
    refetch,
  };
};

export default useInvitationSite;
