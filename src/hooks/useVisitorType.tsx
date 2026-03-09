import { useQuery } from '@tanstack/react-query';
import { getAllEmployee, getAllVisitorType } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

export const useVisitorType = () => {
  const { token } = useSession();
  return useQuery({
    queryKey: ['visitorType'],
    queryFn: async () => {
      const res = await getAllVisitorType(token as string);
      return res.collection;
    },
  });
};
