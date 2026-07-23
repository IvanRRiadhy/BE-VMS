import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useTheme,
  Grid2 as Grid,
} from '@mui/material';
import {
  IconBrandWhatsapp,
  IconPhone,
} from '@tabler/icons-react';
import { Email } from '@mui/icons-material';

interface InvitationQrCardProps {
  invitationCode?: any;
  isFullscreen?: boolean;
  statusLabel?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: '#f8fafc',
      border: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Box>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>

      <Typography variant="h5" fontWeight={700} sx={{ color }}>
        {value}
      </Typography>
    </Box>

    <Box sx={{ color }}>{icon}</Box>
  </Box>
);

const HostInformation = ({
  invitationCode = [],
  isFullscreen = false,
  statusLabel = 'Match',
}: InvitationQrCardProps) => {
  const data = invitationCode[0];
  const whatsappNumber = data?.hosts[0].phone?.replace(/\D/g, '');
  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          width: '100%',
          border: '1px solid #e0e0e0',
          backgroundColor: 'background.paper',
          p: 1,
          mt: 0.5,
        }}
        id="tour-host-info"
      >
        <CardHeader title="Host Information" sx={{ pb: '0 !important', pt: '15px !important' }} />
        {/* <Divider /> */}
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            pb: '0 !important',
            pt: '25px !important',
            px: '15px !important',
          }}
        >
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Avatar style={{ width: '100px', height: '100px' }} />
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  mb: 1
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={0}>
                  {data?.hosts[0].name || '-'}
                </Typography>
                {data && (
                  <Typography
                    sx={{
                      backgroundColor: 'success.main',
                      color: '#fff',
                      borderRadius: '20px',
                      padding: '5px',
                    }}
                  >
                    Available
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" color="text.secondary" mb={2} fontWeight={'semibold'}>
                {data?.host_organization_name || '-'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <IconPhone size={25} />
                </Box>

                <Typography sx={{ width: 5 }}>:</Typography>

                <Typography variant="body1" color="text.secondary">
                  {data?.hosts[0].phone || '-'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Email sx={{ fontSize: 25 }} />
                </Box>

                <Typography sx={{ width: 5 }}>:</Typography>

                <Typography variant="body1" color="text.secondary">
                  {data?.hosts[0].email || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Box
              component="a"
              href={data?.hosts[0].phone ? `tel:${data?.hosts[0].phone}` : undefined}
              sx={{
                flex: 1,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2,
                textDecoration: 'none',
                cursor: data?.hosts[0].phone ? 'pointer' : 'not-allowed',
                opacity: data?.hosts[0].phone ? 1 : 0.5,
              }}
            >
              <IconPhone size={20} />
              Call
            </Box>

            <Box
              component="a"
              href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                flex: 1,
                bgcolor: 'success.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2,
                textDecoration: 'none',
                cursor: whatsappNumber ? 'pointer' : 'not-allowed',
                opacity: whatsappNumber ? 1 : 0.5,
              }}
            >
              <IconBrandWhatsapp size={20} />
              Chat
            </Box>

            <Box
              component="a"
              href={data?.hosts[0].email ? `mailto:${data?.hosts[0].email}` : undefined}
              sx={{
                flex: 1,
                bgcolor: 'secondary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2,
                textDecoration: 'none',
                cursor: data?.hosts[0].email ? 'pointer' : 'not-allowed',
                opacity: data?.hosts[0].email ? 1 : 0.5,
              }}
            >
              <Email />
              Email
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default HostInformation;
