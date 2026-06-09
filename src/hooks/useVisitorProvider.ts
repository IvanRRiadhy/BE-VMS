// src/customs/hooks/useVisitorEmployees.ts

import { useEffect, useState } from 'react';
import { getAllVisitorProviders } from 'src/customs/api/Admin/VisitorProviders';

export const useVisitorProvider = (token?: string | null) => {
  const [visitorProviders, setVisitorProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    // setLoading(true);

    const fetchVisitorProviders = async () => {
      try {
        const res = await getAllVisitorProviders(token);

          setVisitorProviders(
            (res?.collection ?? []).filter((item: any) => item.is_quick_access === true),
          );
      } catch (err) {
        console.error('Failed to fetch visitor employees', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorProviders();
  }, [token]);

  return {
    visitorProviders,
    loading,
  };
};
