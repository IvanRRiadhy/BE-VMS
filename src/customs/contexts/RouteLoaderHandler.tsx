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

// import { useEffect, useRef } from 'react';
// import { useLocation, useNavigation } from 'react-router-dom';
// import { useGlobalLoading } from './GlobalLoadingContext';

// export const RouteLoaderHandler = () => {
//   const { show, hide } = useGlobalLoading();
//   const location = useLocation();
//   const navigation = useNavigation ? useNavigation() : null;
//   const prevPath = useRef(location.pathname);

//   useEffect(() => {
//     // ✅ Jika ada useNavigation() aktif (data router)
//     if (navigation && navigation.state !== undefined) {
//       if (navigation.state === 'loading' || navigation.state === 'submitting') {
//         show();
//       } else {
//         hide();
//       }
//       return;
//     }

//     // ✅ Fallback: deteksi perubahan path manual (classic Routes)
//     if (location.pathname !== prevPath.current) {
//       prevPath.current = location.pathname;
//       show();
//       const timer = setTimeout(() => hide(), 600);
//       return () => clearTimeout(timer);
//     }
//   }, [location.pathname, navigation?.state]);

//   return null;
// };
