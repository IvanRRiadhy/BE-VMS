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
  Snackbar,
  Theme,
  Alert,
  Tooltip,
  Divider,
  useTheme,
  Select,
  FormControl,
  MenuItem,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../../../store/apps/user/userSlice';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { AuthVisitor, getProfile, login, loginSatker } from 'src/customs/api/users';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingBank,
  IconDeviceDesktop,
  IconEye,
  IconEyeOff,
  IconLock,
  IconRefresh,
  IconShieldCheck,
  IconUser,
  IconUserPlus,
  IconUsersGroup,
} from '@tabler/icons-react';
import Logo from 'src/assets/images/logos/bi_pic.png';
import BannerBI from 'src/assets/images/backgrounds/Banner-Tupoksi.jpg';
import { borderBottom, useMediaQuery } from '@mui/system';
import Footer from '../components/Footer';
import Language from 'src/layouts/full/vertical/header/Language';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'src/config';
import BackToTopButton from '../components/BackToTopButton';
import { getCaptcha } from 'src/customs/api/captcha';
import { IconBuilding } from '@tabler/icons-react';

const Login = () => {
  const theme = useTheme();
  const { isAuthenticated, setAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';
  const [guestCode, setGuestCode] = useState(codeFromUrl);
  // const [guestCode, setGuestCode] = useState(searchParams.get('code') || '');
  const [guestError, setGuestError] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(true);
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const config = getConfig();
  const logoUrl = config.LOGO_URL || Logo;
  const [tab, setTab] = useState('Admin');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [employeeRole, setEmployeeRole] = useState('Admin');
  const generateCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      setCaptchaError(false);
      setCaptchaCode('');

      const response = await getCaptcha();

      setCaptchaId(response.captchaId);
      setCaptchaImage(response.image);
    } catch (error) {
      console.error('Failed to generate captcha:', error);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (config.ENABLE_CAPTCHA) {
      generateCaptcha();
    }
  }, [config.ENABLE_CAPTCHA]);

  async function loginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(false);
    setLoading(true);

    const config = getConfig();

    // CAPTCHA hanya wajib jika ENABLE_CAPTCHA = true
    if (config.ENABLE_CAPTCHA && !captchaCode.trim()) {
      setCaptchaError(true);
      setLoading(false);
      return;
    }

    const body = {
      username,
      password,
    };

    try {
      const loginFunction = accessType === 'satker' ? loginSatker : login;

      const loginResponse: any = await loginFunction(
        body,
        config.ENABLE_CAPTCHA ? captchaId : undefined,
        config.ENABLE_CAPTCHA ? captchaCode : undefined,
        employeeRole,
      );

      const user = loginResponse.collection;
      const role = user.group_name ?? user.role_access;

      setAuthenticated({
        ...user,
        group_name: role,
      });

      dispatch(
        setUser({
          ...user,
          group_name: role,
          id: user.user_id ?? user.id,
        }),
      );

      switch (role) {
        case 'OperatorVMS':
          navigate('/operator/view', { replace: true });
          break;

        case 'OperatorAdmin':
          navigate('/operator-admin/dashboard', { replace: true });
          break;

        case 'Manager':
          navigate('/manager/dashboard', { replace: true });
          break;

        case 'Admin':
          navigate('/admin/dashboard', { replace: true });
          break;

        case 'Employee':
          navigate('/employee/dashboard', { replace: true });
          break;

        case 'SecurityMonitor':
          navigate('/security-monitor/dashboard', { replace: true });
          break;

        default:
          navigate('/guest/dashboard');
          break;
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(true);
        setSnackbarMsg('Too many login attempts. Please wait a moment and try again.');
        setSnackbarType('error');
        setSnackbarOpen(true);
        return;
      }

      if (err.response) {
        setError(true);

        // Generate captcha baru hanya jika captcha aktif
        if (config.ENABLE_CAPTCHA) {
          await generateCaptcha();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // const guestSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   if (!guestCode.trim()) {
  //     setGuestError(true);
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const code = searchParams.get('code') || guestCode;

  //     const res = await AuthVisitor({ code });
  //     const status = res?.status;

  //     localStorage.setItem('visitor_ref_code', code);

  //     if (status === 'process') {
  //       setLoading(false);

  //       navigate('/portal/waiting', {
  //         replace: true,
  //       });

  //       return;
  //     }
  //     if (status === 'fiil_form') {
  //       setLoading(false);

  //       navigate(`/portal/information?code=${code}`, {
  //         state: {
  //           snackbar: {
  //             open: true,
  //             severity: 'success',
  //             message: 'Please complete your information form',
  //           },
  //         },
  //       });

  //       return;
  //     }

  //     if (status === 'success') {
  //       const { id, visitor_id } = res?.collection || {};

  //       const profileResponse = await getProfile();
  //       const profile: any = profileResponse?.collection;

  //       if (!profile) {
  //         throw new Error('Profile tidak ditemukan');
  //       }

  //       setAuthenticated(profile);

  //       dispatch(
  //         setUser({
  //           visitor_id,
  //           id,
  //         }),
  //       );

  //       localStorage.removeItem('visitor_ref_code');

  //       navigate('/guest/dashboard', {
  //         replace: true,
  //       });

  //       return;
  //     }
  //     setLoading(false);
  //   } catch (err) {
  //     setGuestError(true);
  //     setLoading(false);
  //   }
  // };

  const guestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!guestCode.trim()) {
      setGuestError(true);
      return;
    }

    setLoading(true);
    setGuestError(false);

    try {
      const code = guestCode.trim();

      const res = await AuthVisitor({ code });

      const status = res?.status;

      if (status === 'process') {
        localStorage.setItem('visitor_ref_code', code);

        navigate('/portal/waiting', {
          replace: true,
        });
        return;
      }

      if (status === 'fiil_form') {
        localStorage.setItem('visitor_ref_code', code);

        navigate(`/portal/information?code=${encodeURIComponent(code)}`, {
          state: {
            snackbar: {
              open: true,
              severity: 'success',
              message: 'Please complete your information form',
            },
          },
        });
        return;
      }

      if (status === 'success') {
        const { id, visitor_id } = res?.collection || {};

        if (!id || !visitor_id) {
          throw new Error('Visitor ID atau ID tidak ditemukan');
        }

        const profileResponse = await getProfile();
        const profile = profileResponse?.collection;

        if (!profile) {
          throw new Error('Profile tidak ditemukan');
        }

        setAuthenticated(profile);

        dispatch(
          setUser({
            ...profile,
            visitor_id,
            id,
          }),
        );

        localStorage.removeItem('visitor_ref_code');

        navigate('/guest/dashboard', {
          replace: true,
        });

        return;
      }

      setGuestError(true);
    } catch (err) {
      console.error('Guest login error:', err);
      setGuestError(true);
    } finally {
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

  useEffect(() => {
    if (codeFromUrl) {
      setTab('Admin');
    }
  }, [codeFromUrl]);

  const handleForgotPassword = () => {
    setSnackbarMsg(t('contactAdministrator'));
    setSnackbarType('success');
    setSnackbarOpen(true);
  };

  type AccessType = 'user-system' | 'satker' | 'visitor';
  const [searchParamsLogin, setSearchParamsLogin] = useSearchParams();

  const rawAccessType = searchParamsLogin.get('access')?.trim().toLowerCase();

  const accessType: AccessType | null =
    rawAccessType === 'visitor' || rawAccessType === 'visitorr'
      ? 'visitor'
      : rawAccessType === 'user-system' || rawAccessType === 'satker'
        ? rawAccessType
        : null;

  const isLoginPage = accessType !== null;
  const isVisitorLogin = accessType === 'visitor';
  const isEmployeeLogin = accessType === 'user-system' || accessType === 'satker';

  const roleOptions: Record<Exclude<AccessType, 'visitor'>, string[]> = {
    'user-system': ['Super Admin', 'Admin', 'Operator'],
    satker: ['DLAF', 'DLDS', 'DPID', 'DPSS', 'DPU', 'DSDM'],
  };

  const handleSelectAccess = (type: Exclude<AccessType, 'visitor'>) => {
    setEmployeeRole(type === 'user-system' ? 'Super Admin' : 'DLAF');
    setError(false);
    setSearchParamsLogin({ access: type }, { preventScrollReset: true });
  };

  const handleBackToAccess = () => {
    setSearchParamsLogin({}, { preventScrollReset: true });
    setEmployeeRole('Admin');
    setError(false);
    setGuestError(false);
  };

  useEffect(() => {
    if (accessType === 'visitor') {
      setEmployeeRole('Visitor');
    } else if (accessType === 'user-system') {
      setEmployeeRole('Super Admin');
    } else if (accessType === 'satker') {
      setEmployeeRole('DLAF');
    }
  }, [accessType]);
  return (
    <>
      {/* {!isAuthenticated && ( */}
      <PageContainer title="Login | Bank Indonesia" description="this is Login page">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            position: 'relative',
            backgroundImage: "url('/assets/images/vms_bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '0 !important',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 15, 35, 0.55)',
              zIndex: 0,
              pointerEvents: 'none',
            },

            '& > *': {
              position: 'relative',
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              borderRadius: '0 !important',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 80, md: 90, lg: 90 },
                left: { xs: '45%', md: 360, lg: 290 },
                zIndex: 10,
              }}
            >
              <Box
                component="img"
                src={logoUrl}
                alt="logo"
                sx={{
                  maxWidth: { xs: 140, md: 180, lg: 250 },
                  maxHeight: { xs: 80, md: 80, lg: 80 },
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Grid
              container
              spacing={0}
              justifyContent="space-between"
              alignItems={'stretch'}
              // height={'100%'}
              // sx={{ height: { xs: '100vh', lg: '95vh' } }}
              sx={{
                // minHeight: 'calc(100vh - 100px)',
                height: '100vh',
                py: { xs: 2, md: 3, lg: 4 },
              }}
            >
              <Grid
                size={{ xs: 12, sm: 12, lg: 6 }}
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  pl: { lg: 6, xl: 8 },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: '#fff',
                      fontSize: { lg: 36, xl: 58 },
                      fontWeight: 700,
                      lineHeight: 1.3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      maxWidth: 440,
                      textShadow: '0 2px 12px rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    Visitor
                    <br />
                    Management
                    <br />
                    System
                  </Typography>

                  <Box
                    sx={{
                      mt: 3,
                      width: 80,
                      height: 4,
                      bgcolor: '#FFC247',
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, lg: 6, xl: 6 }}
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', lg: 'emd' },
                  alignItems: 'center',
                }}
              >
                {!isLoginPage ? (
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 620,
                      mx: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      marginTop: { xs: '10px', lg: 0 },
                    }}
                  >
                    {/* Header */}

                    <Box
                      sx={{
                        position: 'relative',
                        textAlign: 'center',
                        mb: 3,
                        px: 3,
                        py: 3.5,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: `
      radial-gradient(circle at 50% 0%, rgba(255,194,71,0.13), transparent 65%),
      linear-gradient(135deg, rgba(13,45,79,0.9), rgba(3,27,59,0.45))
    `,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Decorative glow */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: 180,
                          height: 180,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,194,71,0.06)',
                          filter: 'blur(45px)',
                          top: -110,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none',
                        }}
                      />

                      <Box
                        sx={{
                          position: 'relative',
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(255,194,71,0.12)',
                          border: '1px solid rgba(255,194,71,0.35)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        }}
                      >
                        <IconShieldCheck size={34} color="#FFC247" />
                      </Box>

                      <Typography
                        variant="h3"
                        sx={{
                          position: 'relative',
                          color: '#fff',
                          fontWeight: 700,
                          mb: 1,
                          letterSpacing: '-0.5px',
                        }}
                      >
                        Selamat Datang
                      </Typography>

                      <Typography
                        sx={{
                          position: 'relative',
                          color: '#B8C7DA',
                          fontSize: 14,
                          maxWidth: 400,
                          mx: 'auto',
                          lineHeight: 1.8,
                        }}
                      >
                        Pilih jenis akses untuk melanjutkan menu login ke <br /> Visitor Management
                        System.
                      </Typography>

                      <Box
                        sx={{
                          width: 38,
                          height: 3,
                          borderRadius: 5,
                          bgcolor: '#FFC247',
                          mx: 'auto',
                          mt: 2.5,
                        }}
                      />
                    </Box>

                    {/* Access Cards */}
                    <Grid container spacing={2}>
                      {/* User System */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card
                          onClick={() => handleSelectAccess('user-system')}
                          elevation={0}
                          sx={{
                            position: 'relative',
                            height: '100%',
                            minHeight: 220,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            borderRadius: 4,
                            bgcolor: '#09264A',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.12)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-6px)',
                              borderColor: '#FFC247',
                              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                              bgcolor: '#10345D',
                              '& .access-icon': {
                                transform: 'scale(1.1)',
                                bgcolor: 'rgba(255,194,71,0.2)',
                              },
                              '& .access-arrow': {
                                transform: 'translateX(5px)',
                                color: '#FFC247',
                              },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              width: 150,
                              height: 150,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255,194,71,0.045)',
                              top: -65,
                              right: -55,
                            }}
                          />

                          <Box
                            sx={{
                              p: 3,
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <Box
                              className="access-icon"
                              sx={{
                                width: 58,
                                height: 58,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(255,194,71,0.12)',
                                border: '1px solid rgba(255,194,71,0.25)',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <IconDeviceDesktop size={31} color="#FFC247" />
                            </Box>

                            <Box sx={{ mt: 3, flexGrow: 1 }}>
                              <Typography variant="h5" fontWeight={700}>
                                User System
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 1,
                                  color: '#B8C7DA',
                                  fontSize: 13,
                                  lineHeight: 1.7,
                                }}
                              >
                                Akses portal pengelolaan sistem sebagai super admin, admin dan
                                operator.
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                mt: 2,
                                pt: 2,
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: '#FFC247',
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                User System
                              </Typography>

                              <Box className="access-arrow" sx={{ transition: 'all 0.3s' }}>
                                <IconArrowRight size={21} />
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>

                      {/* Satker */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card
                          onClick={() => handleSelectAccess('satker')}
                          elevation={0}
                          sx={{
                            position: 'relative',
                            height: '100%',
                            minHeight: 220,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            borderRadius: 4,
                            bgcolor: '#09264A',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.12)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-6px)',
                              borderColor: '#FFC247',
                              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                              bgcolor: '#10345D',
                              '& .access-icon': {
                                transform: 'scale(1.1)',
                                bgcolor: 'rgba(255,194,71,0.2)',
                              },
                              '& .access-arrow': {
                                transform: 'translateX(5px)',
                                color: '#FFC247',
                              },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              width: 150,
                              height: 150,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255,194,71,0.045)',
                              top: -65,
                              right: -55,
                            }}
                          />

                          <Box
                            sx={{
                              p: 3,
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <Box
                              className="access-icon"
                              sx={{
                                width: 58,
                                height: 58,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(255,194,71,0.12)',
                                border: '1px solid rgba(255,194,71,0.25)',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <IconUsersGroup size={31} color="#FFC247" />
                            </Box>

                            <Box sx={{ mt: 3, flexGrow: 1 }}>
                              <Typography variant="h5" fontWeight={700}>
                                Satker
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 1,
                                  color: '#B8C7DA',
                                  fontSize: 13,
                                  lineHeight: 1.7,
                                }}
                              >
                                Akses sistem menggunakan akun satuan kerja yang telah terdaftar.
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                mt: 2,
                                pt: 2,
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: '#FFC247',
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                Satker
                              </Typography>

                              <Box className="access-arrow" sx={{ transition: 'all 0.3s' }}>
                                <IconArrowRight size={21} />
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Footer */}
                    {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                        Secure Access Portal • Visitor Management System
                      </Typography>
                    </Box> */}
                  </Box>
                ) : (
                  <>
                    {/* Card Login */}
                    <Card
                      elevation={8}
                      sx={{
                        p: 4,
                        // height: lg ? (config.ENABLE_CAPTCHA ? '680px' : '600px') : '660px',
                        // minHeight: '600px',
                        // height: '100%',

                        zIndex: 1,
                        width: '100%',
                        maxWidth: '550px',
                        // boxShadow: 'none',
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                        borderLeft: '0 !important',
                        // borderRadius: '0 20px 20px 0 !important',
                        borderRadius: {
                          xs: 3,
                          lg: 3,
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'start',
                        bgcolor: '#031B3B',
                        // borderLeftRadius: 10,
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="start"
                        mb={0}
                        sx={{
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            width: 'fit-content',
                            // borderBottom: '2px solid #FFC247',
                            borderBottom: '2px solid #FFC247',
                            borderRadius: '0',
                            pb: 1,
                          }}
                        >
                          <IconUser color="#fff" size={30} />
                          <Typography variant="h3" sx={{ color: '#fff', pb: 1 }}>
                            Login
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            right: -10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                        >
                          <Language colorTxt="#fff" />
                        </Box>
                      </Box>
                      <Box sx={{ width: '100%', mb: 1.5, mt: 3 }}>
                        <FormControl fullWidth size="medium">
                          <Select
                            value={employeeRole}
                            onChange={(e) => {
                              setEmployeeRole(e.target.value);
                            }}
                            fullWidth
                            sx={{
                              minHeight: 55,
                              color: '#fff',
                              bgcolor: '#061D3D',
                              borderRadius: 2,

                              '& .MuiSelect-select': {
                                bgcolor: 'transparent',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.25)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFC247',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFC247',
                              },
                              '& .MuiSvgIcon-root': {
                                color: '#fff',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: '#061D3D',
                                  color: '#fff',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  mt: 0.5,

                                  '& .MuiMenuItem-root': {
                                    bgcolor: '#061D3D',
                                    color: '#fff',
                                  },
                                  '& .MuiMenuItem-root:hover': {
                                    bgcolor: '#12365F',
                                  },
                                  '& .MuiMenuItem-root.Mui-selected': {
                                    bgcolor: '#174B7A',
                                  },
                                  '& .MuiMenuItem-root.Mui-selected:hover': {
                                    bgcolor: '#205B91',
                                  },
                                },
                              },
                            }}
                          >
                            {(accessType === 'visitor'
                              ? ['Visitor']
                              : accessType
                                ? roleOptions[accessType]
                                : []
                            ).map((role) => (
                              <MenuItem key={role} value={role}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <IconUser size={25} />
                                  <Typography variant="h6">{role}</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                            {/* <MenuItem value="Visitor">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <IconUserPlus size={25} />
                                <Typography variant="h6">Visitor</Typography>
                              </Box>
                            </MenuItem> */}
                          </Select>
                        </FormControl>
                      </Box>

                      <Box mt={0}>
                        {/* Login Form */}
                        {isEmployeeLogin && (
                          <form onSubmit={loginSubmit}>
                            {/* <Typography variant="h5" mb={0} mt={0} textAlign="center">
                      
                            {t('signIn')}
                          </Typography> */}
                            <Stack spacing={3}>
                              <Box>
                                <CustomFormLabel
                                  htmlFor="username"
                                  sx={{ marginTop: 0, color: '#fff' }}
                                >
                                  Username
                                </CustomFormLabel>
                                <CustomTextField
                                  id="username"
                                  variant="outlined"
                                  fullWidth
                                  placeholder="Enter your username"
                                  value={username}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setUsername(e.target.value)
                                  }
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      minHeight: 56,
                                      color: '#FFFFFF',
                                      backgroundColor: 'rgba(255,255,255,0.04)',
                                      '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.25)',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#FFC247',
                                      },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      py: 1.8,
                                      color: '#FFFFFF',
                                      '&::placeholder': {
                                        color: '#B8C7DA',
                                        opacity: 1,
                                      },
                                    },
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <IconUser size={25} stroke={1.8} color="#FFFFFF" />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                              <Box>
                                <CustomFormLabel
                                  htmlFor="password"
                                  sx={{ marginTop: 0, color: '#fff' }}
                                >
                                  Password
                                </CustomFormLabel>

                                <CustomTextField
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  variant="outlined"
                                  fullWidth
                                  placeholder="Enter your password"
                                  value={password}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setPassword(e.target.value)
                                  }
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      minHeight: 56,
                                      color: '#FFFFFF',
                                      backgroundColor: 'rgba(255,255,255,0.04)',
                                      '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.25)',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#FFC247',
                                      },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      py: 1.8,
                                      color: '#FFFFFF',
                                      '&::placeholder': {
                                        color: '#B8C7DA',
                                        opacity: 1,
                                      },
                                    },
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <IconLock size={25} stroke={1.8} color="#fff" />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={() => setShowPassword((prev) => !prev)}
                                          edge="end"
                                          sx={{
                                            color: '#fff',
                                            '&:hover': {
                                              backgroundColor: 'rgba(255,255,255,0.08)',
                                            },
                                            '&:active': {
                                              backgroundColor: 'rgba(255,255,255,0.12)',
                                            },
                                          }}
                                        >
                                          {showPassword ? (
                                            <IconEyeOff size={25} color="#fff" />
                                          ) : (
                                            <IconEye size={25} color="#fff" />
                                          )}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                              {config.ENABLE_CAPTCHA && (
                                <Box sx={{ width: '100%', mt: '0px !important' }}>
                                  <CustomFormLabel htmlFor="captcha" sx={{ color: '#fff' }}>
                                    CAPTCHA
                                  </CustomFormLabel>

                                  <Stack spacing={1}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: '100%',
                                          height: 50,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          borderRadius: 1,
                                          backgroundColor: '#f5f5f5',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        {captchaImage ? (
                                          <Box
                                            component="img"
                                            src={captchaImage}
                                            alt="CAPTCHA"
                                            sx={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'contain',
                                            }}
                                          />
                                        ) : null}
                                      </Box>

                                      <Button
                                        type="button"
                                        variant="outlined"
                                        size="large"
                                        onClick={generateCaptcha}
                                        disabled={captchaLoading}
                                      >
                                        {captchaLoading ? (
                                          <CircularProgress size={18} />
                                        ) : (
                                          <IconRefresh size={30} color="#fff" />
                                        )}
                                      </Button>
                                    </Box>

                                    <CustomTextField
                                      id="captcha"
                                      variant="outlined"
                                      fullWidth
                                      placeholder="Enter CAPTCHA code"
                                      value={captchaCode}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setCaptchaCode(e.target.value);
                                        if (captchaError) {
                                          setCaptchaError(false);
                                        }
                                      }}
                                      error={captchaError}
                                      helperText={captchaError ? 'Invalid CAPTCHA code' : ''}
                                      autoComplete="off"
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          minHeight: 56,
                                          color: '#FFFFFF',
                                          backgroundColor: 'rgba(255,255,255,0.04)',
                                          '& fieldset': {
                                            borderColor: 'rgba(255,255,255,0.25)',
                                          },
                                          '&:hover fieldset': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                          },
                                          '&.Mui-focused fieldset': {
                                            borderColor: '#FFC247',
                                          },
                                          '&.Mui-error fieldset': {
                                            borderColor: '#f44336',
                                          },
                                        },
                                        '& .MuiOutlinedInput-input': {
                                          py: 1.8,
                                          color: '#FFFFFF',
                                          '&::placeholder': {
                                            color: '#B8C7DA',
                                            opacity: 1,
                                          },
                                        },
                                        '& .MuiFormHelperText-root': {
                                          marginLeft: 0,
                                          color: '#ff6b6b',
                                        },
                                      }}
                                    />
                                  </Stack>
                                </Box>
                              )}

                              <Box display="flex" justifyContent="end" alignItems="center">
                                <Typography
                                  onClick={handleForgotPassword}
                                  sx={{
                                    opacity: 0.6,
                                    color: '#fff',
                                    cursor: 'pointer',
                                    textDecoration: 'none',

                                    mt: 0,
                                    fontSize: 14,
                                    '&:hover': {
                                      opacity: 1,
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  {/* Forgot Password? */}
                                  {t('forgotPassword')}
                                </Typography>
                              </Box>
                            </Stack>

                            <Box marginTop={1.5}>
                              <Button
                                color="primary"
                                variant="contained"
                                size="large"
                                fullWidth
                                type="submit"
                                disabled={loading}
                                sx={{
                                  bgcolor: '#0960A5',
                                  color: '#FFFFFF',
                                  boxShadow: 'none',
                                  fontSize: '16px',
                                  '&:hover': {
                                    bgcolor: '#0B70BD',
                                    boxShadow: 'none',
                                  },
                                  '&.Mui-disabled': {
                                    bgcolor: '#0960A5',
                                    color: '#FFFFFF',
                                    opacity: 1,
                                  },
                                }}
                                // endIcon={<IconArrowRight size={20} />}
                              >
                                {loading ? (
                                  <CircularProgress size={22} sx={{ color: '#FFFFFF' }} />
                                ) : (
                                  'Login'
                                )}
                              </Button>
                              {/* <Divider sx={{ my: 1 }} />
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
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'transparent',
                                  color: 'primary.main',
                                  borderColor: 'primary.main',
                                  boxShadow: 'none',
                                },
                              }}
                            >
                            
                              Register
                          
                            </Button> */}
                            </Box>

                            {error && (
                              <Box
                                sx={{
                                  height: 28,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  mt: 1,
                                }}
                              >
                                <Typography variant="subtitle2" color="error">
                                  Username or Password is invalid
                                </Typography>
                              </Box>
                            )}
                          </form>
                        )}
                      </Box>

                      {/* Guest Form */}
                      {isVisitorLogin && (
                        <form onSubmit={guestSubmit}>
                          {/* <Typography variant="h6" mb={1} textAlign="center" mt={1}>
                          Guest/Visitor
                        </Typography>
                        <Typography variant="body1" textAlign="center" color="text.secondary">
                          {t('confirmationInputCode')}
                        </Typography> */}
                          <Stack spacing={2}>
                            <Box>
                              <CustomFormLabel htmlFor="guest-id" sx={{ color: '#fff' }}>
                                {t('invitationCode')}
                              </CustomFormLabel>
                              <CustomTextField
                                id="guest-id"
                                variant="outlined"
                                fullWidth
                                placeholder="Enter your invitation code"
                                value={guestCode}
                                onChange={(e) => {
                                  setGuestCode(e.target.value);
                                  if (guestError) setGuestError(false);
                                }}
                                error={guestError}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    minHeight: 56,
                                    color: '#FFFFFF',
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    '& fieldset': {
                                      borderColor: 'rgba(255,255,255,0.25)',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#FFC247',
                                    },
                                    '&.Mui-error fieldset': {
                                      borderColor: '#f44336',
                                    },
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    py: 1.8,
                                    color: '#FFFFFF',
                                    '&::placeholder': {
                                      color: '#B8C7DA',
                                      opacity: 1,
                                    },
                                  },
                                }}
                              />
                            </Box>
                          </Stack>

                          <Box marginTop={3}>
                            <Button
                              color="primary"
                              variant="contained"
                              size="large"
                              fullWidth
                              type="submit"
                              disabled={loading}
                              sx={{
                                bgcolor: '#0960A5',
                                color: '#FFFFFF',
                                boxShadow: 'none',
                                fontSize: '16px',
                                '&:hover': {
                                  bgcolor: '#0B70BD',
                                  boxShadow: 'none',
                                },
                                '&.Mui-disabled': {
                                  bgcolor: '#0960A5',
                                  color: '#FFFFFF',
                                  opacity: 1,
                                },
                              }}
                            >
                              {loading ? (
                                <CircularProgress sx={{ color: 'primary' }} size={24} />
                              ) : (
                                t('verify')
                              )}
                            </Button>
                          </Box>

                          <Box
                            sx={{
                              height: 28,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              mt: 1,
                            }}
                          >
                            {guestError && (
                              <Typography
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  marginTop: '15px',
                                }}
                                variant="subtitle1"
                                color="error"
                              >
                                {/* Invitation Code not found */}
                                {t('invitationCodeNotFound')}
                              </Typography>
                            )}
                          </Box>
                        </form>
                      )}

                      {/* <Divider /> */}
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        marginTop={1.5}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#fff', opacity: 0.7 }}
                          fontWeight={200}
                        >
                          {/* Need some help? */}
                          {t('needHelp')}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight={600}
                          // component={RouterLink}
                          // to="/"
                          sx={{ marginLeft: 1, cursor: 'pointer', color: '#fff' }}
                          onClick={handleForgotPassword}
                        >
                          {/* Contact Us */}
                          {t('contactUs')}
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
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
          {/* <Footer /> */}
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
        <BackToTopButton />
      </PageContainer>
    </>
  );
};

export default Login;
