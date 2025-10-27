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
import { CameraAlt } from '@mui/icons-material'; // icon kamera
import Avatar from '@mui/material/Avatar';
const TermOfService = () => {
  return (
    <>
      <PageContainer title="Terms of Service" description="this is Login page">
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
                lg: 6,
                xl: 5,
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

                  <Typography variant="h4" mb={1} mt={1}>
                    Terms of Service
                  </Typography>
                  <Typography
                    variant="caption"
                    textAlign="center"
                    px={4}
                    sx={{ color: '#6e6e6e' }} // 👈 custom abu-abu
                  >
                    Last update: 01/01/2023
                  </Typography>
                </Box>

                <form>
                  <Stack spacing={2} alignItems="start" marginTop={4}>
                    <Typography variant="h6" fontWeight={600} mb={0}>
                      Introduction
                    </Typography>
                    <Typography variant="caption" sx={{ marginTop: '0 !important' }}>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse enim quae rem,
                      nostrum officia, debitis in accusamus dicta aliquam cupiditate tempore
                      aspernatur, veniam quidem dolorum cumque eum deleniti dignissimos illo
                      suscipit porro placeat deserunt! Ratione, repellendus repellat cupiditate
                      iure, fugiat dolorum eligendi accusantium aperiam quae esse hic, temporibus
                      ad! Sed.
                    </Typography>

                    <Typography variant="h6" fontWeight={600} mb={0}>
                      Service Provider
                    </Typography>
                    <Typography variant="caption" sx={{ marginTop: '0 !important' }}>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse enim quae rem,
                      nostrum officia, debitis in accusamus dicta aliquam cupiditate tempore
                      aspernatur, veniam quidem dolorum cumque eum deleniti dignissimos illo
                      suscipit porro placeat deserunt! Ratione, repellendus repellat cupiditate
                      iure, fugiat dolorum eligendi accusantium aperiam quae esse hic, temporibus
                      ad! Sed.
                    </Typography>
                    <Typography variant="h6" fontWeight={600} mb={0}>
                      Age Requirements
                    </Typography>
                    <Typography variant="caption" sx={{ marginTop: '0 !important' }}>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse enim quae rem,
                      nostrum officia, debitis in accusamus dicta aliquam cupiditate tempore
                      aspernatur, veniam quidem dolorum cumque eum deleniti dignissimos illo
                      suscipit porro placeat deserunt! Ratione, repellendus repellat cupiditate
                      iure, fugiat dolorum eligendi accusantium aperiam quae esse hic, temporibus
                      ad! Sed.
                    </Typography>
                    <Typography variant="h6" fontWeight={600} mb={0}>
                      Lorem Ipsum
                    </Typography>
                    <Typography variant="caption" sx={{ marginTop: '0 !important' }}>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse enim quae rem,
                      nostrum officia, debitis in accusamus dicta aliquam cupiditate tempore
                      aspernatur, veniam quidem dolorum cumque eum deleniti dignissimos illo
                      suscipit porro placeat deserunt! Ratione, repellendus repellat cupiditate
                      iure, fugiat dolorum eligendi accusantium aperiam quae esse hic, temporibus
                      ad! Sed.
                    </Typography>
                  </Stack>
                  <Box marginTop={4} display="flex" justifyContent="space-between" gap={2}>
                    {/* <Button
                      color="primary"
                      variant="outlined"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to="/guest-selfie"
                    >
                      Sebelumnya
                    </Button> */}
                    <Button
                      color="primary"
                      variant="contained"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to="/guest/dashboard"
                    >
                      Accept Terms & Condition
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

export default TermOfService;
