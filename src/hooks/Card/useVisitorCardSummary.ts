import { useQuery } from '@tanstack/react-query';
import { getAllVisitorCard } from 'src/customs/api/admin';

export const useVisitorCardSummary = () => {
  return useQuery({
    queryKey: ['visitor-card-summary'],

    queryFn: async () => {
      const res = await getAllVisitorCard();

      const activeCount = res.collection.filter((item: any) => item.card_status === 1).length;

      const nonActiveCount = res.collection.filter((item: any) => item.card_status === 0).length;

      const usedCard = res.collection.filter((item: any) => item.is_used).length;

      const unusedCard = res.collection.filter((item: any) => !item.is_used).length;

      return {
        totalRecords: res.collection.length,
        cardActiveCount: activeCount,
        cardInactiveCount: nonActiveCount,
        usedCard,
        unusedCard,
      };
    },

    placeholderData: (previousData) => previousData,
  });
};
