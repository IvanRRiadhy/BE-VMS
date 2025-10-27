import React from 'react';
import { useLocation } from 'react-router';
import { Box, List, Theme, useMediaQuery } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { AppState } from 'src/store/Store';
import NavCollapse from 'src/layouts/full/horizontal/navbar/NavCollapse/NavCollapse';
import NavItem from 'src/layouts/full/horizontal/navbar/NavItem/NavItem';

export interface ItemDataCustomNavListing {
  id: string;
  title: string;
  icon: React.ElementType;
  href: string;
  chip?: string;
  chipColor?: string;
  children?: ItemDataCustomNavListing[];
}

interface CustomNavListingProps {
  itemData: ItemDataCustomNavListing[];
}

const CustomNavGuestListing: React.FC<CustomNavListingProps> = ({ itemData }) => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';

  return (
    <Box>
      <List sx={{ p: 0, display: 'flex', gap: '3px', zIndex: '100' }}>
        {itemData.map((item) => {
          if (item.children) {
            return (
              <NavCollapse
                key={item.id}
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                onClick={undefined}
              />
            );
          } else {
            return (
              <NavItem
                key={item.id}
                item={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => {
                  // Implement your navigation logic here
                }}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default CustomNavGuestListing;
