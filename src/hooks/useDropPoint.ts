import { useEffect, useState } from 'react';
import { getInvitationSiteDropPoint } from 'src/customs/api/Public';

const useDropPoint = () => {
  const [dropPoint, setDropPoint] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {


    const fetchDropPoint = async () => {
      try {
        setLoading(true);

        const res = await getInvitationSiteDropPoint();
        setDropPoint(res?.collection ?? []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchDropPoint();
  }, []);

  return {
    dropPoint,
    loading,
    setDropPoint,
  };
};

export default useDropPoint;
