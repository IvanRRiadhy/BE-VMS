import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
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

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: '100%',
        width: '100%',
        maxHeight: isFullscreen ? '100%' : { xs: '100%', sm: '100%', xl: '400px' },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #e0e0e0',
        p: 2,
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pb: '0 !important',
        }}
      >
        {/* QR / Empty State */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 120,
            mb: 0,
          }}
        >
          {data?.visitor_number ? (
            <QRCode
              size={170}
              value={data.visitor_number}
              viewBox="0 0 256 256"
              style={{
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                padding: '10px',
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
        </Box>

        {/* Number */}
        <Box mt={2}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Number
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            {data?.visitor_number || '-'}
          </Typography>
        </Box>

        {/* Invitation Code */}
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Invitation Code
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            {data?.invitation_code || '-'}
          </Typography>
        </Box>

        <Divider sx={{ mt: 0.5 }} />

        {/* Status */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto" >
          <Typography variant="h6" fontWeight="bold">
            Status
          </Typography>
          <Box
            component="span"
            sx={{
              backgroundColor: '#4CAF50',
              color: 'white',
              px: 2,
              py: 0.5,
              mt: 0.5,
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {statusLabel}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvitationQrCard;
