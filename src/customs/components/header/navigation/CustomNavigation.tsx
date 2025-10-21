import { useMediaQuery, Box, Drawer, Theme, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { AppState } from 'src/store/Store';
import CustomNavListing, { ItemDataCustomNavListing } from './CustomNavListing';
import CustomSidebarItems, { ItemDataCustomSidebarItems } from './CustomSidebarItems';
import Logo from '../../logo/Logo';
import { useState, useEffect } from 'react';

interface CustomNavigationProps {
  itemDataCustomNavListing: ItemDataCustomNavListing[];
  itemDataCustomSidebarItems: ItemDataCustomSidebarItems[];
}

const CustomNavigation: React.FC<CustomNavigationProps> = ({
  itemDataCustomNavListing,
  itemDataCustomSidebarItems,
}) => {
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Sun, 12 Dec 2022 | 12:00 AM
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentTime(now.toLocaleString('en-US', options));
    };

    updateTime(); // set waktu pertama kali
    const interval = setInterval(updateTime, 1000); // update tiap detik

    return () => clearInterval(interval);
  }, []);

  if (lgUp) {
    return (
      <Box
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'white',
          width: '100%',
          px: 1.5,
          py: 3,
          borderRadius: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* NavListing on top for desktop (FULL WIDTH) */}
        {/* ------------------------------------------- */}
        <Box sx={{ px: 2 }} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <CustomNavListing itemData={itemDataCustomNavListing} />
          <Typography variant="body2" fontWeight={500}>
            {currentTime}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={customizer.isMobileSidebar}
      onClose={() => dispatch(toggleMobileSidebar())}
      variant="temporary"
      PaperProps={{
        sx: {
          width: customizer.SidebarWidth,
          border: '0 !important',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------- */}
      <Box px={2}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/39/BI_Logo.png"
          width={'180px'}
        />
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <CustomSidebarItems itemData={itemDataCustomSidebarItems} />
    </Drawer>
  );
};

export default CustomNavigation;
