// import { useQuery } from '@tanstack/react-query';
// import { getAllVisitorCardPagination } from 'src/customs/api/admin';

// interface Filters {
//   type?: number;
//   card_status?: number;
//   is_used?: boolean | undefined;
// }

// interface Props {
//   page: number;
//   rowsPerPage: number;
//   sortDir: string;
//   sort_column?: string;
//   search: string;
//   filters: Filters;
// }

// export const useVisitorCardPagination = ({
//   page,
//   rowsPerPage,
//   sortDir,
//   sort_column,
//   search,
//   filters,
// }: Props) => {
//   return useQuery({
//     queryKey: [
//       'visitor-card',
//       {
//         page,
//         rowsPerPage,
//         sortDir,
//         sort_column,
//         search,
//         type: filters.type,
//         card_status: filters.card_status,
//         'is-used': filters.is_used,
//       },
//     ],

//     queryFn: () =>
//       getAllVisitorCardPagination(
//         page * rowsPerPage,
//         rowsPerPage,
//         search,
//         sortDir,
//         sort_column,
//         filters.type === -1 ? undefined : filters.type,
//         filters.card_status === -1 ? undefined : filters.card_status,
//         filters.is_used,
//       ),

//     placeholderData: (previousData) => previousData,
//   });
// };

import { useQuery } from '@tanstack/react-query';
import { getAllVisitorCardPagination } from 'src/customs/api/admin';

interface Filters {
  type?: number;
  card_status?: number;
  is_used?: boolean;
}

interface Props {
  page: number;
  rowsPerPage: number;
  sortDir: string;
  sort_column?: string;
  search: string;
  filters: Filters;
}

export const useVisitorCardPagination = ({
  page,
  rowsPerPage,
  sortDir,
  sort_column,
  search,
  filters,
}: Props) => {
  return useQuery({
    queryKey: [
      'visitor-card',
      {
        page,
        rowsPerPage,
        sortDir,
        sort_column,
        search,
        type: filters.type,
        card_status: filters.card_status,
        'is-used': filters.is_used,
      },
    ],

    queryFn: () =>
      getAllVisitorCardPagination(
        page * rowsPerPage,
        rowsPerPage,
        search,
        sortDir,
        sort_column,
        filters.type === -1 ? undefined : filters.type,
        filters.card_status === -1 ? undefined : filters.card_status,
        filters.is_used,
      ),

    placeholderData: (previousData) => previousData,
  });
};