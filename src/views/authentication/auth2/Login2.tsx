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
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/customs/components/logo/Logo';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { AuthVisitor, login } from 'src/customs/api/users';
import { AxiosError } from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { IconEye, IconEyeOff, IconUser, IconUserPlus } from '@tabler/icons-react';

const Login2 = () => {
  const { isAuthenticated } = useAuth();
  const { saveToken } = useSession();
  const navigate = useNavigate();

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

  // Tabs state
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error === true) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  // Handle captcha change (token received)
  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) setCaptchaError(false);
  };

  // On Submit (login normal)
  async function loginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Basic client-side captcha check before proceeding
    if (!captchaToken) {
      setCaptchaError(true);
      setLoading(false);
      return;
    }

    const body = { username, password, captchaToken };
    // const body = { username, password };

    try {
      const response = await login(body);
      // reset captcha after submit
      recaptchaRef.current?.reset();
      // setCaptchaToken(null);

      saveToken(response.collection.token, 'admin');
      navigate('/admin/dashboard');
    } catch (err) {
      // jangan set error langsung, tunggu spinner selesai
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

  // On Submit (guest login)
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
      console.log('Response guest login:', res);
      setGuestError(false);

      if (!res?.collection) {
        setLoading(false);
        setGuestError(true);
        return;
      }

      const status = res.status || '';
      console.log('Status:', status);

      setTimeout(() => {
        setLoading(false);

        if (status.toLowerCase() === 'process') {
          navigate(`/portal/waiting?code=${guestCode}`);
        } else if (status === 'fiil_form') {
          navigate(`/portal/information?code=${guestCode}`);
        } else {
          if (res.collection.token) {
            saveToken(res.collection.token, 'guest');
          }
          navigate('/guest/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Guest login gagal:', err);
      setGuestError(true);
      setLoading(false);
    }
  };

  return (
    <>
      {!isAuthenticated && (
        <PageContainer title="Login" description="this is Login page">
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
            <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
              <Grid
                display="flex"
                justifyContent="center"
                alignItems="center"
                size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
              >
                <Card
                  elevation={9}
                  sx={{
                    p: 4,
                    zIndex: 1,
                    width: '100%',
                    maxWidth: '450px',
                    borderRadius: 3,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <Logo />
                  </Box>

                  {/* Tabs Switch */}
                  <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
                    <Tab icon={<IconUser size={18} />} iconPosition="start" label="Admin" />
                    <Tab
                      icon={<IconUserPlus size={18} />}
                      iconPosition="start"
                      label="Guest/Visitor"
                    />
                  </Tabs>

                  {/* Login Form */}
                  {tab === 0 && (
                    <form onSubmit={loginSubmit}>
                      <Typography variant="h6" mb={2} textAlign="center">
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
                        {showCaptcha && (
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
                        )}
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
                            'Log in'
                          )}
                        </Button>
                      </Box>
                    </form>
                  )}

                  {/* Guest Form */}
                  {tab === 1 && (
                    <form onSubmit={guestSubmit}>
                      <Typography variant="h6" mb={1} textAlign="center">
                        Guest/Visitor Access
                      </Typography>
                      <Typography variant="body1" textAlign="center" color="text.secondary">
                        Masukkan Kode Undangan Anda
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <CustomFormLabel htmlFor="guest-id">Kode Undangan</CustomFormLabel>
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
                        {showCaptcha && (
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
                        )}
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
                            'Verifikasi'
                          )}
                        </Button>
                      </Box>

                      {guestError && (
                        <Typography
                          sx={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}
                          variant="subtitle1"
                          color="error"
                        >
                          Kode undangan tidak ditemukan.
                        </Typography>
                      )}
                    </form>
                  )}

                  {error && tab === 0 && (
                    <Typography
                      sx={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}
                      variant="subtitle1"
                      color="error"
                    >
                      Username or Password is invalid
                    </Typography>
                  )}

                  <Box display="flex" alignItems="center" justifyContent="center" marginTop={4}>
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
                      to="/register"
                      sx={{ marginLeft: 1 }}
                    >
                      Contact Us
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </PageContainer>
      )}
    </>
  );
};

export default Login2;
