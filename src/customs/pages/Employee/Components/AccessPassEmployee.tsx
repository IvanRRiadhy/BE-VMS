import { Card, Box, Typography } from '@mui/material';
import { IconCards } from '@tabler/icons-react';
import QRCode from 'react-qr-code';

type AccessPassEmployeeProps = {
  activeAccessPass?: {
    visitor_number?: string;
  } | null;
  onClick?: () => void;
};

const AccessPassEmployee = ({ activeAccessPass, onClick }: AccessPassEmployeeProps) => {
  return (
    <Card
      sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
        gap: 1,
      }}
      onClick={onClick}
    >
      {activeAccessPass ? (
        <>
          <Typography variant="h5">Access Pass</Typography>

          <Box
            sx={{
              p: 1,
              backgroundColor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCode
              value={activeAccessPass.visitor_number || ''}
              size={50}
              style={{
                height: 'auto',
                width: '160px',
              }}
            />
          </Box>

          <Typography variant="body1" fontWeight={600} color="primary">
            Tap to show detail
          </Typography>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <IconCards size={40} />

          <Typography
            variant="body1"
            color="text.secondary"
            fontStyle="italic"
            textAlign="center"
            mt={1}
          >
            No access pass found
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default AccessPassEmployee;
