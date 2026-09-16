import { Box, Typography } from '@mui/material';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import QRCode from 'react-qr-code';

interface AccessPassPdfProps {
  accessPass: any;
  logoSrc: string;
}

const AccessPassPdf = ({ accessPass, logoSrc }: AccessPassPdfProps) => {
  const parkingSlot = accessPass?.parking_slot;

  const isParkingAvailable = parkingSlot && parkingSlot !== '-' && parkingSlot !== 'Not available';

  return (
    <Box
      sx={{
        position: 'relative',
        width: 380,
        height: 600,
        boxSizing: 'border-box',
        overflow: 'hidden',

        backgroundColor: '#FFFFFF',
        borderRadius: '24px',

        px: 3,
        pt: 4,
        pb: 3,

        textAlign: 'center',

        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#172B4D',
      }}
    >
      {/* =====================================================
          TOP LEFT DECORATION
      ====================================================== */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 115,
          height: 105,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 155,
            height: 80,
            top: -42,
            left: -45,

            backgroundColor: '#1976C9',

            transform: 'rotate(-28deg)',
            borderRadius: '0 0 70px 0',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 150,
            height: 45,
            top: 15,
            left: -65,

            backgroundColor: '#E8F2FC',

            transform: 'rotate(-28deg)',
            borderRadius: '0 0 50px 0',
          }}
        />
      </Box> */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 115,
          height: 105,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* LIGHT BLUE — di bawah */}
        <Box
          sx={{
            position: 'absolute',
            width: 150,
            height: 45,
            top: 5,
            left: -40,

            backgroundColor: '#E8F2FC',

            transform: 'rotate(-28deg)',
            borderRadius: '0 0 50px 0',

            zIndex: 1,
          }}
        />

        {/* DARK BLUE — di atas */}
        <Box
          sx={{
            position: 'absolute',
            width: 155,
            height: 80,
            top: -42,
            left: -45,

            backgroundColor: '#1976C9',

            transform: 'rotate(-28deg)',
            borderRadius: '0 0 70px 0',

            zIndex: 2,
          }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 120,
          height: 100,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 160,
            height: 65,
            right: -55,
            bottom: -35,

            backgroundColor: '#1976C9',

            transform: 'rotate(-28deg)',
            borderRadius: '70px 0 0 0',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 145,
            height: 42,
            right: -45,
            bottom: 5,

            backgroundColor: '#E8F2FC',

            transform: 'rotate(-28deg)',
            borderRadius: '60px 0 0 0',
          }}
        />
      </Box>
      {/* =====================================================
          HEADER
      ====================================================== */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',

          mb: 2.5,
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt="Bank Indonesia"
          sx={{
            width: 78,
            height: 78,
            objectFit: 'contain',
            mb: 1.2,
          }}
        />

        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 3,
            color: '#16365C',
            lineHeight: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Bank Indonesia
        </Typography>
      </Box>
      {/* =====================================================
          QR CODE
      ====================================================== */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,

          display: 'flex',
          justifyContent: 'center',

          mb: 2.5,
        }}
      >
        <Box
          sx={{
            width: 190,
            height: 190,

            p: 2,

            boxSizing: 'border-box',

            backgroundColor: '#FFFFFF',

            border: '2px solid #E3EDF9',
            borderRadius: '20px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <QRCode
            value={String(accessPass?.visitor_number ?? '')}
            size={158}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </Box>
      </Box>
      {/* =====================================================
          INVITATION CODE LABEL
      ====================================================== */}
      <Typography
        sx={{
          position: 'relative',
          zIndex: 2,

          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2.5,

          color: '#718096',

          textTransform: 'uppercase',

          mb: 0.8,
        }}
      >
        Invitation Code
      </Typography>
      {/* =====================================================
          INVITATION CODE BOX
      ====================================================== */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,

          width: '100%',
          minHeight: 58,

          px: 2,

          boxSizing: 'border-box',

          backgroundColor: '#F1F6FD',

          borderRadius: '16px',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          mb: 2.7,
        }}
      >
        <Typography
          sx={{
            fontSize: 21,
            fontWeight: 700,

            letterSpacing: 2,

            color: '#172F50',

            lineHeight: 1.2,

            wordBreak: 'break-word',
          }}
        >
          {accessPass?.invitation_code || '-'}
        </Typography>
      </Box>
      {/* =====================================================
          DIVIDER
      ====================================================== */}
      {/* =====================================================
    PARKING SLOT
====================================================== */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,

          width: '100%',
          height: 105,

          boxSizing: 'border-box',

          backgroundColor: isParkingAvailable ? '#F0FAF4' : '#FFF4F4',

          borderRadius: '18px',

          overflow: 'hidden',
        }}
      >
        {/* ================= ICON ================= */}
        <Box
          sx={{
            position: 'absolute',

            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',

            width: 60,
            height: 60,

            borderRadius: '50%',

            backgroundColor: isParkingAvailable ? '#D6F4E1' : '#FFE2E2',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DirectionsCarRoundedIcon
            sx={{
              fontSize: 34,
              color: isParkingAvailable ? '#16834B' : '#C43838',
            }}
          />
        </Box>

        {/* ================= VERTICAL DIVIDER ================= */}
        <Box
          sx={{
            position: 'absolute',

            left: 94,
            top: '50%',
            transform: 'translateY(-50%)',

            width: '1px',
            height: 55,

            backgroundColor: isParkingAvailable ? '#C9E5D4' : '#F0CCCC',
          }}
        />

        {/* ================= PARKING TEXT ================= */}
        <Box
          sx={{
            position: 'absolute',

            left: 112,
            right: 14,

            top: '50%',
            transform: 'translateY(-50%)',

            minWidth: 0,

            textAlign: 'left',
          }}
        >
          <Typography
            component="div"
            sx={{
              fontSize: 10,
              fontWeight: 700,

              letterSpacing: 1.8,

              color: '#77879A',

              textTransform: 'uppercase',

              lineHeight: 1.4,

              mb: 0.5,

              whiteSpace: 'nowrap',
            }}
          >
            Parking Slot
          </Typography>

          <Typography
            component="div"
            sx={{
              fontSize: isParkingAvailable ? 34 : 18,

              lineHeight: 1.1,

              fontWeight: 700,

              color: isParkingAvailable ? '#16834B' : '#C43838',

              whiteSpace: 'nowrap',
            }}
          >
            {isParkingAvailable ? String(parkingSlot) : 'Not available'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AccessPassPdf;
