import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import QRCode from 'react-qr-code';
import { IconCards, IconX } from '@tabler/icons-react';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useTranslation } from 'react-i18next';

interface InvitationQrDialogProps {
  open: boolean;
  onClose: () => void;
  activeVisitor?: any;
}

const InvitationQrDialog = ({ open, onClose, activeVisitor }: InvitationQrDialogProps) => {
  const { t } = useTranslation();

  const data = activeVisitor;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Visitor QR Code
        </Typography>

        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {data?.visitor_number ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/* QR Code */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <QRCode
                size={180}
                value={data.visitor_number}
                viewBox="0 0 256 256"
                style={{
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'white',
                }}
              />
            </Box>

            {/* Visitor Information */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                flex: 1,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  {t('invitationCode')}
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {data?.invitation_code || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  {t('checkInTime')}
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {data?.checkin_at ? formatDateTime(data.checkin_at) : '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  {t('checkOutTime')}
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {formatDateTime(data?.checkout_at || data?.visitor_period_end) || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <IconCards
              size={56}
              style={{
                opacity: 0.4,
                marginBottom: 12,
              }}
            />

            <Typography variant="h6" fontWeight={500}>
              {t('noQrCardAvailable')}
            </Typography>

            <Typography variant="body2" color="text.disabled" mt={0.5}>
              {t('scanVisitorOrTapCard')}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvitationQrDialog;
