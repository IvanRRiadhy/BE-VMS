import { useQuery } from '@tanstack/react-query';
import {
  getIdentityType,
  getIdentityTypeByDT,
  getVehicle,
  getVehicleByDT,
} from 'src/customs/api/Admin/Setting';

export const useIdentityTypeDT = (
  page: number,
  length: number,
  sort_column: string,
  sortDir: string,
  keyword: string,
) => {
  return useQuery({
    queryKey: ['identity-type', 'pagination', page, length, sort_column, sortDir, keyword],
    queryFn: () => getIdentityTypeByDT(page, length, sort_column, sortDir, keyword),
    placeholderData: (prev) => prev,
  });
};

export const useIdentityType = () => {
  return useQuery({
    queryKey: ['identity-type'],
    queryFn: async () => {
      const response = await getIdentityType();
      return response.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });
};
