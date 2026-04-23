import { useMediaQuery, Box, Drawer, Theme, Typography, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { AppState } from 'src/store/Store';
import CustomNavListing, { ItemDataCustomNavListing } from './CustomNavListing';
import CustomSidebarItems, { ItemDataCustomSidebarItems } from './CustomSidebarItems';
import Logo from 'src/assets/images/logos/BI_Logo.png';
// import Logo from 'src/assets/images/logos/bio-experience-1x1-logo.png';
import { useState, useEffect } from 'react';
import CurrentTime from './CurrentTIme';

interface CustomNavigationProps {
  itemDataCustomNavListing: ItemDataCustomNavListing[];
  itemDataCustomSidebarItems: ItemDataCustomSidebarItems[];
}

const CustomNavigation: React.FC<CustomNavigationProps> = ({
  itemDataCustomNavListing,
  itemDataCustomSidebarItems,
}) => {
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const xl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const [currentTime, setCurrentTime] = useState<string>();

  if (xl) {
    return (
      <Box
        sx={{
          // borderBottom: '1px solid rgba(0,0,0,0.05)',
          // position: 'sticky', // ✅ bikin nempel
          // top: 0, // ✅ nempel di atas
          // zIndex: 1100,
          background: 'white',
          width: '100%',
          px: xl ? '10px !important' : '5px !important',
          py: 2,
          borderRadius: 0,
          // overflow: 'hidden',
          // position: 'fixed'
        }}
      >
        <Box
          sx={{ px: 1, zIndex: 9999, position: 'sticky' }}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <CustomNavListing itemData={itemDataCustomNavListing} />
          {xl && <CurrentTime />}
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
      <Box px={1} py={1} display="flex" justifyContent="center" alignItems="center" >
        {/* <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/39/BI_Logo.png"
          width={'180px'}
        /> */}
        <img src={Logo} width={55} height={55} />
      </Box>
      <Divider />
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <CustomSidebarItems itemData={itemDataCustomSidebarItems} />
    </Drawer>
  );
};

export default CustomNavigation;
