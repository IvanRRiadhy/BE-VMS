import { useQuery } from '@tanstack/react-query';
import { getAllOrganizations, getAllSite } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useEffect, useState } from 'react';

export const useSites = (token?: string) => {
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchSites = async () => {
      try {
        const res = await getAllSite(token);

        if (!isMounted) return;

        setSites(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch sites', err);
      }
    };

    fetchSites();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return {
    sites,
  };
};
