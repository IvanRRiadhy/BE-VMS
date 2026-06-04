import { useEffect, useState } from 'react';
import { getInvitationSiteDropPoint } from 'src/customs/api/Public';

const useDropPoint = (token?: string | null) => {
  const [dropPoint, setDropPoint] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchVisitorType = async () => {
      try {
        setLoading(true);

        const res = await getInvitationSiteDropPoint(token);
        setDropPoint(res?.collection ?? []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorType();
  }, [token]);

  return {
    dropPoint,
    loading,
    setDropPoint,
  };
};

export default useDropPoint;
