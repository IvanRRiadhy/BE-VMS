import { useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

interface BackToTopButtonProps {
  showAfter?: number;
}

const BackToTopButton = ({ showAfter = 20 }: BackToTopButtonProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfter]);

  if (!show) return null;

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Tooltip title="Back to Top" placement="left" arrow>
      <Box
        onClick={handleScrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          border: '2px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s ease',
          '&:hover': {
            backgroundColor: 'primary.main',
            transform: 'scale(1.05)',
          },
        }}
      >
        <KeyboardArrowUp
          sx={{
            color: '#fff',
            fontSize: 30,
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default BackToTopButton;
