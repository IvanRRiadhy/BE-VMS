// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import React from 'react';
// import { useTheme } from '@mui/material/styles';
// import { useLocation } from 'react-router';

// // mui imports
// import { ListItemIcon, styled, ListItemText, Box, ListItemButton } from '@mui/material';
// import { useSelector } from 'src/store/Store';

// // custom imports
// import NavItem from '../NavItem/NavItem';

// // plugins
// import { IconChevronDown } from '@tabler/icons-react';
// import { AppState } from 'src/store/Store';
// import { useTranslation } from 'react-i18next';
// import { width } from '@mui/system';

// type NavGroupProps = {
//   [x: string]: any;
//   navlabel?: boolean;
//   subheader?: string;
//   title?: string;
//   icon?: any;
//   href?: any;
// };

// interface NavCollapseProps {
//   menu: NavGroupProps;
//   level: number;
//   pathWithoutLastPart: any;
//   pathDirect: any;
//   hideMenu: any;
//   onClick: any;
// }

// // FC Component For Dropdown Menu
// const NavCollapse = ({
//   menu,
//   level,
//   pathWithoutLastPart,
//   pathDirect,
//   hideMenu,
// }: NavCollapseProps) => {
//   const Icon = menu.icon;
//   const theme = useTheme();
//   const { pathname } = useLocation();
//   const [open, setOpen] = React.useState(false);
//   const customizer = useSelector((state: AppState) => state.customizer);
//   const menuIcon =
//     level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.1rem" />;

//   React.useEffect(() => {
//     let isActive = false;
//     menu.children.forEach((item: any) => {
//       if (item.href === pathname) isActive = true;
//     });
//     setOpen(isActive);
//   }, [pathname, menu.children]);

//   const ListItemStyled = styled(ListItemButton)(() => ({
//     width: '100%', // bukan 'auto'
//     display: 'flex',
//     padding: '5px 10px',
//     position: 'relative',
//     flexGrow: 'unset',
//     gap: '10px',
//     borderRadius: `${customizer.borderRadius}px`,
//     whiteSpace: 'nowrap',
//     color:
//       open || pathname.includes(menu.href) || level < 1 ? 'white' : theme.palette.text.secondary,
//     backgroundColor: open || pathname.includes(menu.href) ? theme.palette.primary.main : '',

//     '&:hover': {
//       backgroundColor:
//         open || pathname.includes(menu.href)
//           ? theme.palette.primary.main
//           : theme.palette.primary.light,
//     },
//     '&:hover > .SubNav': { display: 'block' },
//   }));

//   const ListSubMenu = styled((props: any) => <Box {...props} />)(() => ({
//     display: 'none',
//     position: 'absolute',
//     top: level > 1 ? `0px` : '35px',
//     left: level > 1 ? `${level + 228}px` : '0px',
//     padding: '10px',
//     width: '100%',
//     minWidth: '250px',
//     color: theme.palette.text.primary,
//     boxShadow: theme.shadows[8],
//     backgroundColor: theme.palette.background.paper,
//     // borderRadius: '8px',
//     '& .MuiListItemButton-root': {
//       width: '100%', // ⬅️ ikut parent
//       textAlign: 'left',
//       display: 'flex', // ⬅️ wajib agar icon & text sejajar
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//     },
//   }));

//   const listItemProps: {
//     component: string;
//   } = {
//     component: 'li',
//   };

//   const { t } = useTranslation();

//   // If Menu has Children
//   const submenus = menu.children?.map((item: any) => {
//     if (item.children) {
//       return (
//         <NavCollapse
//           key={item.id}
//           menu={item}
//           level={level + 1}
//           pathWithoutLastPart={pathWithoutLastPart}
//           pathDirect={pathDirect}
//           hideMenu={hideMenu}
//           onClick={undefined}
//         />
//       );
//     } else {
//       return (
//         <NavItem
//           key={item.id}
//           item={item}
//           level={level + 1}
//           pathDirect={pathDirect}
//           hideMenu={hideMenu}
//           onClick={function (): void {
//             // throw new Error('Function not implemented.');
//           }}
//         />
//       );
//     }
//   });

//   return (
//     <Box
//       sx={{
//         position: 'relative',
//         '&:hover .SubNav': {
//           display: 'block', // munculkan submenu saat hover
//         },
//         '&:hover .ListItemStyled': {
//           // backgroundColor: 'rgba(0,0,0,0)', // efek hover
//           // boxShadow: (theme) => theme.shadows[2],
//           // color: theme.palette.primary.,
//           backgroundColor: theme.palette.primary.main,
//           color: 'white',
//         },
//       }}
//     >
//       <ListItemStyled
//         {...listItemProps}
//         selected={pathWithoutLastPart === menu.href}
//         className="ListItemStyled"
//         sx={{
//           display: 'flex',
//           position: 'relative', // ⬅️ wajib agar submenu absolute tetap di dalam konteks ini
//           width: '100%', // ⬅️ biar parent full
//           px: 1,
//           '&:hover .SubNav': {
//             display: 'block', // tampilkan submenu saat hover
//           },
//         }}
//       >
//         <ListItemIcon
//           sx={{
//             minWidth: 'auto',
//             p: '3px 0',
//             color: 'inherit',
//           }}
//         >
//           {menuIcon}
//         </ListItemIcon>
//         <ListItemText color="inherit" sx={{ mr: 'auto', fontSize: '0.3rem' }}>
//           {menu.title && t(menu.title)}
//         </ListItemText>
//         <IconChevronDown size="1rem" />
//       </ListItemStyled>

