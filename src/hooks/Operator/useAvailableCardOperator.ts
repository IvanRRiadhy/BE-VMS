import { useEffect, useState } from 'react';
import { getAvailableCardOperator } from 'src/customs/api/operator';

const useAvailableCardOperator = () => {
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getAvailableCardOperator();
        setAvailableCards(res?.collection ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    availableCards,
    loading,
    setAvailableCards,
  };
};

export default useAvailableCardOperator;
