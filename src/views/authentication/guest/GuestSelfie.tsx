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
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/customs/components/logo/Logo';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { CameraAlt } from '@mui/icons-material'; // icon kamera
import Avatar from '@mui/material/Avatar';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import CameraUpload from 'src/customs/components/camera/CameraUpload';

const GuestSelfie = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code'); // ✅ ambil kode undangan
  return (
    <>
      <PageContainer title="Selfie" description="this is Selfie page">
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
                xs: 11,
                sm: 8,
                lg: 5,
              }}
            >
              <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%' }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection={'column'}
                >
                  <Logo />

                  <Avatar
                    alt="Selfie Preview"
                    src="/images/selfie-placeholder.png" // bisa diganti default image
                    sx={{ width: 140, height: 140, marginTop: 2 }}
                  />
                  <Typography variant="h5" mb={1} mt={4}>
                    Foto Selfie
                  </Typography>
                  <Typography variant="subtitle2" textAlign="center" px={5}>
                    Diwajibkan oleh hukum untuk memverifikasi identitas anda sebagai pengguna baru.
                  </Typography>
                </Box>

                <form>
                  <Stack spacing={2} alignItems="center" marginTop={3}>
                    {/* Dummy image / avatar */}

                    {/* Label dengan icon */}
                    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                      {/* <CameraAlt fontSize="small" color="action" sx={{ color: '#5c87ff' }} /> */}
                      {/* <CustomFormLabel
                        htmlFor="selfie"
                        sx={{
                          cursor: 'pointer',
                          m: 0,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '15px',
                          color: '#5c87ff',
                        }}
                      >
                        Take a selfie
                      </CustomFormLabel> */}
                      <CameraUpload value={''} onChange={() => {}} />
                    </Box>
                  </Stack>
                  <Box marginTop={5} display="flex" justifyContent="space-between" gap={2}>
                    <Button
                      color="primary"
                      variant="outlined"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to={code ? `/portal/information?code=${code}` : '/portal/information'}
                      startIcon={<ArrowBack />}
                    >
                      Sebelumnya
                    </Button>

                    <Button
                      color="primary"
                      variant="contained"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to={code ? `/portal/photo-identity?code=${code}` : '/portal/'}
                      endIcon={<ArrowForward />}
                    >
                      Selanjutnya
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

export default GuestSelfie;