//       {/* Submenu disembunyikan default */}
//       <ListSubMenu
//         component="ul"
//         className="SubNav"
//         sx={{
//           display: 'none',
//           position: 'absolute',
//           top: '100%', // muncul tepat di bawah parent
//           left: 0,
//           width: '100%', // ⬅️ mengikuti lebar parent
//           backgroundColor: 'white',
//           borderRadius: 1,
//           zIndex: 10,
//           p: 1,
//           boxShadow: (theme: any) => theme.shadows[4],
//         }}
//       >
//         {submenus}
//       </ListSubMenu>
//     </Box>
//   );
// };

// export default NavCollapse;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router';
import { ListItemIcon, styled, ListItemText, Box, ListItemButton } from '@mui/material';
import { useSelector } from 'src/store/Store';
import NavItem from '../NavItem/NavItem';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { AppState } from 'src/store/Store';
import { useTranslation } from 'react-i18next';

type NavGroupProps = {
  [x: string]: any;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
};

interface NavCollapseProps {
  menu: NavGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;
  hideMenu: any;
  onClick: any;
}

const NavCollapse = ({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
}: NavCollapseProps) => {
  const Icon = menu.icon;
  const theme = useTheme();
  const { pathname } = useLocation();
  const [open, setOpen] = React.useState(false);
  const customizer = useSelector((state: AppState) => state.customizer);
  const { t } = useTranslation();

  const menuIcon =
    level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.1rem" />;

  React.useEffect(() => {
    let isActive = false;
    menu.children?.forEach((item: any) => {
      if (item.href === pathname) isActive = true;
    });
    setOpen(isActive);
  }, [pathname, menu.children]);

  // ✅ Styled main list item
  const ListItemStyled = styled(ListItemButton)(() => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    padding: '6px 12px',
    borderRadius: `${customizer.borderRadius}px`,
    position: 'relative',
    whiteSpace: 'nowrap',
    color:
      open || pathname.includes(menu.href)
        ? theme.palette.common.white
        : theme.palette.text.secondary,
    backgroundColor:
      open || pathname.includes(menu.href) ? theme.palette.primary.main : 'transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
    },
  }));

  // ✅ Styled submenu (per level positioning)
  const ListSubMenu = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'level',
  })<{ level: number }>(({ theme, level }) => ({
    display: 'none',
    position: 'absolute',
    top: level === 1 ? '100%' : 0, // Level 1 ke bawah, Level >1 sejajar kanan
    left: level === 1 ? 0 : '100%',
    minWidth: 220,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[8],
    borderRadius: 8,
    padding: '6px 0',
    zIndex: 999999,
    opacity: 0,
    transform: 'translateY(8px)',
    transition: 'all 0.2s ease',
    '& .MuiListItemButton-root': {
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: `${level * 8}px`,
    },
    '&.open': {
      display: 'block',
      opacity: 1,
      transform: 'translateY(0)',
    },
  }));

  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={undefined}
        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={function (): void {}}
        />
      );
    }
  });

  return (
    <Box
      sx={{
        position: 'relative',
        '&:hover > .SubNav': {
          display: 'block',
          opacity: 1,
          transform: 'translateY(0)',
        },
        '&:hover > .ListItemStyled': {
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
        },
      }}
    >
      <ListItemStyled
        // component="li"
        as="li"
        selected={pathWithoutLastPart === menu.href}
        className="ListItemStyled"
      >
        <ListItemIcon
          sx={{
            minWidth: 'auto',
            p: '3px 0',
            color: 'inherit',
          }}
        >
          {menuIcon}
        </ListItemIcon>
        <ListItemText color="inherit" sx={{ mr: 'auto', fontSize: '0.9rem' }}>
          {menu.title && t(menu.title)}
        </ListItemText>
        {level === 1 ? <IconChevronDown size="1rem" /> : <IconChevronRight size="1rem" />}
      </ListItemStyled>

      {/* ✅ Submenu tampil di bawah / kanan sesuai level */}
      <ListSubMenu as="ul" className="SubNav" level={level}>
        {submenus}
      </ListSubMenu>
    </Box>
  );
};

export default NavCollapse;
