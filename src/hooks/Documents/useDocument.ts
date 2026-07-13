import { useQuery } from '@tanstack/react-query';
import { getAllDocument } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useDocuments = () => {
  const { token } = useSession();

  const query = useQuery({
    queryKey: ['documents-master'],
    enabled: !!token,
    queryFn: async () => {
      const res = await getAllDocument(token!);
      return res.collection ?? [];
    },
  });

  return {
    documents: query.data ?? [],
    loading: query.isPending,
    ...query,
  };
};
