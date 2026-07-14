// src/customs/hooks/useVisitorEmployees.ts

import { useEffect, useState } from 'react';
import { getAllVisitorProviders } from 'src/customs/api/Admin/VisitorProviders';

export const useVisitorProvider = () => {
  const [visitorProviders, setVisitorProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisitorProviders = async () => {
      try {
        const res = await getAllVisitorProviders();

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
  }, []);

  return {
    visitorProviders,
    loading,
  };
};
