import { useQuery } from '@tanstack/react-query';
import { getUserGroupDt } from 'src/customs/api/admin';

interface UseUserGroupsProps {
    page: number;
    rowsPerPage: number;
    search: string;
    sortDir?: string;
}

const QUERY_KEY = ['users-group'];

const useUserGroups = ({
    page,
    rowsPerPage,
    search,
    sortDir = 'desc',
}: UseUserGroupsProps) => {
    return useQuery({
        queryKey: [...QUERY_KEY, page, rowsPerPage, search, sortDir],
        queryFn: async () => {
            const start = page * rowsPerPage;

            const response = await getUserGroupDt(
                start,
                rowsPerPage,
                search,
                sortDir,
            );

            const collection = response.collection.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                homepage: item.homepage,
                level_priority: item.level_priority,
                role_access: item.role_access,
            }));

            return {
                collection,
                tableCollection: collection,
                totalRecords: response.recordsTotal,
                totalFiltered: response.recordsFiltered,
            };
        },
        placeholderData: (prev) => prev,
    });
};

export default useUserGroups;