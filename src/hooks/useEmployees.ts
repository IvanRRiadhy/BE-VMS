import { useEffect, useState } from 'react';
import { getAllEmployee } from 'src/customs/api/admin';

export const useEmployees = (token?: string | null) => {
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const res = await getAllEmployee(token);

        setEmployee(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  return {
    employee,
    loading,
  };
};
