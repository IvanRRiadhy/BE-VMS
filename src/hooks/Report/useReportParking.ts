import { useMutation } from '@tanstack/react-query';
import { exportReportParking, getReportParking } from 'src/customs/api/Admin/Report';

export const useReportParking = () => {
  return useMutation({
    mutationFn: getReportParking,
  });
};

export const useExportReportParking = () => {
  return useMutation({
    mutationFn: exportReportParking,
  });
};
