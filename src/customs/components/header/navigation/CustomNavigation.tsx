import { useMediaQuery, Box, Drawer, Theme } from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { AppState } from 'src/store/Store';
import CustomNavListing, { ItemDataCustomNavListing } from './CustomNavListing';
import CustomSidebarItems, { ItemDataCustomSidebarItems } from './CustomSidebarItems';
import Logo from '../../logo/Logo';

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

  if (lgUp) {
    return (
      <Box
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: '#F4F7FA',
          width: '100%',
          px: 1.5,
          py: 3,
          borderRadius: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* NavListing on top for desktop (FULL WIDTH) */}
        {/* ------------------------------------------- */}
        <Box sx={{ px: 2 }}>
          <CustomNavListing itemData={itemDataCustomNavListing} />
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
        <Logo />
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <CustomSidebarItems itemData={itemDataCustomSidebarItems} />
    </Drawer>
  );
};

export default CustomNavigation;
