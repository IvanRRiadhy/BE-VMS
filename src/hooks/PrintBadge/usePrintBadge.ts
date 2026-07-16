import { useEffect, useState } from 'react';
import { getPrintBadgeConfig } from 'src/customs/api/Admin/PrintBadge';

const usePrintBadgeConfig = () => {
  const [printData, setPrintData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getPrintBadgeConfig();
        setPrintData(res?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch print badge config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    printData,
    loading,
    setPrintData,
  };
};

export default usePrintBadgeConfig;
