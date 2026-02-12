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
  useTheme,
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
import { IconEye, IconEyeOff, IconUser, IconUserPlus } from '@tabler/icons-react';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import Logo from 'src/assets/images/logos/bi_pic.png';
import BannerBI from 'src/assets/images/backgrounds/Banner-Tupoksi.jpg';
import { useMediaQuery } from '@mui/system';
import Footer from '../components/Footer';
import { KeyboardArrowUp } from '@mui/icons-material';
// import Logo from 'src/assets/images/logos/bio-experience-1x1-logo.png';

const Login = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { saveToken } = useSession();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Tabs state
  const [tab, setTab] = useState(0);

  // On Submit (login normal)
  async function loginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // if (!captchaToken) {
    //   setCaptchaError(true);
    //   setLoading(false);
    //   return;
    // }

    // const body = { username, password, captchaToken };

    const body = { username, password };

    try {
      const response = await login(body);
      // recaptchaRef.current?.reset();

      // const { token, group_id } = response.collection;
      const { token, group_id, employee_id, type } = response.collection;
      saveToken(token, group_id);

      dispatch(
        setUser({
          employee_id,
        }),
      );

      if (group_id.toUpperCase() === GroupRoleId.Admin) navigate('/admin/dashboard');
      else if (group_id.toUpperCase() === GroupRoleId.Manager) navigate('/manager/dashboard');
      else if (group_id.toUpperCase() === GroupRoleId.Employee) navigate('/employee/dashboard');
      else if (group_id.toUpperCase() === GroupRoleId.Employee && type == 0)
        navigate('/delivery-staff/dashboard');
      else if (group_id.toUpperCase() === GroupRoleId.OperatorVMS) navigate('/operator/view');
      // else if (group_id.toUpperCase() === GroupRoleId.OperatorAdmin) navigate('/operator-admin/dashboard');
      else if (group_id.toUpperCase() === GroupRoleId.Visitor) navigate('/guest/dashboard');
    } catch (err) {
      setTimeout(() => {
        if (err instanceof AxiosError && err.response) {
          setError(true);
        }
      }, 500);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }

  const guestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!guestCode.trim()) {
      setGuestError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await AuthVisitor({ code: guestCode });

      const status = res.status;
      // console.log('Status:', status);

      localStorage.setItem('visitor_ref_code', guestCode);
      // setLoading(false);
      if (status === 'process') {
        // navigate(`/portal/waiting?code=${guestCode}`);
        navigate('/portal/waiting', {
          replace: true,
        });
        return;
      }

      if (status === 'fiil_form') {
        navigate(`/portal/information?code=${guestCode}`, {
          replace: true,
          state: {
            snackbar: {
              open: true,
              severity: 'success',
              message: 'Please complete your information form',
            },
          },
        });
        return;
      } else if (res.collection.token) {
        saveToken(res.collection.token, GroupRoleId.Visitor.toLowerCase());
        navigate('/guest/dashboard');
        localStorage.removeItem('visitor_ref_code');
        return;
      }
    } catch (err) {
      // console.error('Guest login gagal:', err);
      setGuestError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    const msg = sessionStorage.getItem('logoutMsg');
    if (msg) {
      setSnackbarMsg(msg);
      setSnackbarType('success');
      setSnackbarOpen(true);

      sessionStorage.removeItem('logoutMsg');
    }
  }, []);

  return (
    <>
      {!isAuthenticated && (
        <PageContainer title="Login | Bank Indonesia" description="this is Login page">
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
                // display="flex"
                // justifyContent="end"
                // alignItems="center"
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
                    // borderRadius: 3,
                    // borderTopLeftRadius: 10,
                    // borderBottomRightRadius: 10,
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
                    // borderLeftRadius: 10,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center" mb={0}>
                    <img src={Logo} width={250} height={80} />
                  </Box>

                  {/* Tabs Switch */}
                  <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    // centered
                    sx={{ mb: 2 }}
                    centered={true}
                    // variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    variant={isMobile ? 'scrollable' : 'standard'} 
                  >
                    <Tab icon={<IconUser size={18} />} iconPosition="start" label="User/Staff" />
                    <Tab
                      icon={<IconUserPlus size={18} />}
                      iconPosition="start"
                      label="Guest/Visitor Code"
                    />
                    <Tab
                      icon={<IconUserPlus size={18} />}
                      iconPosition="start"
                      label="Guest Login"
                    />
                  </Tabs>

                  {/* Login Form */}
                  {tab === 0 && (
                    <form onSubmit={loginSubmit}>
                      <Typography variant="h6" mb={0} textAlign="center">
                        Sign in to your account
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <CustomFormLabel htmlFor="username" sx={{ marginTop: 0 }}>
                            Username
                          </CustomFormLabel>
                          <CustomTextField
                            id="username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setUsername(e.target.value)
                            }
                          />
                        </Box>
                        <Box>
                          <CustomFormLabel htmlFor="password" sx={{ marginTop: 0 }}>
                            Password
                          </CustomFormLabel>
                          <CustomTextField
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setPassword(e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <IconEyeOff size={20} />
                                    ) : (
                                      <IconEye size={20} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>

                        {/* reCAPTCHA v2 Checkbox (visible) - placed under password as requested */}
                        {/* {showCaptcha && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={'6Lew4dsrAAAAACvlJCqJjIfjmwzD0tTJxZVFIwWw'} // static dummy site key
                              onChange={onCaptchaChange}
                            />
                          </Box>
                        )}
                        {captchaError && (
                          <Typography variant="body2" color="error" textAlign="center">
                            Silakan centang captcha sebelum melanjutkan.
                          </Typography>
                        )} */}
                        <Link
                          to={'/auth/forgot-password'}
                          // variant="body1"
                          color="textSecondary"
                          // textAlign="start"
                          // sx={{ opacity: 0.7, cursor: 'pointer', marginTop: '10px !important' }}
                          style={{ opacity: '0.5', color: '#000', cursor: 'pointer' }}
                        >
                          Forgot Password?
                        </Link>
                      </Stack>

                      <Box marginTop={3}>
                        <Button
                          color="primary"
                          variant="contained"
                          size="large"
                          fullWidth
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              {' '}
                              <CircularProgress sx={{ color: 'white' }} size={24} />
                            </>
                          ) : (
                            'Login'
                          )}
                        </Button>
                      </Box>
                      {error && tab === 0 && (
                        <Typography
                          sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}
                          variant="subtitle1"
                          color="error"
                        >
                          Username or Password is invalid
                        </Typography>
                      )}
                    </form>
                  )}

                  {/* Guest Form */}
                  {tab === 1 && (
                    <form onSubmit={guestSubmit}>
                      <Typography variant="h6" mb={1} textAlign="center">
                        Guest/Visitor Code
                      </Typography>
                      <Typography variant="body1" textAlign="center" color="text.secondary">
                        Please enter your invitation code
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <CustomFormLabel htmlFor="guest-id">Invitation Code</CustomFormLabel>
                          <CustomTextField
                            id="guest-id"
                            variant="outlined"
                            fullWidth
                            value={guestCode}
                            onChange={(e) => {
                              setGuestCode(e.target.value);
                              if (guestError) setGuestError(false);
                            }}
                            error={guestError}
                          />
                        </Box>
                        {/* {showCaptcha && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={'6Lew4dsrAAAAACvlJCqJjIfjmwzD0tTJxZVFIwWw'} // static dummy site key
                              onChange={onCaptchaChange}
                            />
                          </Box>
                        )}
                        {captchaError && (
                          <Typography variant="body2" color="error" textAlign="center">
                            Silakan centang captcha sebelum melanjutkan.
                          </Typography>
                        )} */}
                      </Stack>

                      <Box marginTop={3}>
                        <Button
                          color="primary"
                          variant="contained"
                          size="large"
                          fullWidth
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <CircularProgress sx={{ color: 'white' }} size={24} />
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </Box>

                      {guestError && (
                        <Typography
                          sx={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}
                          variant="subtitle1"
                          color="error"
                        >
                          Invitation Code not found
                        </Typography>
                      )}
                    </form>
                  )}

                  {tab === 2 && (
                    <form onSubmit={loginSubmit}>
                      <Typography variant="h6" mb={0} textAlign="center">
                        Login or Register Guest
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <CustomFormLabel htmlFor="username" sx={{ marginTop: 0 }}>
                            Username
                          </CustomFormLabel>
                          <CustomTextField
                            id="username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setUsername(e.target.value)
                            }
                          />
                        </Box>
                        <Box>
                          <CustomFormLabel htmlFor="password" sx={{ marginTop: 0 }}>
                            Password
                          </CustomFormLabel>
                          <CustomTextField
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setPassword(e.target.value)
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <IconEyeOff size={20} />
                                    ) : (
                                      <IconEye size={20} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>

                        {/* reCAPTCHA v2 Checkbox (visible) - placed under password as requested */}
                        {/* {showCaptcha && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={'6Lew4dsrAAAAACvlJCqJjIfjmwzD0tTJxZVFIwWw'} // static dummy site key
                              onChange={onCaptchaChange}
                            />
                          </Box>
                        )}
                        {captchaError && (
                          <Typography variant="body2" color="error" textAlign="center">
                            Silakan centang captcha sebelum melanjutkan.
                          </Typography>
                        )} */}
                        <Link
                          to={'/auth/forgot-password'}
                          // variant="body1"
                          color="textSecondary"
                          // textAlign="start"
                          // sx={{ opacity: 0.7, cursor: 'pointer', marginTop: '10px !important' }}
                          style={{ opacity: '0.5', color: '#000', cursor: 'pointer' }}
                        >
                          Forgot Password?
                        </Link>
                      </Stack>

                      <Box marginTop={1}>
                        <Button
                          color="primary"
                          variant="contained"
                          size="large"
                          fullWidth
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              {' '}
                              <CircularProgress sx={{ color: 'white' }} size={24} />
                            </>
                          ) : (
                            'Login'
                          )}
                        </Button>
                        <Divider sx={{ my: 1 }} />
                        <Button
                          color="primary"
                          variant="outlined"
                          size="large"
                          fullWidth
                          // type="submit"
                          disabled={loading}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/auth/register');
                          }}
                        >
                          {loading ? (
                            <>
                              {' '}
                              <CircularProgress sx={{ color: 'white' }} size={24} />
                            </>
                          ) : (
                            'Register'
                          )}
                        </Button>
                      </Box>
                      {error && tab === 2 && (
                        <Typography
                          sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}
                          variant="subtitle1"
                          color="error"
                        >
                          Username or Password is invalid
                        </Typography>
                      )}
                    </form>
                  )}

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

                  {/* <CardActions sx={{ justifyContent: 'center' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'grey.600', opacity: 0.7 }}
                      fontWeight={700}
                    >
                      Version 1.02 - <span style={{}}>Build</span> 071125
                    </Typography>
                  </CardActions> */}
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

export default Login;
