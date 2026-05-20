import { useEffect, useState } from 'react';
import { getInvitationVisitorType } from 'src/customs/api/Admin/InvitationData';

const useInvitationVisitorType = (token?: string | null) => {
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchVisitorType = async () => {
      try {
        setLoading(true);

        const res = await getInvitationVisitorType(token);
        setVisitorType(res?.collection ?? []);
      } catch (err) {
        console.error('Failed fetch visitor type:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorType();
  }, [token]);

  return {
    visitorType,
    loading,
    setVisitorType,
  };
};

export default useInvitationVisitorType;
