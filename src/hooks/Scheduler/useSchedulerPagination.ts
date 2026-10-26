import { useQuery } from '@tanstack/react-query';
import { getSchedulerDeliveryPagination } from 'src/customs/api/Delivery/Scheduler';

interface Filters {
    visitor_type_id: string | null;
    host_id: string | null;
    site_id: string | null;
    time_access_id: string | null;
}

interface Props {
    page: number;
    rowsPerPage: number;
    sortColumn: string;
    sortDir: string;
    search: string;
    filters: Filters;
}

export const useSchedulerPagination = ({
    page,
    rowsPerPage,
    sortColumn,
    sortDir,
    search,
    filters,
}: Props) => {
    return useQuery({
        queryKey: [
            'scheduler',
            page,
            rowsPerPage,
            sortColumn,
            sortDir,
            search,
            filters,
        ],

        queryFn: () =>
            getSchedulerDeliveryPagination(
                page * rowsPerPage,
                rowsPerPage,
                sortColumn,
                sortDir,
                search,
                filters.visitor_type_id || undefined,
                filters.host_id || undefined,
                filters.time_access_id || undefined,
                filters.site_id || undefined,
            ),

        placeholderData: (prev) => prev,
    });
};