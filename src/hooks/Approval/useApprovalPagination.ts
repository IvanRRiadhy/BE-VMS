// import { useQuery } from '@tanstack/react-query';
// import { getApprovalTicket } from 'src/customs/api/Admin/ApprovalWorkflow';
// import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

// interface Props {
//   page: number;
//   rowsPerPage: number;
//   search: string;
//   sortDir: string;
//   filters?: {
//     'approval-status'?: string;
//   };
// }

// export const useApprovalPagination = ({ page, rowsPerPage, search, sortDir, filters }: Props) => {
//   return useQuery({
//     queryKey: ['approval', page, rowsPerPage, search, sortDir, filters],

//     queryFn: async () => {
//       const res = await getApprovalTicket({
//         start: page * rowsPerPage,
//         length: rowsPerPage,
//         keyword: search,
//         sort_dir: sortDir,
//         entity_type: 'Invitation',
//         approval_status: filters?.['approval-status'],
//       });

//       return {
//         totalRecords: res.RecordsTotal,
//         totalFiltered: res.RecordsFiltered,

//         collection: res.collection.map((item: any) => ({
//           approval_ticket_id: item.approval_ticket_id,
//           visitor_type_name: item.visitor_type_name,
//           agenda: item.agenda,
//           host_name: item.host_name,
//           entity_id: item.entity_id,
//           ticket_id: item.ticket_id,
//           approval_actor_status: item.approval_actor_status,
//           approval_workflow_type: item.approval_workflow_type,
//           approval_status: item.approval_status,
//           current_step: item.current_step,
//           visitor_period_start: formatDateTime(item.visitor_period_start),
//           visitor_period_end: formatDateTime(item.visitor_period_end),
//           is_final: item.is_final,
//           is_reviewer: item.is_reviewer,
//         })),
//       };
//     },

//     placeholderData: (prev) => prev,

//     // refetchInterval: 10000,
//     // refetchIntervalInBackground: true,
//   });
// };

import { useInfiniteQuery } from '@tanstack/react-query';
import { getApprovalTicket } from 'src/customs/api/Admin/ApprovalWorkflow';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface Props {
  rowsPerPage: number;
  search: string;
  sortDir: string;
  filters?: {
    'approval-status'?: string;
  };
}

export const useApprovalPagination = ({ rowsPerPage, search, sortDir, filters }: Props) => {
  return useInfiniteQuery({
    queryKey: ['approval', rowsPerPage, search, sortDir, filters],

    initialPageParam: 0,

    queryFn: async ({ pageParam }) => {
      const res = await getApprovalTicket({
        start: pageParam * rowsPerPage,
        length: rowsPerPage,
        keyword: search,
        sort_dir: sortDir,
        entity_type: 'Invitation',
        approval_status: filters?.['approval-status'],
      });

      return {
        totalRecords: res.RecordsTotal,
        totalFiltered: res.RecordsFiltered,

        collection: res.collection.map((item: any) => ({
          approval_ticket_id: item.approval_ticket_id,
          visitor_type_name: item.visitor_type_name,
          agenda: item.agenda,
          host_name: item.host_name,
          entity_id: item.entity_id,
          ticket_id: item.ticket_id,
          approval_actor_status: item.approval_actor_status,
          approval_workflow_type: item.approval_workflow_type,
          approval_status: item.approval_status,
          current_step: item.current_step,
          visitor_period_start: formatDateTime(item.visitor_period_start),
          visitor_period_end:
            item.visitor_period_end === '9999-01-01T00:00:00'
              ? '-'
              : formatDateTime(item.visitor_period_end, item.extend_visitor_period),

          is_final: item.is_final,
          is_reviewer: item.is_reviewer,
        })),
      };
    },

    getNextPageParam: (lastPage, allPages) => {
      const loadedRecords = allPages.reduce((total, page) => total + page.collection.length, 0);

      if (loadedRecords >= lastPage.totalFiltered) {
        return undefined;
      }

      return allPages.length;
    },
  });
};
