import { Box, Button, Card, Typography } from '@mui/material';
import { IconCards } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

type GuestAccessPassProps = {
  accessPass?: {
    visitor_number?: string;
  } | null;
  onOpenAccess: () => void;
  onInsertInvitationCode: () => void;
};

const GuestAccessPass = ({
  accessPass,
  onOpenAccess,
  onInsertInvitationCode,
}: GuestAccessPassProps) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
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
        onClick={onOpenAccess}
      >
        {accessPass ? (
          <>
            <Typography variant="h5">Access Pass</Typography>

            <Box
              sx={{
                p: 1,
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCode
                value={String(accessPass.visitor_number ?? '')}
                size={50}
                style={{
                  width: '150px',
                  height: 'auto',
                }}
              />
            </Box>

            <Typography variant="body1" fontWeight={600} color="primary">
              {t('tapShowDetail')}
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
              {t('noAccessPass')}
            </Typography>
          </Box>
        )}
      </Card>

      <Button variant="contained" sx={{ mt: 1 }} onClick={onInsertInvitationCode}>
        {t('insertInvitationCode')}
      </Button>
    </Box>
  );
};

export default GuestAccessPass;
