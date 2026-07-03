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
  IconCreditCard,
  IconGenderBigender,
  IconPhone,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { IconBuilding, IconMail } from '@tabler/icons-react';

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
  openMore,
  setOpenMore,
  handleOpenMore,
  handleOpenDetailVistingPurpose,
  getColorByName,
  backgroundnodata,
  t,
}: any) => {
  return (
    // <Box
    //   sx={{
    //     display: 'flex',
    //     justifyContent: isFullscreen ? 'center' : 'flex-start',
    //     alignItems: 'start',
    //     gap: '5px',
    //     padding: '20px',
    //     flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' },
    //   }}
    // >
    <Grid
      container
      spacing={2}
      sx={{
        p: 2.5,
        alignItems: 'flex-start',

        // height: '100%',
        // height: '340px',
      }}
    >
      {/* IMAGE */}
      <Grid size={{ xs: 12, xl: 4.5 }}>
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
            py: '0 !important',
            px: { xs: '0', lg: '0px' },
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
              }}
            >
              {LprImage ? (
                <img
                  src={faceImage || LprImage}
                  alt="Visitor"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '300px',
                    maxHeight: lgUp ? '400px' : '300px',
                    objectFit: 'cover',
                    borderRadius: '30px',
                  }}
                />
              ) : (
                <Typography color="text.secondary">No LPR image</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, xl: 7.5 }}>
        <Card
          elevation={0}
          sx={
            {
              //   borderRadius: 3,
              //   border: '1px solid',
              //   borderColor: 'divider',
            }
          }
        >
          <CardContent sx={{ padding: '0px !important' }}>
            <Stack direction="row" spacing={2}>
              {/* <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                  }}
                  src={invitationCode?.photo}
                >
                  {invitationCode?.nama?.charAt(0)}
                </Avatar> */}

              <Box flex={1}>
                <Typography variant="h6" fontWeight={700}>
                  {invitationCode[0]?.visitor_name ?? '-'}
                </Typography>

                {/* <Typography variant="body2" color="text.secondary" mb={1.5}>
                  {invitationCode?.jabatan ?? 'Marketing'}
                </Typography> */}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2} mt={1.5}>
                  <Chip size="small" label="VIP VISITOR" color="secondary" />

                  <Chip size="small" label="FREQUENT VISITOR" color="primary" />

                  <Chip size="small" label="VERIFIED" color="success" />
                </Stack>

                <Divider sx={{ mb: 1 }} />

                <InfoRow
                  icon={<IconBuilding size={18} />}
                  label="Company"
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
                  label="ID / Card No"
                  value={invitationCode[0]?.visitor_identity_id}
                />

                <InfoRow
                  icon={<IconGenderBigender size={18} />}
                  label="Gender"
                  value={invitationCode[0]?.visitor_gender}
                />

                <InfoRow
                  icon={<IconUser size={18} />}
                  label="Role"
                  value={invitationCode[0]?.visitor_role}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default VisitorInformation;
