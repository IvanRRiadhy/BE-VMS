import { useSearchParams } from 'react-router-dom';

export const useTableQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || 0);
  const search = searchParams.get('search') || '';

  const setPage = (page: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      params.set('page', String(page));

      return params;
    });
  };

  const setSearch = (keyword: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (keyword?.trim()) {
        params.set('search', keyword);
      } else {
        params.delete('search');
      }

      params.set('page', '0');

      return params;
    });
  };

  return {
    page,
    search,
    setPage,
    setSearch,
  };
};
