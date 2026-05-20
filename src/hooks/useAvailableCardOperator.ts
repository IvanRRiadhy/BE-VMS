import { useEffect, useState } from 'react';
import { getAvailableCardOperator } from 'src/customs/api/operator';

const useAvailableCardOperator = (token?: string | null) => {
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getAvailableCardOperator(token);
        setAvailableCards(res?.collection ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    availableCards,
    loading,
    setAvailableCards,
  };
};

export default useAvailableCardOperator;
