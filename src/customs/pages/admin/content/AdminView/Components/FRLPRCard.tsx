import { Box, Card, CardActions, CardContent, Typography } from '@mui/material';

interface VisitorCompareCardProps {
  frImage?: string;
  lprImage?: string;
  visitorName?: string;
  isFullscreen?: boolean;
}

const FRLPRCard = ({
  frImage,
  lprImage,
  visitorName,
  isFullscreen = false,
}: VisitorCompareCardProps) => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
        maxHeight: isFullscreen ? '50vh' : { xs: '100%', sm: '100%', xl: '400px' },
        border: '1px solid #e0e0e0',
      }}
    >
      <CardContent
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          flexDirection: { xs: 'row', md: 'row', lg: 'row', xl: 'row' },
          maxHeight: isFullscreen ? '100%' : { xs: '100%', xl: '300px' },
          overflow: 'hidden',
        }}
      >
        {/* FR Image */}
        {/* <Box
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
          {frImage ? (
            <img
              src={frImage}
              alt="FR"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '15px',
              }}
            />
          ) : (
            <Typography color="text.secondary">No FR image</Typography>
          )}
        </Box> */}

        {/* LPR Image */}
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
          {lprImage ? (
            <img
              src={lprImage}
              alt="LPR"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '15px',
              }}
            />
          ) : (
            <Typography color="text.secondary">No LPR image</Typography>
          )}
        </Box>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: 'center',
          borderTop: '1px solid #eee',
          py: 1,
          mt: 1,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
          {visitorName || 'No visitor data found. Please scan QR first.'}
        </Typography>
      </CardActions>
    </Card>
  );
};

export default FRLPRCard;
