import React, { FormEvent, useEffect, useState } from 'react';
import {
  Grid2 as Grid,
  Box,
  Card,
  Stack,
  Link,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/customs/components/logo/Logo';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

const GuestView = () => {
  return (
    <>
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
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection={'column'}
                >
                  <Logo />

                  <Typography variant="h4" mb={1} mt={2}>
                    Verifikasi Kode
                  </Typography>
                  <Typography variant="subtitle2">Masukkan Kode Undangan Anda</Typography>
                </Box>

                <form>
                  <Stack>
                    <Box>
                      <CustomFormLabel htmlFor="username">Kode Undangan</CustomFormLabel>
                      <CustomTextField
                        id="username"
                        variant="outlined"
                        fullWidth
                        value={''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          //   setUsername(e.target.value)
                          ''
                        }
                      />
                    </Box>
                  </Stack>
                  <Box marginTop={4}>
                    <Button
                      color="primary"
                      variant="contained"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to="/guest-information"
                    >
                      Verifikasi
                    </Button>
                  </Box>
                </form>

                {/* {error && (
                  <Typography
                    sx={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}
                    variant="subtitle1"
                    color="error"
                  >
                    Username or Password is invalid
                  </Typography>
                )} */}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default GuestView;
