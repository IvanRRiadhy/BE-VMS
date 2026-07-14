import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { Box } from '@mui/system';
import { Card, CircularProgress, Grid2 as Grid, Tooltip } from '@mui/material';
import Logo from 'src/assets/images/logos/BI_Logo.png';
import Footer from 'src/views/authentication/components/Footer';
import { KeyboardArrowUp } from '@mui/icons-material';
import FormSelfPraregistration from './FormSelfPraregistration';
import { getInvitationLink } from 'src/customs/api/users';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getPublicSite,
  getPublicVisitorEmployee,
  getPublicVisitorHost,
} from 'src/customs/api/Public';
import { IconUsers } from '@tabler/icons-react';

export default function InvitationShare() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const d = searchParams.get('d');
    const code = searchParams.get('code');
    const timestamp = searchParams.get('timestamp');
    const sig = searchParams.get('sig');

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
      const res = await getInvitationLink(payload.d, payload.code, payload.timestamp, payload.sig);

      setInvitation(res.collection);
    } catch (err: any) {
      const msg = err?.response?.data?.msg;

      if (
        msg ===
        'Failed Message: This invitation link quota exceeded. Invitation link has reached its maximum number of registrations.'
      ) {
        navigate('/auth/limited');
        return;
      }

      if (err?.response?.status === 403) {
        navigate('/auth/expired');
        return;
      }

      setError(true);
    }
  };

  const [sites, setSites] = useState<any[]>([]);
  const [allVisitorEmployee, setAllVisitorEmployee] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          getPublicSite(code, 'InvitationLink'),
          getPublicVisitorEmployee(code, 'InvitationLink'),
          getPublicVisitorHost(code, 'InvitationLink'),
        ]);

        const [sitesRes, visitorEmployeeRes, employeeRes] = results;

        if (sitesRes.status === 'fulfilled') {
          setSites(sitesRes.value.collection ?? []);
        } else {
          console.error('Error fetching sites:', sitesRes.reason);
        }

        if (visitorEmployeeRes.status === 'fulfilled') {
          setAllVisitorEmployee(visitorEmployeeRes.value.collection);
        } else {
          console.error('Error fetching visitor employee:', visitorEmployeeRes.reason);
        }

        if (employeeRes.status === 'fulfilled') {
          setEmployee(employeeRes.value.collection);
        } else {
          console.error('Error fetching employee:', employeeRes.reason);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchData();
    }
  }, [code]);

  if (error)
    return (
      <div>
        <Box
          sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress color="primary" />
        </Box>
      </div>
    );

  if (!invitation)
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress color="primary" />
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
                borderTopRightRadius: '10px !important',
                borderTopLeftRadius: '10px !important',
                borderBottomLeftRadius: '0px !important',
                borderBottomRightRadius: '0px !important',
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
                borderBottomRightRadius: 6,
                borderBottomLeftRadius: 6,
              }}
            >
              <FormSelfPraregistration
                invitation={invitation}
                code={code}
                timestamp={timestamp}
                sites={sites}
                employee={employee}
                allVisitorEmployee={allVisitorEmployee}
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
