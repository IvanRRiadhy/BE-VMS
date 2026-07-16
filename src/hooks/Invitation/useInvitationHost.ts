import { useEffect, useState } from 'react';
import { getInvitationVisitorHost } from 'src/customs/api/Admin/InvitationData';

const useInvitationHost = () => {
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getInvitationVisitorHost();
        setEmployee(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    employee,
    loading,
    setEmployee,
  };
};

export default useInvitationHost;
