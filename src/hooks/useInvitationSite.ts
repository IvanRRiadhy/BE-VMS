import { useEffect, useState } from 'react';
import { getInvitationSite } from 'src/customs/api/Admin/InvitationData';

const useInvitationSite = (token?: string | null) => {
  const [sitesOperator, setSitesOperator] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getInvitationSite(token);

        const filteredSites =
          res?.collection?.filter((site: any) => site.can_visited === true) ?? [];

        setSitesOperator(filteredSites);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    sitesOperator,
    loading,
    setSitesOperator,
  };
};

export default useInvitationSite;
