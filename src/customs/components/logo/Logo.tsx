import { FC } from 'react';
import { useSelector } from 'src/store/Store';
import { Link } from 'react-router';
import logoDark from 'src/assets/images/logos/bio-experience-horizontal-logo.png';
import logoDarkRTL from 'src/assets/images/logos/bio-experience-horizontal-logo.png';
import logoLight from 'src/assets/images/logos/bio-experience-horizontal-logo.png';
import logoLightRTL from 'src/assets/images/logos/bio-experience-horizontal-logo.png';
import logoMobile from 'src/assets/images/logos/bio-experience-1x1-logo.png';
import { styled, useMediaQuery, useTheme } from '@mui/material';
import { AppState } from 'src/store/Store';

const Logo: FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // true jika <=600px

  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: isMobile ? '50px' : customizer.isCollapse ? '40px' : '180px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  }));

  const getLogoSrc = () => {
    if (isMobile) return logoMobile;

    if (customizer.activeDir === 'ltr') {
      return customizer.activeMode === 'dark' ? logoLight : logoDark;
    } else {
      return customizer.activeMode === 'dark' ? logoDarkRTL : logoLightRTL;
    }
  };

  return (
    <LinkStyled to="/">
      <img
        src={getLogoSrc()}
        alt="Logo"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '100%', // jaga agar tidak melebihi tinggi topbar
          objectFit: 'contain',
        }}
      />
    </LinkStyled>
  );
};

export default Logo;
