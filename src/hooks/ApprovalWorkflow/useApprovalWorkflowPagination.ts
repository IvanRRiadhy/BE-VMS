import { useQuery } from '@tanstack/react-query';
import { getApprovalWorkflowByDt } from 'src/customs/api/Admin/ApprovalWorkflow';

interface Props {
    page: number;
    rowsPerPage: number;
    search: string;
    sortDir?: string;
}

const QUERY_KEY = ['approval-workflow'];

const useApprovalWorkflowPagination = ({
    page,
    rowsPerPage,
    search,
    sortDir = 'desc',
}: Props) => {
    return useQuery({
        queryKey: [...QUERY_KEY, page, rowsPerPage, sortDir, search],

        queryFn: async () => {
            const start = page * rowsPerPage;

            const response = await getApprovalWorkflowByDt(
                start,
                rowsPerPage,
                sortDir,
                search,
            );

            return {
                collection: response.collection.map(
                    ({ conditions, ...rest }: any) => rest,
                ),
                totalRecords: response.RecordsTotal,
                totalFilteredRecords: response.RecordsFiltered,
            };
        },

        placeholderData: (prev) => prev,
    });
};

export default useApprovalWorkflowPagination;