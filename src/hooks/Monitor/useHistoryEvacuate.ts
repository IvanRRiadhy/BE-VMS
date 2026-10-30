import { useQuery } from '@tanstack/react-query';
import { createHistoryChart } from 'src/customs/api/Admin/Evacuate';

interface HistoryEvacuateParams {
  draw?: number;
  sortColumn?: string;
  sortDir?: string;
  start?: number;
  length?: number;
  searchValue?: string;
  searchRegex?: boolean;
  siteId?: string;
  emergencyStatus?: number;
  startDate?: string;
  endDate?: string;
}

export const useHistoryEvacuate = (params?: HistoryEvacuateParams) => {
  return useQuery({
    queryKey: ['history-evacuate', params],
    queryFn: () => createHistoryChart(params ?? {}),
  });
};
