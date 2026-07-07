import { useEffect, useState } from 'react';
import { getAllAccessControl } from 'src/customs/api/admin';

export const useAccessControl = (token?: string | null) => {
  const [accessData, setAccessData] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchAccessControl = async () => {
      try {
        const res = await getAllAccessControl(token);
        setAccessData(res.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch access control', err);
      }
    };

    fetchAccessControl();
  }, [token]);

  return {
    accessData,
  };
};
