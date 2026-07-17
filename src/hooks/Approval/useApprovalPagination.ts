import { useQuery } from '@tanstack/react-query';
import { getApprovalTicket } from 'src/customs/api/Admin/ApprovalWorkflow';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface Props {
    page: number;
    rowsPerPage: number;
    search: string;
    sortDir: string;
}

export const useApprovalPagination = ({
    page,
    rowsPerPage,
    search,
    sortDir,
}: Props) => {
    return useQuery({
        queryKey: [
            'approval',
            page,
            rowsPerPage,
            search,
            sortDir,
        ],

        queryFn: async () => {
            const res = await getApprovalTicket({
                start: page * rowsPerPage,
                length: rowsPerPage,
                keyword: search,
                sort_dir: sortDir,
                entity_type: 'Invitation',
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
                    visitor_period_end: formatDateTime(item.visitor_period_end),
                })),
            };
        },

        placeholderData: (prev) => prev,
        // refresh otomatis
        refetchInterval: 10000,
        refetchIntervalInBackground: true,
    });
};