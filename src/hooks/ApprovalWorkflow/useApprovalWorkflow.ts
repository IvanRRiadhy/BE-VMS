import { useQuery } from '@tanstack/react-query';
import { getAllApprovalWorkflow } from 'src/customs/api/Admin/ApprovalWorkflow';


export const useApprovalWorkflow = () => {
    return useQuery({
        queryKey: ['approval-workflow'],
        queryFn: getAllApprovalWorkflow,
        select: (data) => data.collection,
    });
};