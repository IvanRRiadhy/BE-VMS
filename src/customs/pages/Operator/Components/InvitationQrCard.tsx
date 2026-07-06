import { Box, Card, CardContent, CardHeader, Divider, Typography, useTheme } from '@mui/material';
import QRCode from 'react-qr-code';
import { IconCards } from '@tabler/icons-react';

interface InvitationQrCardProps {
  invitationCode?: {
    visitor_number?: string;
    invitation_code?: string;
  }[];
  isFullscreen?: boolean;
  statusLabel?: string;
}

const InvitationQrCard = ({
  invitationCode = [],
  isFullscreen = false,
  statusLabel = 'Match',
}: InvitationQrCardProps) => {
  const data = invitationCode[0];

  const theme = useTheme();
  const lg = theme.breakpoints.up('lg');

  return (
    <Card
      sx={{
        borderRadius: 1.5,
        // height: '250p',
        width: '100%',
        // height: {
        //   xs: '100%',
        //   xl: data ? '400px' : '400px',
        // },
        // minHeight: 360,
        // maxHeight: isFullscreen ? '100%' : { xs: '100%', sm: '100%', xl: '400px' },
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // border: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        p: 1,
        mt: 0.5,
      }}
    >
      <CardHeader
        title="Visitor QR Code"
        style={{ fontWeight: 'bold', paddingBottom: '0px !important' }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pb: '0 !important',
          pt: '0px !important',
        }}
      >
        {/* QR / Empty State */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'start',
            // alignItems: 'center',
            minHeight: 120,
            mb: 0,
            gap: 5,
          }}
        >
          {data?.visitor_number ? (
            <QRCode
              size={160}
              value={data?.visitor_number || ''}
              viewBox="0 0 256 256"
              style={{
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                background: 'white',
              }}
            />
          ) : (
            <Box textAlign="center" color="text.secondary">
              <IconCards size={48} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Typography variant="h6" fontWeight={500}>
                No QR/Card Available
              </Typography>
              <Typography variant="body1" color="text.disabled">
                Scan a visitor to show QR code
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h6" fontWeight={'semibold'}>
              Invitation Code
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data?.invitation_code || '-'}
            </Typography>
            <Typography variant="h6" fontWeight={'semibold'}>
              Check In Time
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data?.checkin_at || '-'}
            </Typography>
            <Typography variant="h6" fontWeight={'semibold'}>
              Check Out Time
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data?.checkout_at || '-'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvitationQrCard;
