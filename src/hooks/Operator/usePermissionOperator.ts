import { useEffect, useState } from 'react';
import { getPermissionOperator } from 'src/customs/api/operator';


const usePermissionOperator = () => {
  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDataPermission = async () => {
      try {
        setLoading(true);

        const res = await getPermissionOperator();
        setPermissionAccess(res?.collection ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDataPermission();
  }, []);

  return {
    permissionAccess,
    loading,
    setPermissionAccess,
  };
};

export default usePermissionOperator;
