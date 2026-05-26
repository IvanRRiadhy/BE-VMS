import { useEffect, useState } from 'react';
import { getAllOrganizations } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useOrganization = () => {
  const { token } = useSession();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchOrganizations = async () => {
      setLoading(true);

      try {
        const res = await getAllOrganizations(token as string);
        setOrganizations(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch organizations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [token]);

  return {
    organizations,
    loading,
  };
};
