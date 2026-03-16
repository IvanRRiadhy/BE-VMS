import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { Box } from '@mui/system';
import { Card, CircularProgress, Grid2 as Grid, Tooltip } from '@mui/material';
import Logo from 'src/assets/images/logos/BI_Logo.png';
import Footer from 'src/views/authentication/components/Footer';
import { KeyboardArrowUp } from '@mui/icons-material';
import FormSelfPraregistration from './FormSelfPraregistration';
import { getInvitationLink, invitationLink } from 'src/customs/api/users';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getPublicSite,
  getPublicVisitorEmployee,
  getPublicVisitorHost,
} from 'src/customs/api/Public';
import { useQuery } from '@tanstack/react-query';
import { IconUsers } from '@tabler/icons-react';

export default function InvitationShare() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(false);
  const { token } = useSession();
  const navigate = useNavigate();

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [d, setD] = useState<string>('');
  const [sig, setSig] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee', code],
    queryFn: () => getPublicVisitorHost(token as string, code, 'InvitationLink'),
    enabled: !!token && !!code,
  });

  const { data: sites, isLoading: siteLoading } = useQuery({
    queryKey: ['sites', code],
    queryFn: () => getPublicSite(token as string, code, 'InvitationLink'),
    enabled: !!token && !!code,
  });

  const { data: allVisitorEmployee, isLoading: visitorEmployeeLoading } = useQuery({
    queryKey: ['all-visitor-employee', code],
    queryFn: () => getPublicVisitorEmployee(token as string, code, 'InvitationLink'),
    enabled: !!token && !!code,
  });

  const employeeList = employee?.collection ?? [];
  const siteList = sites?.collection ?? [];
  const visitorEmployeeList = allVisitorEmployee?.collection ?? [];

  useEffect(() => {
    const d = searchParams.get('d');
    const code = searchParams.get('code');
    const timestamp = searchParams.get('timestamp');
    const sig = searchParams.get('sig');

    // 🔥 VALIDASI WAJIB ADA
    if (!d || !code || !timestamp || !sig) {
      setError(true);
      return;
    }

    setCode(code);
    setTimestamp(timestamp);

    loadInvitation({ d, code, timestamp, sig });
  }, []);

  const loadInvitation = async (payload: {
    d: string;
    code: string;
    timestamp: string;
    sig: string;
  }) => {
    try {
      const res = await getInvitationLink(
        token as string,
        payload.d,
        payload.code,
        payload.timestamp,
        payload.sig,
      );

      setInvitation(res.collection);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        navigate('/auth/expired');
        return;
      }
      setError(true);
    }
  };

  if (error)
    return (
      <div>
        <Box
          sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress />
        </Box>
      </div>
    );

  if (!invitation)
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <PageContainer title="Self Praregistration" description="this is self praregistration">
      <Box>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}
        >
          <Grid size={{ xs: 12, sm: 11, xl: 11 }} sx={{ p: { xs: 2 } }}>
            <Card
              elevation={10}
              sx={{
                p: 3,
                borderTopRightRadius: '5px !important',
                borderTopLeftRadius: '5px !important',
                borderBottomLeftRadius: '0 !important',
                borderBottomRightRadius: '0 !important',
                bgcolor: 'white',
                pb: '0 !important',
              }}
            >
              <Box
                textAlign="center"
                mb={0}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={Logo} width={100} height={100} alt="Logo" />
                <Box
                  sx={{
                    mt: 2,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <IconUsers size={16} />
                  Capacity: {invitation?.current_usage ?? 0} / {invitation?.max_usage ?? 0}
                </Box>
              </Box>
            </Card>
            <Box
              sx={{
                mt: 0,
                backgroundColor: 'white',
                p: 3,
                borderTopRightRadius: '0px !important',
                borderTopLeftRadius: '0px !important',
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
              }}
            >
              <FormSelfPraregistration
                invitation={invitation}
                code={code}
                timestamp={timestamp}
                sites={siteList}
                employee={employeeList}
                allVisitorEmployee={visitorEmployeeList}
              />
            </Box>
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
