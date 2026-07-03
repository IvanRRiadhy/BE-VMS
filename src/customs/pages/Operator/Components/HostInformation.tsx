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
import QRCode from 'react-qr-code';
import {
  IconBrandWhatsapp,
  IconCar,
  IconCards,
  IconPhone,
  IconTruck,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Email } from '@mui/icons-material';

interface InvitationQrCardProps {
  //   invitationCode?: {
  //     visitor_number?: string;
  //     invitation_code?: string;
  //   }[];
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

  const theme = useTheme();
  const lg = theme.breakpoints.up('lg');

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          // height: '100%',
          width: '100%',
          height: '100%',
          // height: {
          //   xs: '100%',
          //   xl: data ? '400px' : '400px',
          // },
          // minHeight: 360,
          // maxHeight: isFullscreen ? '100%' : { xs: '100%', sm: '100%', xl: '400px' },
          // display: 'flex',
          // justifyContent: 'center',
          // alignItems: 'center',
          border: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          p: 1,
          mt: 0.5,
        }}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  {data?.nama || 'John Doe'}
                </Typography>
                <Typography
                  sx={{
                    backgroundColor: 'success.main',
                    color: '#fff',
                    borderRadius: '5px',
                    padding: '5px',
                  }}
                >
                  Available
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" mb={2} fontWeight={'semibold'}>
                {/* {data?.visitor_number || '-'} */}
                IT Manager
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

                <Typography variant="h6" color="text.secondary">
                  08123456789
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

                <Typography variant="h6" color="text.secondary">
                  qM7tN@example.com
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Box
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
              }}
            >
              <IconPhone size={20} />
              Call
            </Box>

            <Box
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
              }}
            >
              <IconBrandWhatsapp size={20} />
              Chat
            </Box>

            <Box
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
