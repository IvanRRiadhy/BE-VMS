import { Box, Card, Typography } from '@mui/material';
import { IconLogin, IconLogout } from '@tabler/icons-react';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

type VisitStatusCardProps = {
  accessPass?: {
    checkin_at?: string | null;
    checkin_by?: string | null;
    checkout_at?: string | null;
    checkout_by?: string | null;
  } | null;
};

const VisitStatusCard = ({ accessPass }: VisitStatusCardProps) => {
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 2,
        p: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 2.5,
          textAlign: 'center',
          fontSize: {
            xs: '1rem',
            sm: '1.1rem',
          },
        }}
      >
        Visit Status
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
          },
          gap: 2,
        }}
      >
        {/* CHECK IN */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: '#66BB6A',
            backgroundColor: '#E8F5E9',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'success.main',
                color: 'white',
              }}
            >
              <IconLogin size={18} />
            </Box>

            <Typography variant="subtitle1" fontWeight={700}>
              Check In
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Check In At
          </Typography>

          <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5 }}>
            {accessPass?.checkin_at ? formatDateTime(accessPass.checkin_at) : '-'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Checked In By
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {accessPass?.checkin_by ?? '-'}
          </Typography>
        </Box>

        {/* CHECK OUT */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: '#EF5350',
            backgroundColor: accessPass?.checkout_at ? '#FFEBEE' : '#edc2c0',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'red',
                color: 'white',
              }}
            >
              <IconLogout size={18} />
            </Box>

            <Typography variant="subtitle1" fontWeight={700}>
              Check Out
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Check Out At
          </Typography>

          <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5 }}>
            {accessPass?.checkout_at ? formatDateTime(accessPass.checkout_at) : '-'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Checked Out By
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {accessPass?.checkout_by ?? '-'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default VisitStatusCard;
