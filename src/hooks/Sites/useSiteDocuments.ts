import { useQuery } from '@tanstack/react-query';
import { getSiteDocumentBySiteId } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useSiteDocuments = (siteId?: string) => {
  const { token } = useSession();

  return useQuery({
    queryKey: ['site-documents', siteId],
    enabled: !!token && !!siteId,
    queryFn: () => getSiteDocumentBySiteId(token!, siteId!),
  });
};
