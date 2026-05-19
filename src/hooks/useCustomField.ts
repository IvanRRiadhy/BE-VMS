import { useEffect, useState } from 'react';
import { getAllCustomField } from 'src/customs/api/admin';

export const useCustomField = (token?: string) => {
  const [customField, setCustomField] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchCustomFields = async () => {
      try {
        const res = await getAllCustomField(token);
        setCustomField(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch custom fields', err);
      }
    };

    fetchCustomFields();
  }, [token]);

  return {
    customField,
  };
};
