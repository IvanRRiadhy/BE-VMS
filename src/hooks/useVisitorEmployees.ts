// src/customs/hooks/useVisitorEmployees.ts

import { useEffect, useState } from 'react';
import { getVisitorEmployee } from 'src/customs/api/admin';

export const useVisitorEmployees = () => {
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);

  useEffect(() => {

    let isMounted = true;

    const fetchVisitorEmployees = async () => {
      try {
        const res = await getVisitorEmployee();

        if (!isMounted) return;

        setAllVisitorEmployee(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch visitor employees', err);
      }
    };

    fetchVisitorEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    allVisitorEmployee,
  };
};
