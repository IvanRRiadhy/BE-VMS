import { useQuery } from '@tanstack/react-query';
import { getApiKeyDT } from 'src/customs/api/Admin/Setting';

export const useApiKeyDT = (
  page: number,
  length: number,
  sort_column: string,
  sortDir: string,
  keyword: string,
) => {
  return useQuery({
    queryKey: ['api-keys', 'pagination', page, length, sort_column, sortDir, keyword],
    queryFn: () => getApiKeyDT(page, length, sort_column, sortDir, keyword),
    placeholderData: (prev) => prev,
  });
};
