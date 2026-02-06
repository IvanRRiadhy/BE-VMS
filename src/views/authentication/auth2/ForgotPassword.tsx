import React, { FormEvent, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Grid2 as Grid,
  Box,
  Card,
  Stack,
  Button,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  CardActions,
  Snackbar,
  Theme,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../../../store/apps/user/userSlice';

import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { AuthVisitor, login } from 'src/customs/api/users';
import { AxiosError } from 'axios';
import { Link, Link as RouterLink, useNavigate } from 'react-router';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { IconArrowNarrowLeft, IconArrowsLeft, IconEye, IconEyeOff, IconUser, IconUserPlus } from '@tabler/icons-react';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import Logo from 'src/assets/images/logos/bi_pic.png';
import BannerBI from 'src/assets/images/backgrounds/Banner-Tupoksi.jpg';
import { useMediaQuery } from '@mui/system';
import Footer from '../components/Footer';
import { KeyboardArrowUp } from '@mui/icons-material';
import { IconArrowBack } from '@tabler/icons-react';
// import Logo from 'src/assets/images/logos/bio-experience-1x1-logo.png';

const ForgotPassword = () => {
  const { isAuthenticated } = useAuth();
  const { saveToken } = useSession();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);

  const [searchParams] = useSearchParams();
  const [guestCode, setGuestCode] = useState(searchParams.get('code') || '');
  const [guestError, setGuestError] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {!isAuthenticated && (
        <PageContainer title="Forgot Password | Bank Indonesia" description="this is Login page">
          <Box
            sx={{
              position: 'relative',
              '&:before': {
                content: '""',
                background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite',
                position: 'absolute',
                height: '100%',
                width: '100%',
                opacity: '0.3',
              },
            }}
          >
            <Grid
              container
              spacing={0}
              justifyContent="center"
              sx={{ height: { xs: '100vh', lg: '80vh' } }}
            >
              <Grid
                size={{ xs: 12, sm: 12, lg: 6 }}
                sx={{
                  display: { xs: 'none', sm: 'none', lg: 'flex' },
                  justifyContent: 'end',
                  alignItems: 'center',
                }}
              >
                <Card
                  elevation={8}
                  sx={{
                    p: 4,
                    zIndex: 1,
                    width: '100%',
                    maxWidth: '550px',
                    height: { xs: '65%', lg: '80%' },
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    backgroundColor: 'primary.main',
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <img src={BannerBI} width={500} height={250} style={{ borderRadius: '10px' }} />
                  </Box>
                  <Typography
                    sx={{ color: '#fff', lineHeight: 1.5 }}
                    fontSize={24}
                    mb={2}
                    mt={4}
                    fontWeight={600}
                  >
                    Bank Indonesia - Di Setiap Makna Indonesia
                  </Typography>

                  <Typography sx={{ color: '#fff', lineHeight: 1.5 }} fontSize={16} mb={2} mt={5}>
                    Indonesia adalah Bank Sentral Republik Indonesia dengan Satu Tujuan Tunggal
                    yaitu Mencapai dan Memelihara Kestabilan Nilai Rupiah.
                  </Typography>
                </Card>
              </Grid>
              <Grid
                size={{ xs: 11, sm: 11, lg: 6, xl: 6 }}
                sx={{
                  display: { xs: 'flex', sm: 'flex', lg: 'flex' },
                  justifyContent: { xs: 'center', sm: 'center', lg: 'start' },
                  alignItems: 'center',
                }}
              >
                <Card
                  elevation={8}
                  sx={{
                    p: 4,
                    zIndex: 1,
                    width: '100%',
                    height: { md: '65%', lg: '80%' },
                    maxWidth: '550px',
                    borderLeft: '0 !important',
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center" mb={0}>
                    <img src={Logo} width={250} height={80} />
                  </Box>

                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      color="text.primary"
                      gutterBottom
                      textAlign="center"
                    >
                      Forgot Your Password?
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      //   fontWeight={600}
                      sx={{ opacity: '0.5' }}
                      color="text.primary"
                      gutterBottom
                      textAlign="center"
                    >
                      Enter your email so that we can send your password reset link.
                    </Typography>

                    <CustomFormLabel htmlFor="Email" required>
                      Email
                    </CustomFormLabel>
                    <CustomTextField id="Email" variant="outlined" fullWidth />
                    <Button
                      color="primary"
                      variant="contained"
                      size="medium"
                      fullWidth
                      sx={{ mt: 2, mb: 1 }}
                    >
                      Send Email
                    </Button>
                    <Link
                      to="/auth/login"
                      style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        // display: 'block',
                        color: 'grey',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconArrowNarrowLeft /> Back to Login
                    </Link>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="center" marginTop={2}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'grey.600', opacity: 0.7 }}
                      fontWeight={200}
                    >
                      Need some help?
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      fontWeight={600}
                      component={RouterLink}
                      to="/"
                      sx={{ marginLeft: 1 }}
                    >
                      Contact Us
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
          <Footer />
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarType}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbarMsg}
            </Alert>
          </Snackbar>
          {showBackToTop && (
            <Tooltip title="Back to Top" placement="left" arrow>
              <Box
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 9999,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <KeyboardArrowUp sx={{ color: '#fff', fontSize: 30 }} />
              </Box>
            </Tooltip>
          )}
        </PageContainer>
      )}
    </>
  );
};

export default ForgotPassword;
