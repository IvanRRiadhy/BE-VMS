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

import { Box, Button, Card, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import {
  IconCar,
  IconCards,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconDownload,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import dayjs from 'dayjs';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useState } from 'react';

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
  accessPass?: any | null;
  onOpenAccess: () => void;
  onDownload: () => void;
  onInsertInvitationCode: () => void;
  onOpenParking?: () => void;
  isParkingLoading?: boolean;
  activePassIndex?: number;
  totalPass?: number;
  onPreviousPass?: () => void;
  onNextPass?: () => void;
  onSelectPass?: (index: number) => void;
};

const GuestAccessPass = ({
  accessPass,
  onOpenAccess,
  onDownload,
  onInsertInvitationCode,
  onOpenParking,
  isParkingLoading = false,
  activePassIndex = 0,
  totalPass = 0,
  onPreviousPass,
  onNextPass,
  onSelectPass,
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

  const [copied, setCopied] = useState(false);

  const handleCopyInvitationCode = async () => {
    const text = accessPass?.invitation_code;

    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy invitation code:', error);
    }
  };

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

  return (
    <Card
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 2,
        // overflow: 'hidden',
        overflow: 'visible',
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
              Invitation Code
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
              }}
            >
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  fontSize: '0.9rem',
                  wordBreak: 'break-word',
                }}
              >
                {accessPass.invitation_code ?? '-'}
              </Typography>

              {accessPass.invitation_code && (
                <Tooltip title={copied ? 'Copied!' : 'Copy invitation code'} arrow>
                  <Box
                    component="button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCopyInvitationCode();
                    }}
                    sx={{
                      border: 0,
                      background: 'transparent',
                      p: 0.3,
                      m: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'primary.main',
                      borderRadius: 1,

                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <IconCopy size={15} />
                  </Box>
                </Tooltip>
              )}
            </Box>
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

        {/* PAGINATION */}
        {/* PAGINATION */}
        {totalPass > 1 && (
          <Box
            className="no-print"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 3,
              gap: 0.5,
            }}
          >
            {/* NAVIGATION + DOTS */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* PREVIOUS */}
              <IconButton
                size="small"
                onClick={onPreviousPass}
                sx={{
                  position: 'absolute',
                  left: 0,
                  width: 36,
                  height: 36,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'primary.main',
                  color: 'white',

                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <IconChevronLeft size={20} />
              </IconButton>

              {/* DOTS */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                {Array.from({ length: totalPass }).map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => onSelectPass?.(index)}
                    sx={{
                      width: index === activePassIndex ? 18 : 10,
                      height: 10,
                      borderRadius: 5,
                      cursor: 'pointer',

                      backgroundColor:
                        index === activePassIndex ? 'primary.main' : 'action.disabled',

                      transition: 'all 0.2s ease',

                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  />
                ))}
              </Box>

              {/* NEXT */}
              <IconButton
                size="small"
                onClick={onNextPass}
                sx={{
                  position: 'absolute',
                  right: 0,
                  width: 36,
                  height: 36,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'primary.main',
                  color: 'white',

                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <IconChevronRight size={20} />
              </IconButton>
            </Box>

            {/* NUMBER */}
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {activePassIndex + 1} of {totalPass}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default GuestAccessPass;
