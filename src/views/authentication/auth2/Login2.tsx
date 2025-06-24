import React, { FormEvent } from 'react';
import {
  Grid2 as Grid,
  Box,
  Card,
  Stack,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/customs/components/logo/Logo';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { login } from 'src/customs/api/users';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useAuth } from 'src/customs/contexts/AuthProvider';

const Login2 = () => {
  const { isAuthenticated } = useAuth();

  const { saveToken } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  // On check Authenticate.
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated]);

  // On Error
  React.useEffect(() => {
    if (error === true) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  // On Submit
  async function loginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const body = {
      username: username,
      password: password,
    };

    try {
      const response = await login(body);
      // save token.
      saveToken(response.collection.token);
      console.log(response.collection.token);
      navigate('/admin/dashboard');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }

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
                size={{
                  xs: 12,
                  sm: 12,
                  lg: 5,
                  xl: 4,
                }}
              >
                <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '450px' }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Logo />
                  </Box>
                  <form onSubmit={loginSubmit}>
                    <Stack>
                      <Box>
                        <CustomFormLabel htmlFor="username">Username</CustomFormLabel>
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
                        <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
                        <CustomTextField
                          id="password"
                          type="password"
                          variant="outlined"
                          fullWidth
                          value={password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                          }
                        />
                      </Box>
                    </Stack>
                    <Box marginTop={4}>
                      <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth
                        type="submit"
                        disabled={loading || username.trim() === '' || password.trim() === ''}
                      >
                        {loading ? (
                          <CircularProgress sx={{ color: 'white' }} size={24} />
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </Box>
                  </form>

                  {error && (
                    <Typography
                      sx={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}
                      variant="subtitle1"
                      color="error"
                    >
                      Username or Password is invalid
                    </Typography>
                  )}
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
