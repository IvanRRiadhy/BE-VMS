// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch, AppState } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import NavGroup from 'src/layouts/full/vertical/sidebar/NavGroup/NavGroup';
import NavCollapse from 'src/layouts/full/vertical/sidebar/NavCollapse';
import NavItem from 'src/layouts/full/vertical/sidebar/NavItem';

export interface ItemDataCustomSidebarItems {
  id?: string;
  title?: string;
  icon?: React.ElementType;
  href?: string;
  chip?: string;
  chipColor?: string;
  children?: ItemDataCustomSidebarItems[];
  navlabel?: boolean;
  subheader?: string;
}

interface CustomSidebarItemsProps {
  itemData: ItemDataCustomSidebarItems[];
}

const CustomSidebarItems: React.FC<CustomSidebarItemsProps> = ({ itemData }) => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: any = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const dispatch = useDispatch();

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 2 }} className="sidebarNav">
        {itemData.map((item) => {
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default CustomSidebarItems;
