import { useQuery } from '@tanstack/react-query';
import { getAllVisitorPagination } from 'src/customs/api/admin';
import dayjs from 'dayjs';

interface Filters {
    status?: string | number;
    visitor_role: string;
    host_id: string;
    site_id: string;
    is_block: string;
    transaction_status: string;
    emergency_situation: string;
    start_date: string;
    end_date: string;
    data_filter?: string;
}

interface Props {
    page: number;
    rowsPerPage: number;
    search: string;
    filters: Filters;
}

export const useVisitorPagination = ({
    page,
    rowsPerPage,
    search,
    filters,
}: Props) => {

    return useQuery({
        queryKey: [
            'visitors',
            page,
            rowsPerPage,
            search,
            filters,
        ],
        staleTime: 30 * 1000,
        queryFn: async () => {
            try {
                const res = await getAllVisitorPagination(
                    page * rowsPerPage,
                    rowsPerPage,
                    search || undefined,
                    filters.start_date
                        ? dayjs(filters.start_date).utc().toISOString()
                        : undefined,
                    filters.end_date
                        ? dayjs(filters.end_date).utc().toISOString()
                        : undefined,
                    filters.status && filters.status !== 'All'
                        ? String(filters.status)
                        : undefined,
                    filters.data_filter,
                    filters.site_id || undefined,
                    filters.visitor_role || undefined,
                    filters.emergency_situation === ''
                        ? undefined
                        : filters.emergency_situation === 'true',
                    filters.is_block === ''
                        ? undefined
                        : filters.is_block === 'true',
                    filters.host_id || undefined,
                );
                return res;
            } catch (err) {
                console.error('Visitor Query Error', err);
                throw err;
            }
        },

        placeholderData: (prev) => prev,
    });
};