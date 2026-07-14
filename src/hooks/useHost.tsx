import { useQuery } from '@tanstack/react-query';
import { getAllEmployee } from 'src/customs/api/admin';

export const useHost = () => {
  return useQuery({
    queryKey: ['host'],
    queryFn: async () => {
      const res = await getAllEmployee();
      
      return res.collection;
    },
  });
};
