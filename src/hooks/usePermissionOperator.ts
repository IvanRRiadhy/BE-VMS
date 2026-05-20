import { useEffect, useState } from 'react';
import { getPermissionOperator } from 'src/customs/api/operator';


const usePermissionOperator = (token?: string | null) => {
  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchDataPermission = async () => {
      try {
        setLoading(true);

        const res = await getPermissionOperator(token);
        setPermissionAccess(res?.collection ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDataPermission();
  }, [token]);

  return {
    permissionAccess,
    loading,
    setPermissionAccess,
  };
};

export default usePermissionOperator;
