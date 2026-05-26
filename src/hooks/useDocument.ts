import { useEffect, useState } from 'react';
import { getAllDocument } from 'src/customs/api/admin';

export const useDocument = (token?: string) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchDocuments = async () => {
      setLoading(true);

      try {
        const res = await getAllDocument(token);
        setDocuments(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [token]);

  return {
    documents,
    loading,
  };
};
