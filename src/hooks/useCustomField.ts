import { useEffect, useState } from 'react';
import { getAllCustomField } from 'src/customs/api/admin';

export const useCustomField = () => {
  const [customField, setCustomField] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const res = await getAllCustomField();
        setCustomField(res?.collection ?? []);
      } catch (err) {
        console.error('Failed to fetch custom fields', err);
      }
    };

    fetchCustomFields();
  }, []);

  return {
    customField,
  };
};
