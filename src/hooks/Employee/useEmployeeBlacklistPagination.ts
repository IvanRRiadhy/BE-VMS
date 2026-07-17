import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllEmployeeBlacklistPagination } from 'src/customs/api/admin';

interface Filters {
    gender: number;
    organization: string;
    department: string;
    district: string;
    joinStart: string;
    exitEnd: string;
    statusEmployee: number;
}

interface Props {
    page: number;
    rowsPerPage: number;
    sortDir: string;
    search: string;
    filters?: Filters;
}

export const useEmployeeBlacklistPagination = ({
    page,
    rowsPerPage,
    sortDir,
    search,
}: Props) => {
    return useQuery({
        queryKey: [
            'employee-blacklist',
            page,
            rowsPerPage,
            sortDir,
            search,
        ],
        queryFn: async () => {
            const start = page * rowsPerPage;

            return await getAllEmployeeBlacklistPagination(
                start,
                rowsPerPage,
                sortDir,
                search,
                true,
            );
        },
        placeholderData: keepPreviousData,
    });
};