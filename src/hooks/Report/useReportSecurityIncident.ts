import { useMutation } from '@tanstack/react-query';
import { exportReportSecurityIncident, getReportSecurityIncident } from 'src/customs/api/Admin/Report';



export const useReportSecurityIncident = () => {
  return useMutation({
    mutationFn: getReportSecurityIncident,
    retry: false,
  });
};

export const useExportReportSecurityIncident = () => {
  return useMutation({
    mutationFn: exportReportSecurityIncident,
    retry: false,
  });
};
