// import { Box, Button, Card, Typography } from '@mui/material';
// import { IconCards } from '@tabler/icons-react';
// import { useTranslation } from 'react-i18next';
// import QRCode from 'react-qr-code';

// type GuestAccessPassProps = {
//   accessPass?: {
//     visitor_number?: string;
//   } | null;
//   onOpenAccess: () => void;
//   onInsertInvitationCode: () => void;
// };

// const GuestAccessPass = ({
//   accessPass,
//   onOpenAccess,
//   onInsertInvitationCode,
// }: GuestAccessPassProps) => {
//   const { t } = useTranslation();
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//       }}
//     >
//       <Card
//         sx={{
//           flex: 1,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           flexDirection: 'column',
//           cursor: 'pointer',
//           gap: 1,
//         }}
//         onClick={onOpenAccess}
//       >
//         {accessPass ? (
//           <>
//             <Typography variant="h5">Access Pass</Typography>

//             <Box
//               sx={{
//                 p: 1,
//                 backgroundColor: '#fff',
//                 borderRadius: 2,
//                 boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <QRCode
//                 value={String(accessPass.visitor_number ?? '')}
//                 size={50}
//                 style={{
//                   width: '150px',
//                   height: 'auto',
//                 }}
//               />
//             </Box>

//             <Typography variant="body1" fontWeight={600} color="primary">
//               {t('tapShowDetail')}
//             </Typography>
//           </>
//         ) : (
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexDirection: 'column',
//               height: '100%',
//             }}
//           >
//             <IconCards size={40} />

//             <Typography
//               variant="body1"
//               color="text.secondary"
//               fontStyle="italic"
//               textAlign="center"
//               mt={1}
//             >
//               {t('noAccessPass')}
//             </Typography>
//           </Box>
//         )}
//       </Card>
// {/*
//       <Button variant="contained" sx={{ mt: 1 }} onClick={onInsertInvitationCode}>
//         {t('insertInvitationCode')}
//       </Button> */}
//     </Box>
//   );
// };

// export default GuestAccessPass;

