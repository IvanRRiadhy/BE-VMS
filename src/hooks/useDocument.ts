import { useEffect, useState } from 'react';
import { getAllDocument } from 'src/customs/api/admin';

export const useDocument = (token?: string) => {
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchDocuments = async () => {
      try {
        const res = await getAllDocument(token);
        setDocuments(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      }
    };

    fetchDocuments();
  }, [token]);

  return {
    documents,
  };
};
