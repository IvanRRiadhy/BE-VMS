import React from 'react';
import CustomNavigation from 'src/customs/components/header/navigation/CustomNavigation';
import { styled, Box, useTheme } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { AppState } from 'src/store/Store';
import ScrollToTop from 'src/components/shared/ScrollToTop';
import { ItemDataCustomNavListing } from '../header/navigation/CustomNavListing';
import { ItemDataCustomSidebarItems } from '../header/navigation/CustomSidebarItems';
import HeaderHorizontal from 'src/customs/components/header/desktop_screen/HeaderHorizontal';
import HeaderVertical from 'src/customs/components/header/mobile_screen/HeaderVertical';

export interface CustomPageContainerProps {
  itemDataCustomNavListing?: ItemDataCustomNavListing[];
  itemDataCustomSidebarItems?: ItemDataCustomSidebarItems[];
  children: React.ReactNode; // untuk menerima komponen atau elemen lain
}

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  zIndex: 1,
  width: '100%',
  background: '#ebedefff !important',
}));

const PageContainer: React.FC<CustomPageContainerProps> = ({
  itemDataCustomNavListing = [],
  itemDataCustomSidebarItems = [],
  children,
}) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  return (
    <>
      <MainWrapper
        className={customizer.activeMode === 'dark' ? 'darkbg mainwrapper' : 'mainwrapper'}
      >
        <PageWrapper
          className="page-wrapper"
          sx={{
            ...(customizer.isCollapse && {
              [theme.breakpoints.up('lg')]: { ml: `${customizer.MiniSidebarWidth}px` },
            }),
          }}
        >
          {/* Header */}
          {customizer.isHorizontal ? (
            <HeaderHorizontal
              itemDataCustomNavListing={itemDataCustomNavListing}
              itemDataCustomSidebarItems={itemDataCustomSidebarItems}
            />
          ) : (
            <HeaderVertical />
          )}

          {/* Navigation (Horizontal Only) */}
          {/* {customizer.isHorizontal && (
            <CustomNavigation
              itemDataCustomNavListing={itemDataCustomNavListing}
              itemDataCustomSidebarItems={itemDataCustomSidebarItems}
            />
          )} */}

          {/* Ganti Feed ke Box */}
          <Box
            sx={{
              borderRadius: 0,
              background: '#ebedefff',
              p: {
                xs: '10px',
                // md: '15px',
              },
              width: '100%',
            }}
          >
            <Box sx={{ minHeight: 'calc(100vh - 170px)', background: '#ebedefff' }}>
              {React.isValidElement(children) ? <ScrollToTop>{children}</ScrollToTop> : children}{' '}
            </Box>
          </Box>
        </PageWrapper>
      </MainWrapper>
    </>
  );
};

export default PageContainer;
