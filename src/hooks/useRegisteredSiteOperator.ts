import { useEffect, useState } from 'react';
import { getRegisteredSiteOperator } from 'src/customs/api/Admin/SwapCard';

const useRegisteredSiteOperator = (token?: string | null) => {
  const [registeredSite, setRegisteredSite] = useState<any[]>([]);
  const [registerSiteOperator, setRegisterSiteOperator] = useState<string>(() => {
    return localStorage.getItem('selectedSite') || '';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getRegisteredSiteOperator(token);

        const firstSite = res?.collection?.[0];

        setRegisterSiteOperator(firstSite?.id ?? '');
        setRegisteredSite(res?.collection ?? []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    registeredSite,
    registerSiteOperator,
    loading,
    setRegisteredSite,
    setRegisterSiteOperator,
  };
};

export default useRegisteredSiteOperator;
