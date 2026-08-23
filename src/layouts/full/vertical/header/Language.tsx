// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Avatar, IconButton, Menu, MenuItem, Typography, Stack, Box } from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import { setLanguage } from 'src/store/customizer/CustomizerSlice';
import FlagEn from 'src/assets/images/flag/icon-flag-en.svg';
import FlagId from 'src/assets/images/flag/icon-flag-idn.svg';
import FlagFr from 'src/assets/images/flag/icon-flag-fr.svg';
import FlagCn from 'src/assets/images/flag/icon-flag-cn.svg';
import FlagSa from 'src/assets/images/flag/icon-flag-sa.svg';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AppState } from 'src/store/Store';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Languages = [
  {
    flagname: 'English (UK)',
    icon: FlagEn,
    value: 'en',
  },
  {
    flagname: 'Indonesia (ID)',
    icon: FlagId,
    value: 'id',
  },
  // {
  //   flagname: 'China (RRC)',
  //   icon: FlagCn,
  //   value: 'ch',
  // },
];

const Language = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);
  const customizer = useSelector((state: AppState) => state.customizer);
  const currentLang =
    Languages.find((_lang) => _lang.value === customizer.isLanguage) || Languages[0];
  const { i18n } = useTranslation();
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    if (i18n.language !== customizer.isLanguage) {
      i18n.changeLanguage(customizer.isLanguage);
    }
  }, [customizer.isLanguage]);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');

    if (savedLang) {
      dispatch(setLanguage(savedLang));
    } else {
      const browserLang = navigator.language.split('-')[0];

      const supportedLang = Languages.find((l) => l.value === browserLang);

      if (supportedLang) {
        dispatch(setLanguage(browserLang));
      }
    }
  }, []);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          px: 1.25,
          py: 0.7,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          cursor: 'pointer',

          // lebih fokus terlihat
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',

          transition: 'all 0.2s ease',

          '&:hover': {
            backgroundColor: 'action.hover',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.18)',
          },
        }}
      >
        <Avatar
          src={currentLang.icon}
          alt={currentLang.value}
          sx={{
            width: 19,
            height: 19,
          }}
        />

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {currentLang.value}
        </Typography>

        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            color: 'text.secondary',
            ml: 0.1,
          }}
        />
      </Box>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        {Languages.map((option, index) => (
          <MenuItem
            key={index}
            sx={{ py: 2, px: 3 }}
            onClick={() => {
              localStorage.setItem('lang', option.value);
              dispatch(setLanguage(option.value));
              handleClose();
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={option.icon} alt={option.icon} sx={{ width: 20, height: 20 }} />
              <Typography> {option.flagname}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Language;
