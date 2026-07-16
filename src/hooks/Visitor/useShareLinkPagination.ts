import { useQuery } from '@tanstack/react-query';
import { getShareLinkByDt } from 'src/customs/api/Admin/ShareLink';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface Props {
    page: number;
    rowsPerPage: number;
    search: string;
    sortDir: string;
}

export const useShareLinkPagination = ({
    page,
    rowsPerPage,
    search,
    sortDir,
}: Props) => {
    return useQuery({
        queryKey: [
            'share-link',
            page,
            rowsPerPage,
            search,
            sortDir,
        ],

        queryFn: async () => {
            const res = await getShareLinkByDt(
                page * rowsPerPage,
                rowsPerPage,
                search,
                sortDir,
            );

            return {
                ...res,
                collection:
                    res.collection?.map((item: any) => ({
                        id: item.id,
                        agenda: item.agenda,
                        url: item.url,
                        shorten_url: item.shorten_url,
                        current_usage: item.current_usage,
                        max_usage: item.max_usage,
                        visitor_period_start: formatDateTime(item.visitor_period_start),
                        visitor_period_end: formatDateTime(item.visitor_period_end),
                        expired_at: (() => {
                            const date = new Date(item.expired_at + 'Z');

                            const formattedDate = date.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            });

                            const formattedTime = date
                                .toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                })
                                .replace(':', '.');

                            return `${formattedDate}, ${formattedTime}`;
                        })(),
                        link_status: item.link_status,
                    })) ?? [],
            };
        },

        placeholderData: (prev) => prev,
    });
};