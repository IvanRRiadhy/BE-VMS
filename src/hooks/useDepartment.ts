import { useEffect, useState } from 'react';
import { getAllDepartments } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDepartment = () => {
  const { token } = useSession();

  const [department, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchDepartments = async () => {
      setLoading(true);

      try {
        const res = await getAllDepartments(token as string);
        setDepartments(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [token]);

  return {
    department,
    loading,
  };
};
