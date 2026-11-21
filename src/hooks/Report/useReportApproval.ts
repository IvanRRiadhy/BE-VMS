import { useMutation } from '@tanstack/react-query';
import { exportReportApproval, getReportApproval } from 'src/customs/api/Admin/Report';

export const useReportApproval = () => {
  return useMutation({
    mutationKey: ['report-approval'],
    mutationFn: (payload: any) => getReportApproval(payload),
  });
};

export const useExportReportApproval = () => {
  return useMutation({
    mutationFn: exportReportApproval,
  });
};