import { Box, Card, CardContent, CardHeader, Divider, Typography, useTheme } from '@mui/material';
import QRCode from 'react-qr-code';
import { IconCards } from '@tabler/icons-react';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useTranslation } from 'react-i18next';

interface InvitationQrCardProps {
  invitationCode: any;
  statusLabel?: string;
  activeVisitor?: any;
}

const InvitationQrCard = ({
  invitationCode,
  statusLabel = 'Match',
  activeVisitor,
}: InvitationQrCardProps) => {
  // const data = invitationCode[0];
  const data = activeVisitor;
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        borderRadius: 1.5,
        width: '100%',
        minHeight: 0,
        flex: 1,
        backgroundColor: 'background.paper',
        p: 1,
        mt: 0.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title="Visitor QR Code"
        style={{ fontWeight: 'bold', paddingBottom: '0px !important' }}
      />
      <CardContent
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'stretch',
          pt: 3,
          pb: '0 !important',
        }}
      >
        {/* QR / Empty State */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            // alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 5,
            minHeight: 0,
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
            <Box textAlign="center" color="text.secondary" >
              <IconCards size={48} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Typography variant="h6" fontWeight={500}>
                {t('noQrCardAvailable')}
              </Typography>
              <Typography variant="body1" color="text.disabled">
                {t('scanVisitorOrTapCard')}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" fontWeight={'semibold'}>
              {t('invitationCode')}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {data?.invitation_code || '-'}
            </Typography>
            <Typography variant="h6" fontWeight={'semibold'}>
              {t('checkInTime')}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDateTime(data?.checkin_at) ?? '-'}
            </Typography>
            <Typography variant="h6" fontWeight={'semibold'}>
              {t('checkOutTime')}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDateTime(data?.checkout_at || data?.visitor_period_end)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvitationQrCard;
