import { useEffect, useState } from 'react';
import { getAllSite } from 'src/customs/api/admin';

export const useSites = (token?: string | null) => {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchSites = async () => {
      try {
        setLoading(true);

        const res = await getAllSite(token);
        setSites(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch sites', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [token]);

  return {
    sites,
    loading,
  };
};
