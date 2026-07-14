import { useQuery } from '@tanstack/react-query';
import { getAllDocument } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDocuments = () => {

  const query = useQuery({
    queryKey: ['documents-master'],
    queryFn: async () => {
      const res = await getAllDocument();
      return res.collection ?? [];
    },
  });

  return {
    documents: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
