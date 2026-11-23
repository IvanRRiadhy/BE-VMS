import { useMutation } from '@tanstack/react-query';
import { exportReportParking, getReportParking } from 'src/customs/api/Admin/Report';

export const useReportParking = () => {
  return useMutation({
    mutationKey: ['report-parking'],
    mutationFn: (payload: any) => getReportParking(payload),
  });
};

export const useExportReportParking = () => {
  return useMutation({
    mutationFn: exportReportParking,
  });
};
