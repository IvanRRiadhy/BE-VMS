import { useQuery } from '@tanstack/react-query';
import { getVehicle, getVehicleByDT } from 'src/customs/api/Admin/Setting';

export const useVehicleDT = (
  page: number,
  length: number,
  sort_column: string,
  sortDir: string,
  keyword: string,
) => {
  return useQuery({
    queryKey: ['vehicle', 'pagination', page, length, sort_column, sortDir, keyword],
    queryFn: () => getVehicleByDT(page, length, sort_column, sortDir, keyword),
    placeholderData: (prev) => prev,
  });
};

export const useVehicle = () => {
  return useQuery({
    queryKey: ['vehicle'],
    queryFn: async () => {
      const response = await getVehicle();
      return response.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });
};
