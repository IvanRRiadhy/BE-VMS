import { useQuery } from "@tanstack/react-query";
import { getUpComingPurpose } from "src/customs/api/operator";

export const useUpcomingPurpose = () =>
    useQuery({
        queryKey: ['upcoming-purpose'],
        queryFn: async () => {
            const res = await getUpComingPurpose({
                today: 'true',
                all_visitor_type: 'true',
            });

            return res.collection ?? [];
        },
    });