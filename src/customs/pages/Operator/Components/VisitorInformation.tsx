import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Grid2 as Grid,
  Divider,
  Avatar,
} from '@mui/material';
import {
  IconCheck,
  IconCreditCard,
  IconGenderBigender,
  IconPhone,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { IconBuilding, IconMail } from '@tabler/icons-react';
import PreviewImageDialog from '../Dialog/PreviewImageDialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.8 }}>
    <Box
      sx={{
        display: 'flex',
        color: 'text.secondary',
      }}
    >
      {icon}
    </Box>

    <Typography variant="body1" color="text.secondary" sx={{ width: 95 }}>
      {label}
    </Typography>

    <Typography variant="body1" color="text.secondary">
      :
    </Typography>

    <Typography variant="body1" fontWeight={500} sx={{ flex: 1 }}>
      {value || '-'}
    </Typography>
  </Stack>
);

const VisitorInformation = ({
  LprImage,
  todayVisitingPurpose,
  invitationCode,
  isFullscreen,
  faceImage,
  lgUp,
}: any) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const handleOpen = (image: string, title: string) => {
    if (!image) return;

    setSelectedImage(image);
    setSelectedTitle(title);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box
      sx={{
        p: 2.5,
        pb: 0,
        alignItems: 'flex-start',
        // backgroundColor: '#fff !important',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' },
      }}
      id="tour-visitor-info"
    >
      {/* IMAGE */}
      <Grid size={{ xs: 12, xl: 4 }}>
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            height: '100%',
            maxHeight: isFullscreen ? '50vh' : { xs: '100%', xl: '400px' },
            boxShadow: 'none !important',
            backgroundColor: 'none !important',
            // py: '0 !important',
            px: { xs: '0', lg: '0px' },
            '&.css-1o8f9r6-MuiPaper-root-MuiCard-root': {
              backgroundColor: 'none !important',
            },
          }}
        >
          <CardContent
            sx={{
              padding: '0 !important',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexDirection: { xs: 'row', md: 'row', lg: 'row', xl: 'row' },
              maxHeight: isFullscreen ? '100%' : { xs: '100%', xl: '300px' },
              overflow: 'hidden',
              boxShadow: 'none !important',
              backgroundColor: 'none !important',
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxHeight: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'none !important',
              }}
            >
              {LprImage ? (
                <img
                  src={faceImage || LprImage}
                  alt="Visitor"
                  onClick={() =>
                    handleOpen(
                      faceImage || LprImage,
                      invitationCode[0]?.visitor_name || 'Visitor Image',
                    )
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '280px',
                    maxHeight: lgUp ? '300px' : '300px',
                    objectFit: 'cover',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    backgroundColor: 'none !important',
                  }}
                />
              ) : (
                <Typography color="text.secondary">{t('noImage')}</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, xl: 8 }}>
        <Card
          elevation={0}
        >
          <CardContent sx={{ padding: '0px !important' }}>
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {invitationCode[0]?.visitor_name ?? 'Name'}
                  {invitationCode[0]?.visitor_name && (
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconCheck size={14} color="white" stroke={3} />
                    </Box>
                  )}
                </Typography>

                {/* <Typography variant="body2" color="text.secondary" mb={1.5}>
                  {invitationCode?.jabatan ?? 'Marketing'}
                </Typography> */}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1} mt={1.5}>
                  {invitationCode[0]?.visitor_type_name?.trim() && (
                    <Chip
                      size="small"
                      label={invitationCode[0].visitor_type_name}
                      color="secondary"
                    />
                  )}
                </Stack>

                <Divider sx={{ mb: 1 }} />

                <InfoRow
                  icon={<IconBuilding size={18} />}
                  label="Organization"
                  value={invitationCode[0]?.visitor_organization_name}
                />

                <InfoRow
                  icon={<IconMail size={18} />}
                  label="Email"
                  value={invitationCode[0]?.visitor_email}
                />

                <InfoRow
                  icon={<IconPhone size={18} />}
                  label="Phone"
                  value={invitationCode[0]?.visitor_phone}
                />

                <InfoRow
                  icon={<IconCreditCard size={18} />}
                  label="Identity ID"
                  value={invitationCode[0]?.visitor_identity_id}
                />

                <InfoRow
                  icon={<IconGenderBigender size={18} />}
                  label="Gender"
                  value={invitationCode[0]?.visitor_gender}
                />

                <InfoRow
                  icon={<IconUser size={18} />}
                  label="Occupancy"
                  value={invitationCode[0]?.visitor_role}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <PreviewImageDialog
        open={open}
        image={selectedImage}
        title={selectedTitle}
        onClose={handleClose}
      />
    </Box>
  );
};

export default VisitorInformation;
