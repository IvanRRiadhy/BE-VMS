import { useQuery } from "@tanstack/react-query";
import { getPendingApproval } from "src/customs/api/Employee/Dashboard";

export const useApproval= ({
  page,
  rowsPerPage,
  keyword,
  sortDir,
}: {
  page: number;
  rowsPerPage: number;
  keyword: string;
  sortDir: string;
}) => {
  return useQuery({
    queryKey: ['approval', page, rowsPerPage, keyword, sortDir],
    queryFn: () => {
      return getPendingApproval({
        start: page * rowsPerPage,
        length: rowsPerPage,
        sort_dir: sortDir,
        keyword,
        approval_status: 'Pending',
      });
    },
  });
};
