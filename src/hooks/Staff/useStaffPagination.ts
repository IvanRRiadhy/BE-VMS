import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllDriverPaginationFilterMore } from 'src/customs/api/Delivery/Driver';

interface DriverPaginationProps {
    page: number;
    rowsPerPage: number;
    sortColumn: string;
    sortDir: string;
    search: string;
    filters: {
        gender: number;
        organization: string;
        department: string;
        district: string;
        joinStart: string;
        exitEnd: string;
        statusEmployee: number;
    };
}


export const useDriverPagination = ({
    page,
    rowsPerPage,
    sortColumn,
    sortDir,
    search,
    filters,
}: DriverPaginationProps) => {
    return useQuery({
        queryKey: [
            ['staff', 'pagination'],
            page,
            rowsPerPage,
            sortColumn,
            sortDir,
            search,
            filters,
        ],

        queryFn: async () => {
            const start = page * rowsPerPage;

            return getAllDriverPaginationFilterMore(
                start,
                rowsPerPage,
                sortColumn,
                sortDir,
                search,
                filters.gender === 0 ? undefined : filters.gender,
                filters.joinStart,
                filters.exitEnd,
                filters.statusEmployee === 0
                    ? undefined
                    : filters.statusEmployee,
                filters.organization,
                filters.district,
                filters.department,
            );
        },

        placeholderData: keepPreviousData,
    });
};