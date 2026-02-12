import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useGlobalLoading } from './GlobalLoadingContext';

export const RouteLoaderHandler = () => {
  const { show, hide } = useGlobalLoading();
  const location = useLocation();

  useEffect(() => {
    // panggil segera sebelum React render ulang halaman
    show();

    // sembunyikan loader setelah halaman benar-benar siap
    const timeout = setTimeout(() => hide(), 400);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
};
