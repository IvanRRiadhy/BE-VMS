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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  IconCheck,
  IconCreditCard,
  IconGenderAgender,
  IconGenderBigender,
  IconMan,
  IconPencil,
  IconPhone,
  IconUser,
  IconWoman,
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
        width: 24,
        minWidth: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
  handleOpenEnableEdit,
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

  const visitorTypeDefaults = [
    {
      id: 'general-visitor',
      name: 'General Visitor',
      background: '#E8F3FF',
      text: '#2F80ED',
    },
    {
      id: 'all-access-vip',
      name: 'All Access (VIP)',
      background: '#FFF4D6',
      text: '#B77900',
    },
    {
      id: 'staff',
      name: 'Staff',
      background: '#EAF8F1',
      text: '#249B62',
    },
    {
      id: 'remise',
      name: 'Remise',
      background: '#FFF6E5',
      text: '#D99000',
    },
    {
      id: 'utility-maintenance',
      name: 'Utility Maintenance',
      background: '#F1EDFF',
      text: '#7257C7',
    },
    {
      id: 'perkasan',
      name: 'Perkasan',
      background: '#EAF7F7',
      text: '#168B8B',
    },
    {
      id: 'office-dku',
      name: 'Office DKU',
      background: '#E8F1FB',
      text: '#3B6EA5',
    },
  ];

  const visitorType = visitorTypeDefaults.find(
    (type) =>
      type.name.toLowerCase() === invitationCode[0]?.visitor_type_name?.trim().toLowerCase(),
  );

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
        <Card elevation={0}>
          <CardContent sx={{ padding: '0px !important' }}>
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {invitationCode[0]?.visitor_name ?? 'Name'}
                  </Typography>

                  {invitationCode?.[0] && (
                    <Tooltip title="Edit Visitor Information" arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={handleOpenEnableEdit}
                        sx={{
                          color: 'white',
                          bgcolor: 'primary.main',
                          borderRadius: 3,
                          p: '7px',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white',
                          },
                        }}
                      >
                        <IconPencil size={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1} mt={1}>
                  {invitationCode[0]?.visitor_type_name?.trim() && (
                    <Chip
                      size="small"
                      label={invitationCode[0].visitor_type_name}
                      sx={{
                        backgroundColor: visitorType?.background ?? '#F5F5F5',
                        color: visitorType?.text ?? '#666',
                        fontWeight: 600,
                      }}
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
                  label="Citizenship ID"
                  value={invitationCode[0]?.visitor_identity_id}
                />
                <InfoRow
                  icon={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconMan size={17} /> /
                      <IconWoman size={17} style={{ marginLeft: -5 }} />
                    </Box>
                  }
                  label="Gender"
                  value={invitationCode[0]?.visitor_gender}
                />

                <InfoRow
                  icon={<IconUser size={18} />}
                  label="Visitor Type"
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
