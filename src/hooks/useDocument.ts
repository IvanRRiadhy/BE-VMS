import { useEffect, useState } from 'react';
import { getAllDocument } from 'src/customs/api/admin';

export const useDocument = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);

      try {
        const res = await getAllDocument();
        setDocuments(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
  };
};
