import { useEffect, useState } from 'react';
import { getAllAccessControl } from 'src/customs/api/admin';

export const useAccessControl = () => {
  const [accessData, setAccessData] = useState<any[]>([]);

  useEffect(() => {


    const fetchAccessControl = async () => {
      try {
        const res = await getAllAccessControl();
        setAccessData(res.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch access control', err);
      }
    };

    fetchAccessControl();
  }, []);

  return {
    accessData,
  };
};
