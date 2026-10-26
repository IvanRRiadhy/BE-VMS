import { useEffect, useState } from 'react';
import { getPermission } from 'src/customs/api/users';

const useDataPermission = () => {
  const [permission, setPermission] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchPermission = async () => {
      try {
        setLoading(true);

        const res = await getPermission();
        setPermission(res?.collection ?? {});
      } catch (err) {
        console.error('Failed fetch permission:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermission();
  }, []);

  return {
    permission,
    loading,
    setPermission,
  };
};

export default useDataPermission;
