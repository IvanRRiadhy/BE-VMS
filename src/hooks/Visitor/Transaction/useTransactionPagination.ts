import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getVisitorTransactionPagination } from "src/customs/api/admin";

interface Props {
    // page: number;
    rowsPerPage: number;
    sortDir: string;
    search: string;
    filters: any;
}

export const useTransactionVisitorPagination = ({
    rowsPerPage,
    sortDir,
    search,
    filters,
}: Props) => {
    return useInfiniteQuery({
        queryKey: [
            'transaction-visitor',
            rowsPerPage,
            sortDir,
            search,
            filters,
        ],

        initialPageParam: 0,
        staleTime: 30 * 1000,
        queryFn: ({ pageParam }) =>
            getVisitorTransactionPagination(
                pageParam,
                rowsPerPage,
                sortDir,
                search || undefined,
                filters.start_date || undefined,
                filters.end_date || undefined,
                filters.visitor_status || undefined,
                filters.data_filter,
                filters.transaction_status || undefined,
                filters.site_id || undefined,
                filters.visitor_role || undefined,
                filters.emergency_situation === ''
                    ? undefined
                    : filters.emergency_situation === 'true',
                filters.is_block === ''
                    ? undefined
                    : filters.is_block === 'true',
                filters.host_id || undefined,
            ),

        getNextPageParam: (lastPage, pages) => {
            const loaded = pages.reduce(
                (sum, p) => sum + p.collection.length,
                0,
            );

            return loaded >= lastPage.RecordsFiltered
                ? undefined
                : loaded;
        },

        placeholderData: (prev) => prev,
    });
};