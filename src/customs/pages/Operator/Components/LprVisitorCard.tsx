import { Box, Card, CardContent, Typography, Stack, Button } from '@mui/material';
import VisitingPurposeDialog from '../Dialog/VisitingPurposeDialog';

const LprVisitorCard = ({
  LprImage,
  todayVisitingPurpose,
  invitationCode,
  isFullscreen,
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
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isFullscreen ? 'center' : 'flex-start',
          alignItems: 'start',
          gap: '5px',
          padding: '20px',
          flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' },
        }}
      >
        {/* LPR IMAGE */}
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
            px: { xs: '0', lg: '10px' },
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
                  src={LprImage}
                  alt="LPR"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '300px',
                    maxHeight: lgUp ? '400px' : '300px',
                    objectFit: 'cover',
                    borderRadius: '15px',
                  }}
                />
              ) : (
                <Typography color="text.secondary">No LPR image</Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* VISITING PURPOSE */}
        {todayVisitingPurpose.length === 0 ? (
          <Card
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
              textAlign: 'center',
              maxHeight: isFullscreen ? '100%' : { xs: '100%', xl: '300px' },
              height: { xs: '100%', sm: '100%', xl: '290px' },
              minHeight: { xs: '100%', sm: '300px', xl: '300px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CardContent>
              <img src={backgroundnodata} alt="No Data" height="100" width="100%" />
              <Typography variant="h5" fontWeight={600} color="text.secondary" mt={3}>
                {t('no_visit_today')}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2} sx={{ flex: 1 }}>
            {todayVisitingPurpose.slice(0, 5).map((item: any) => (
              <Card
                key={item.id}
                onClick={() => handleOpenDetailVistingPurpose(item)}
                sx={{
                  flex: 1,
                  height: 'auto',
                  minHeight: 0,
                  p: 0,
                  borderRadius: 1,
                  background: getColorByName(item.name),
                  boxShadow: '0 6px 14px rgba(93, 135, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 18px rgba(93, 135, 255, 0.45)',
                  },
                  cursor: 'pointer',
                  mb: 0,
                }}
              >
                <CardContent
                  sx={{
                    px: 2,
                    paddingTop: '0 !important',
                    paddingBottom: '0 !important',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '50px',
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {item.name}
                  </Typography>

                  <Typography variant="h5" fontWeight="bold" color="white">
                    {item.count}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {todayVisitingPurpose.length > 5 && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenMore}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Show All
              </Button>
            )}

            <VisitingPurposeDialog
              open={openMore}
              onClose={() => setOpenMore(false)}
              data={todayVisitingPurpose}
            />
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          justifyContent: 'center',
          borderTop: '1px solid #eee',
          py: 1,
          mt: 0,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
          {invitationCode[0]?.visitor?.name || 'No visitor data found. Please scan QR first.'}
        </Typography>
      </Box>
    </>
  );
};

export default LprVisitorCard;
