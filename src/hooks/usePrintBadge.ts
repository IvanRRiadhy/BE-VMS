import { useEffect, useState } from 'react';
import { getPrintBadgeConfig } from 'src/customs/api/Admin/PrintBadge';

const usePrintBadgeConfig = (token?: string) => {
  const [printData, setPrintData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getPrintBadgeConfig(token);
        setPrintData(res?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch print badge config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    printData,
    loading,
    setPrintData,
  };
};

export default usePrintBadgeConfig;
