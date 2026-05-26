import { useEffect, useState } from 'react';
import { getAllDistricts } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDistricts = () => {
  const { token } = useSession();

  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchDistricts = async () => {
      setLoading(true);

      try {
        const res = await getAllDistricts(token as string);
        setDistricts(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch districts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [token]);

  return {
    districts,
    loading,
  };
};