import { Box, Button, Card, Divider, Tooltip, Typography } from '@mui/material';
import { IconCar, IconCards, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import dayjs from 'dayjs';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

type GuestAccessPassData = {
  id?: string;
  visitor_number?: string;

  invitation_code?: string;
  group_name?: string;
  host_name?: string;
  transaction_status?: string;
  status?: string;
  building_name?: string;
  building?: string;

  visitor_period_start?: string;
  visitor_period_end?: string;

  parking_area?: string;
  parking_slot?: string;
  vehicle_plate?: string;
  vehicle_type?: string;
};

type GuestAccessPassProps = {
  accessPass?: GuestAccessPassData | null;
  onOpenAccess: () => void;
  onDownload: () => void;
  onInsertInvitationCode: () => void;
  onOpenParking?: () => void;
  isParkingLoading?: boolean;
};

const GuestAccessPass = ({
  accessPass,
  onOpenAccess,
  onDownload,
  onInsertInvitationCode,
  onOpenParking,
  isParkingLoading = false,
}: GuestAccessPassProps) => {
  const { t } = useTranslation();

  const Field = ({
    label,
    value,
    children,
  }: {
    label: string;
    value?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 0.3,
          fontSize: {
            xs: '0.75rem',
            sm: '0.8rem',
          },
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={600}
        sx={{
          lineHeight: 1.35,
          fontSize: {
            xs: '0.8rem',
            sm: '0.9rem',
          },
          wordBreak: 'break-word',
        }}
      >
        {children ?? value ?? '-'}
      </Typography>
    </Box>
  );

  if (!accessPass) {
    return (
      <Card
        sx={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <IconCards size={42} />

        <Typography variant="body1" color="text.secondary" fontStyle="italic" textAlign="center">
          {t('noAccessPass')}
        </Typography>

        <Button variant="contained" onClick={onInsertInvitationCode} sx={{ mt: 1 }}>
          {t('insertInvitationCode')}
        </Button>
      </Card>
    );
  }

  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d',
    Checkout: '#F44336',
    Block: '#000000',
    Deny: '#8B0000',
    Approve: '#21c45d',
    Pracheckin: '#21c45d',
    Preregis: '#a5a5a5ff',
    Waiting: '#4abfd4',
    Available: 'gray',
  };

  const statusLabelMap: Record<string, string> = {
    Checkin: 'Check In',
    Checkout: 'Check Out',
    Block: 'Block',
    Deny: 'Deny',
    Approve: 'Approve',
    Pracheckin: 'Precheckin',
    Preregis: 'Preregis',
    Waiting: 'Waiting',
    Available: 'Available',
  };

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* ================================
          DIGITAL ACCESS PASS
      ================================= */}
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          pt: {
            xs: 2,
            sm: 2.5,
          },
          pb: 2.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <Box
            component="img"
            src="/src/assets/images/logos/BI_Logo.png"
            alt="Bank Indonesia"
            sx={{
              width: 70,
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>
        {/* Title */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: {
              xs: 2,
              sm: 2.5,
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            textAlign="center"
            sx={{
              fontSize: {
                xs: '1.1rem',
                sm: '1.25rem',
              },
            }}
          >
            Visitor Code
          </Typography>

          <Tooltip title="Download Visitor Code" arrow>
            <Button
              className="no-print"
              variant="contained"
              onClick={(event) => {
                event.stopPropagation();
                onDownload();
              }}
              sx={{
                position: 'absolute',
                right: 0,
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: 1.5,
              }}
            >
              <IconDownload size={19} />
            </Button>
          </Tooltip>
        </Box>
        {/* ================================
            MAIN ACCESS PASS CONTENT
        ================================= */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 180px 1fr',
            },
            gap: {
              xs: 2.5,
              sm: 3,
            },
            alignItems: 'center',
          }}
        >
          {/* LEFT */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: {
                xs: 1.5,
                sm: 2,
              },
              order: {
                xs: 1,
                sm: 0,
              },
            }}
          >
            <Field label="Invitation Code" value={accessPass.invitation_code} />
            <Field label="Agenda" value={accessPass.agenda} />

            <Field label="Host Name" value={accessPass.host_name} />

            <Field label="Visit Start">{formatDateTime(accessPass.visitor_period_start)}</Field>

            <Field label="Visit End">{formatDateTime(accessPass.visitor_period_end)}</Field>
          </Box>

          {/* QR CODE */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              order: {
                xs: 0,
                sm: 1,
              },
            }}
          >
            <Box
              sx={{
                p: 1,
                backgroundColor: '#fff',
                borderRadius: 1.5,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCode value={String(accessPass.visitor_number ?? '')} size={150} />
            </Box>

            <Typography
              variant="body2"
              color="primary"
              fontWeight={500}
              textAlign="center"
              sx={{
                mt: 1,
                fontSize: '0.8rem',
              }}
            >
              Show this while visiting
            </Typography>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              ID: {accessPass.visitor_number ?? '-'}
            </Typography>
          </Box>

          {/* RIGHT */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',

              gap: {
                xs: 1.5,
                sm: 2,
              },
              order: {
                xs: 2,
                sm: 2,
              },
            }}
          >
            <Field label="Visitor Number" value={accessPass.visitor_number} />
            <Field label="Group Name" value={accessPass.group_name} />

            <Field label="Status">
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 2,
                  fontSize: {
                    xs: '0.75rem',
                    sm: '0.8rem',
                  },
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: statusBgMap[accessPass?.visitor_status] ?? '#9e9e9e',
                }}
              >
                {statusLabelMap[accessPass?.visitor_status] ?? accessPass?.visitor_status ?? '-'}
              </Box>
            </Field>

            <Field label="Site" value={accessPass.site_place_name ?? '-'} />
          </Box>
        </Box>

        {/* ================================
            DIVIDER
        ================================= */}
        <Divider
          sx={{
            my: {
              xs: 2,
              sm: 2.5,
            },
          }}
        />

        {/* ================================
            PARKING & FACILITIES
        ================================= */}
        <Typography
          variant="h6"
          fontWeight={700}
          textAlign="center"
          sx={{
            mb: 2,
            fontSize: {
              xs: '1rem',
              sm: '1.05rem',
            },
          }}
        >
          Parking & Facilities
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: 'repeat(2, 1fr)',
            },
            gap: {
              xs: 2,
              sm: 3,
            },
            textAlign: 'center',
            textTransform: 'capitalize',
          }}
        >
          <Field label="Parking Area" value={accessPass.parking_area} />

          <Field label="Parking Slot" value={accessPass.parking_slot} />

          <Field label="Vehicle Plate" value={accessPass.vehicle_plate_number} />

          <Field label="Vehicle Type" value={accessPass.vehicle_type} />
        </Box>

        {/* ================================
            PARKING BUTTON
        ================================= */}
        <Button
          fullWidth
          className="no-print"
          variant="contained"
          startIcon={<IconCar size={18} />}
          disabled={
            isParkingLoading ||
            !accessPass.can_parking ||
            !accessPass.vehicle_type ||
            !accessPass.vehicle_plate_number
          }
          onClick={(event) => {
            event.stopPropagation();
            onOpenParking?.();
          }}
          sx={{
            mt: 2.5,
            height: 38,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
          }}
        >
          {isParkingLoading ? 'Opening...' : 'Open Parking Blocker'}
        </Button>
      </Box>
    </Card>
  );
};

export default GuestAccessPass;
