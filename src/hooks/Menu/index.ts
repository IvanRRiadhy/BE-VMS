import { useQuery } from '@tanstack/react-query';
import { getMenu } from 'src/customs/api/Admin/Menu';

export const useMenu = () => {
  return useQuery({
    queryKey: ['menu'],
    queryFn: getMenu,
  });
};
