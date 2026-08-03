import { useQuery } from "@tanstack/react-query";
import { getUpComingVisitors } from "src/customs/api/operator";
import { formatDateTime } from "src/utils/formatDatePeriodEnd";

export const useUpcomingVisitors = ({
    page,
    rowsPerPage,
    sortDir,
    selectedPurpose,
    search,
}: {
    page: number;
    rowsPerPage: number;
    sortDir: string;
    selectedPurpose?: any;
    search?: string;
}) => {
    return useQuery({
        queryKey: [
            'upcoming-visitors',
            page,
            rowsPerPage,
            sortDir,
            selectedPurpose?.id,
            search
        ],
        queryFn: async () => {
            const res = await getUpComingVisitors({
                today: 'true',
                visitor_type:
                    typeof selectedPurpose?.id === 'string'
                        ? selectedPurpose.id
                        : undefined,
                start: page * rowsPerPage,
                length: rowsPerPage,
                sortDir,
                search,
            });


            return {
                recordsTotal: res.RecordsTotal,
                recordsFiltered: res.RecordsFiltered,
                collection: res.collection.map((items: any) => ({
                    id: items.id,
                    name: items.visitor_name,
                    host: items.host_name,
                    invitation_code: items.invitation_code,
                    organization: items.visitor_organization_name,
                    agenda: items.agenda,
                    visitor_period_start: formatDateTime(items.visitor_period_start),
                    visitor_period_end: formatDateTime(
                        items.visitor_period_end,
                        items.extend_visitor_period,
                    ),
                    visitor_status: items.visitor_status,
                    vehicle_type: items.vehicle_type,
                    vehicle_plate_number: items.vehicle_plate_number,
                })),
            };
        },
        placeholderData: (previousData) => previousData,
    });
};