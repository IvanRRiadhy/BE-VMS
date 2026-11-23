import { useMutation } from '@tanstack/react-query';
import { exportReportVisitor, getReportVisitor } from 'src/customs/api/Admin/Report';

export const useReportVisitor = () => {
  return useMutation({
    mutationFn: getReportVisitor,
  });
};

export const useExportReportVisitor = () => {
  return useMutation({
    mutationFn: exportReportVisitor,
  });
};
