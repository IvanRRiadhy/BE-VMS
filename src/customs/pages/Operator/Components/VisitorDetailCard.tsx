import { Grid2 as Grid, Card, CardContent, CardActions, Button, Box, Tooltip } from '@mui/material';
import { IconLogin, IconLogout, IconForbid2, IconBan } from '@tabler/icons-react';
import VisitorDetailTabs from './VisitorDetailTabs';

const VisitorDetailCard = ({
  invitationCode,
  activeVisitor,
  relatedVisitors,
  selectedVisitorNumber,
  permissionHook,
  containerRef,
  handleChooseCard,
  handleConfirmStatus,
  handleView,
}: any) => {
//   if (!invitationCode?.length) return null;

  const selectedVisitor =
    relatedVisitors.find((v: any) => v.visitor_number === invitationCode[0]?.visitor_number) ||
    relatedVisitors.find((v: any) => v.visitor_number === selectedVisitorNumber);

  const data = invitationCode[0];
  const status = data?.visitor_status;
  const isBlocked = !!data?.is_block;

  const renderActions = () => {
    if (
      selectedVisitor &&
      (selectedVisitor.is_praregister_done == null || selectedVisitor.is_praregister_done === false)
    ) {
      return (
        <Button variant="contained" size="large" onClick={() => handleView(selectedVisitor.id)}>
          Fill Form
        </Button>
      );
    }

    if (
      !selectedVisitor ||
      selectedVisitor.is_praregister_done == null ||
      selectedVisitor.is_praregister_done === false
    ) {
      return null;
    }

    if (!['Checkin', 'Checkout', 'Block', 'Unblock'].includes(status || '')) {
      return (
        <Box display="flex" gap={1}>
          {permissionHook.canCheckin && (
            <Button
              variant="contained"
              onClick={() => handleConfirmStatus('Checkin')}
              startIcon={<IconLogin />}
              sx={{ backgroundColor: '#21c45d' }}
            >
              Check In
            </Button>
          )}
          {permissionHook.canBlock && (
            <Button
              variant="contained"
              sx={{ backgroundColor: '#000' }}
              onClick={() => handleConfirmStatus('Block')}
              startIcon={<IconForbid2 />}
            >
              Block
            </Button>
          )}
        </Box>
      );
    }

    if (status === 'Checkin' && !isBlocked) {
      return (
        <Box display="flex" gap={1}>
          {permissionHook.canCheckout && (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleConfirmStatus('Checkout')}
              startIcon={<IconLogout />}
            >
              Check Out
            </Button>
          )}
          {permissionHook.canBlock && (
            <Button
              variant="contained"
              sx={{ backgroundColor: '#000' }}
              onClick={() => handleConfirmStatus('Block')}
              startIcon={<IconForbid2 />}
            >
              Block
            </Button>
          )}
        </Box>
      );
    }

    if (status === 'Checkout' && !isBlocked) {
      return (
        permissionHook.canBlock && (
          <Button
            variant="contained"
            sx={{ backgroundColor: '#000' }}
            onClick={() => handleConfirmStatus('Block')}
            startIcon={<IconForbid2 />}
          >
            Block
          </Button>
        )
      );
    }

    if (isBlocked) {
      return (
        permissionHook.canBlock && (
          <Button
            variant="contained"
            sx={{ backgroundColor: '#f44336' }}
            onClick={() => handleConfirmStatus('Unblock')}
            startIcon={<IconBan />}
          >
            Unblock
          </Button>
        )
      );
    }

    return null;
  };

  return (
    <Grid
      size={{ xs: 12, lg: 4.5 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        p: 1,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
      }}
    >
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          p: 1,
          minHeight: 450,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <VisitorDetailTabs
            invitationCode={invitationCode}
            activeVisitor={activeVisitor}
            handleChooseCard={handleChooseCard}
          />
        </CardContent>

        <CardActions sx={{ justifyContent: 'center', mt: 2 }}>{renderActions()}</CardActions>
      </Card>
    </Grid>
  );
};

export default VisitorDetailCard;
