import { useQuery } from '@tanstack/react-query';
import { getAllEmployee, getAllVisitorType } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

import { useEffect, useState } from 'react';

export const useVisitorType = (token?: string | null) => {
  const [visitorType, setVisitorType] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchVisitorTypes = async () => {
      try {
        const res = await getAllVisitorType(token);

        setVisitorType(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch visitor types', err);
      }
    };

    fetchVisitorTypes();
  }, [token]);

  return {
    visitorType,
    loading,
  };
};
