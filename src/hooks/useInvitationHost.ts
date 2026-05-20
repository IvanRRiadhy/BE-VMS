import { useEffect, useState } from 'react';
import { getInvitationVisitorHost } from 'src/customs/api/Admin/InvitationData';

const useInvitationHost = (token?: string | null) => {
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getInvitationVisitorHost(token);
        setEmployee(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    employee,
    loading,
    setEmployee,
  };
};

export default useInvitationHost;
