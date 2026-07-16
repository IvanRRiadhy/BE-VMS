import { useEffect, useState } from 'react';
import { getInvitationVisitorType } from 'src/customs/api/Admin/InvitationData';

const useInvitationVisitorType = () => {
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisitorType = async () => {
      try {
        setLoading(true);

        const res = await getInvitationVisitorType();
        setVisitorType(res?.collection ?? []);
      } catch (err) {
        console.error('Failed fetch visitor type:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorType();
  }, []);

  return {
    visitorType,
    loading,
    setVisitorType,
  };
};

export default useInvitationVisitorType;
