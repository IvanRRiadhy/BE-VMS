import { useNavigate } from 'react-router-dom';
import { useGlobalLoading } from 'src/customs/contexts/GlobalLoadingContext';

/**
 * navigate() + loader: tampilkan loader sebelum pindah halaman.
 */
export const useNavigateWithLoader = () => {
  const navigate = useNavigate();
  const { show, hide } = useGlobalLoading();

  const navigateWithLoader = (to: string, delay = 200) => {
    show(); // tampilkan spinner dulu
    setTimeout(() => {
      navigate(to);
    }, delay);
  };

  return { navigateWithLoader, show, hide };
};
