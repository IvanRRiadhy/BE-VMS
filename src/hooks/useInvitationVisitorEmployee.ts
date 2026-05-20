import { useEffect, useState } from 'react';
import { getInvitationVisitorEmployee } from 'src/customs/api/Admin/InvitationData';

const useInvitationVisitorEmployee = (token?: string | null) => {
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getInvitationVisitorEmployee(token);
        setAllVisitorEmployee(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    allVisitorEmployee,
    loading,
    setAllVisitorEmployee,
  };
};

export default useInvitationVisitorEmployee;
