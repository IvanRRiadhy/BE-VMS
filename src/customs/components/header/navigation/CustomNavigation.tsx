import { useMediaQuery, Box, Drawer, Theme, Typography, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { AppState } from 'src/store/Store';
import CustomNavListing, { ItemDataCustomNavListing } from './CustomNavListing';
import CustomSidebarItems, { ItemDataCustomSidebarItems } from './CustomSidebarItems';
import Logo from 'src/assets/images/logos/BI_Logo.png';
// import Logo from 'src/assets/images/logos/bio-experience-1x1-logo.png';
import CurrentTime from './CurrentTIme';
import { useProfile } from 'src/hooks/Profile/useProfile';
import { useOperatorToolbar } from 'src/customs/contexts/OperatorToolbarContext';

interface CustomNavigationProps {
  itemDataCustomNavListing: ItemDataCustomNavListing[];
  itemDataCustomSidebarItems: ItemDataCustomSidebarItems[];
}

const CustomNavigation: React.FC<CustomNavigationProps> = ({
  itemDataCustomNavListing,
  itemDataCustomSidebarItems,
}) => {
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const xlUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));
  const xl = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const { data: profile } = useProfile();
  const isOperatorAdmin = profile?.group_name === 'OperatorVMS';
  const { toolbar } = useOperatorToolbar();
  if (xl) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          width: '100%',
          px: xl ? '10px !important' : '5px !important',
          py: 2,
          borderRadius: 0,
        }}
      >
        <Box
          sx={{ px: 1, zIndex: 9999, position: 'sticky', top: 0 }}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <CustomNavListing itemData={itemDataCustomNavListing} />
          <Box display={'flex'} alignItems={'center'} gap={1}>
            {toolbar}
            {xlUp && <CurrentTime />}
          </Box>
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
      <Box px={1} py={1} display="flex" justifyContent="center" alignItems="center">
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
