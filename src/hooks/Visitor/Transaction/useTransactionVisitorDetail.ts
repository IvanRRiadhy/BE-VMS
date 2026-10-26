import { useQuery } from "@tanstack/react-query";
import { getVisitorTransactionByIds } from "src/customs/api/admin";

export const useTransactionVisitorDetail = (
    id?: string,
) => {
    return useQuery({
        queryKey: ['transaction-visitor-detail', id],

        enabled: !!id,

        queryFn: () =>
            getVisitorTransactionByIds(id!),

        placeholderData: (prev) => prev,
    });
};