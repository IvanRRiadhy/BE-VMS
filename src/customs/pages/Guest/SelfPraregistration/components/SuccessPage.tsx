import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { Box } from '@mui/system';
import { Card, CircularProgress, Grid2 as Grid, Tooltip, Typography } from '@mui/material';
import Logo from 'src/assets/images/logos/BI_Logo.png';
import Footer from 'src/views/authentication/components/Footer';
import { KeyboardArrowUp } from '@mui/icons-material';

import { IconArrowLeft, IconArrowRight, IconCircleCheck, IconUsers } from '@tabler/icons-react';

export default function SuccessPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  return (
    <PageContainer title="Invitation" description="this is self praregistration">
      <Box>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: '80vh', backgroundColor: '#f4f6f8' }}
        >
          <Grid size={{ xs: 12, sm: 10, md: 8, xl: 6 }} sx={{ p: { xs: 2 } }}>
            <Card
              elevation={10}
              sx={{
                p: 3,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                bgcolor: 'white',
                pb: '2 !important',
              }}
            >
              <Box
                textAlign="center"
                mb={2}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                {/* <img src={Logo} width={100} height={100} alt="Logo" /> */}

                <Box
                  sx={(theme) => ({
                    backgroundColor: theme.palette.success.main,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: '8px',

                    boxShadow: `0 0 0 6px ${theme.palette.success.light}`,

                    animation: 'popIn 0.6s ease',

                    '@keyframes popIn': {
                      '0%': {
                        transform: 'scale(0.5)',
                        opacity: 0,
                      },
                      '70%': {
                        transform: 'scale(1.1)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  })}
                >
                  <IconCircleCheck size={60} color="white" />
                </Box>
                <Typography variant="h4" mt={2} fontWeight={600}>
                  Invitation Submitted Successfully
                </Typography>

                <Typography variant="body1" sx={{ my: 2, maxWidth: 420, color: 'text.secondary' }}>
                  Your invitation has been successfully submitted. <br />A confirmation email with
                  the invitation details will be sent to your email address shortly.
                </Typography>

                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                  Please check your inbox or spam folder if you do not receive the email within a
                  few minutes.
                </Typography>

                <Typography
                  sx={{
                    mt: 2,
                    color: 'gray',
                  }}
                >
                  <Link
                    to="/auth/login"
                    style={{ display: 'flex', alignItems: 'center', color: 'gray' }}
                  >
                    <IconArrowLeft />
                    Back To Login
                  </Link>
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
        <Footer />
      </Box>
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
  );
}
