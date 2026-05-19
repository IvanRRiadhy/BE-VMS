import { useEffect, useState } from 'react';
import { getAllEmployee } from 'src/customs/api/admin';

export const useEmployees = (token?: string) => {
  const [employee, setEmployee] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployee(token);

        if (!isMounted) return;

        setEmployee(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      }
    };

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return {
    employee,
  };
};
