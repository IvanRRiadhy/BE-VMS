import { useQuery } from '@tanstack/react-query';
import { getPrintBadgeConfig } from 'src/customs/api/Admin/PrintBadge';

const usePrintBadgeConfig = () => {
  const query = useQuery({
    queryKey: ['print-badge-config'],
    queryFn: async () => {
      const res = await getPrintBadgeConfig();
      return res?.collection;
    },
  });

  return {
    printData: query.data,
    loading: query.isLoading,
    ...query,
  };
};

export default usePrintBadgeConfig;