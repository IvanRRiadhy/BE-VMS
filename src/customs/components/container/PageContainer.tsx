import React, { useEffect, useState } from 'react';
import CustomNavigation from 'src/customs/components/header/navigation/CustomNavigation';
import { styled, Box, useTheme, useMediaQuery, Divider } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { AppState } from 'src/store/Store';
import ScrollToTop from 'src/components/shared/ScrollToTop';
import { ItemDataCustomNavListing } from '../header/navigation/CustomNavListing';
import CustomSidebarItems, {
  ItemDataCustomSidebarItems,
} from '../header/navigation/CustomSidebarItems';
import HeaderHorizontal from 'src/customs/components/header/desktop_screen/HeaderHorizontal';
import HeaderVertical from 'src/customs/components/header/mobile_screen/HeaderVertical';
import Customizer from 'src/layouts/full/shared/customizer/Customizer';
import Logo from 'src/assets/images/logos/BI_Logo.png';

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
  // bgcolor: 'background.paper !important',
}));

const PageContainer: React.FC<CustomPageContainerProps> = ({
  itemDataCustomNavListing = [],
  itemDataCustomSidebarItems = [],
  children,
}) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const [hideChrome, setHideChrome] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setHideChrome(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const xl = useMediaQuery((theme: any) => theme.breakpoints.up('xl'));

  // if (xl) {
  //   return (
  //     <Box
  //       sx={{
  //         width: 260,
  //         height: '100vh',
  //         position: 'sticky',
  //         top: 0,
  //         bgcolor: 'background.paper',
  //         borderRight: '1px solid rgba(0,0,0,.08)',
  //         display: 'flex',
  //         flexDirection: 'column',
  //         overflow: 'auto',
  //       }}
  //     >
  //       <Box py={2} display="flex" justifyContent="center">
  //         <img src={Logo} width={55} height={55} />
  //       </Box>

  //       <Divider />

  //       <CustomSidebarItems itemData={itemDataCustomSidebarItems} />

  //       {/* <Box mt="auto" p={2}>
  //         <CurrentTime />
  //       </Box> */}
  //     </Box>
  //   );
  // }

  return (
    <>
      <MainWrapper
        className={customizer.activeMode === 'dark' ? 'darkbg mainwrapper' : 'mainwrapper'}
      >
        {/* {xl && (
          <Box
            sx={{
              width: 260,
              height: '100vh',
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(0,0,0,.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              flexShrink: 0,
            }}
          >
            <Box py={2} display="flex" justifyContent="center">
              <img src={Logo} width={55} height={55} />
            </Box>

            <Divider />

            <CustomSidebarItems itemData={itemDataCustomSidebarItems} />
          </Box>
        )} */}
        <PageWrapper
          className="page-wrapper"
          sx={{
            ...(customizer.isCollapse && {
              [theme.breakpoints.up('lg')]: { ml: `${customizer.MiniSidebarWidth}px` },
            }),
          }}
        >
          {/* Header */}
          {!hideChrome &&
            (customizer.isHorizontal ? (
              <HeaderHorizontal
                itemDataCustomNavListing={itemDataCustomNavListing}
                itemDataCustomSidebarItems={itemDataCustomSidebarItems}
              />
            ) : (
              <HeaderVertical />
            ))}

          {/* Navigation (Horizontal Only) */}
          {/* {customizer.isHorizontal && (
            <CustomNavigation
              itemDataCustomNavListing={itemDataCustomNavListing}
              itemDataCustomSidebarItems={itemDataCustomSidebarItems}
            />
          )} */}

          <Box
            sx={{
              borderRadius: 0,
              background: '#ebedefff',
              // bgcolor: 'background.paper',
              paddingTop: '5px !important',
              p: {
                xs: '10px',
                // md: '15px',
              },
              width: '100%',
              paddingBottom: '0px !important',
            }}
          >
            <Box
              sx={{
                minHeight: 'calc(100vh - 170px)',
                background: '#ebedefff',
                // bgcolor: 'background.paper',
              }}
            >
              {React.isValidElement(children) ? (
                <ScrollToTop>{children}</ScrollToTop>
              ) : (
                children
              )}{' '}
            </Box>
          </Box>
          {/* <Customizer /> */}
        </PageWrapper>
      </MainWrapper>
    </>
  );
};

export default PageContainer;
