import { useEffect, useState } from 'react';
import { getAllSite } from 'src/customs/api/admin';

export const useSites = () => {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchSites = async () => {
      try {
        setLoading(true);

        const res = await getAllSite();
        setSites(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch sites', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  return {
    sites,
    loading,
  };
};
