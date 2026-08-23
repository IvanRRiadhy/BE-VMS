import { Grid2 as Grid, Card, CardContent, CardActions, Button, Box, Tooltip } from '@mui/material';
import { IconLogin, IconLogout, IconForbid2, IconBan } from '@tabler/icons-react';
import VisitorDetailTabs from './VisitorDetailTabs';
import InvitationQrCard from './InvitationQrCard';
import { useState } from 'react';

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
  // const selectedVisitor =
  //   relatedVisitors.find((v: any) => v.visitor_number === invitationCode[0]?.visitor_number) ||
  //   relatedVisitors.find((v: any) => v.visitor_number === selectedVisitorNumber);

  const data = invitationCode?.[0];

  const selectedVisitor =
    relatedVisitors?.find((v: any) => v.visitor_number === selectedVisitorNumber) ||
    relatedVisitors?.find((v: any) => v.visitor_number === data?.visitor_number) ||
    data;

  const status = selectedVisitor?.visitor_status;
  const isHost = selectedVisitor?.is_host;
  const isBlocked = Boolean(selectedVisitor?.is_block);

  const renderActions = () => {
    if (!selectedVisitor) {
      return null;
    }
    if (
      (selectedVisitor.is_praregister_done == null ||
        selectedVisitor.is_praregister_done === false) &&
      !isHost
    ) {
      return (
        <Button variant="contained" size="large" onClick={() => handleView(selectedVisitor.id)}>
          Fill Form
        </Button>
      );
    }

    if (
      selectedVisitor.is_praregister_done == null ||
      selectedVisitor.is_praregister_done === false
    ) {
      return null;
    }

    // =========================
    // BLOCKED
    // =========================
    // PRIORITY PALING TINGGI.
    // Kalau blocked, apapun visitor_status-nya,
    // hanya boleh Unblock.
    if (isBlocked) {
      if (!permissionHook.canBlock) {
        return null;
      }

      return (
        <Button
          variant="contained"
          sx={{ backgroundColor: '#f44336' }}
          onClick={() => handleConfirmStatus('Unblock')}
          startIcon={<IconBan />}
        >
          Unblock
        </Button>
      );
    }

    // =========================
    // CHECKIN
    // =========================
    if (status === 'Checkin') {
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

    // =========================
    // CHECKOUT
    // =========================
    if (status === 'Checkout') {
      if (!permissionHook.canBlock) {
        return null;
      }

      return (
        <Button
          variant="contained"
          sx={{ backgroundColor: '#000' }}
          onClick={() => handleConfirmStatus('Block')}
          startIcon={<IconForbid2 />}
        >
          Block
        </Button>
      );
    }

    // =========================
    // INITIAL / WAITING / OTHER
    // =========================
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
  };
  const [activeTab, setActiveTab] = useState(0);
  const hasData = invitationCode && invitationCode.length > 0;

  return (
    // <Grid
    //   size={{ xs: 12 }}
    //   sx={{
    //     display: 'flex',
    //     flexDirection: 'column',
    //     gap: 1,
    //     height: '100%',

    //   }}
    //   id="tour-visitor-detail"
    // >
    //   <Card
    //     sx={{
    //       flex: 1,
    //       display: 'flex',
    //       flexDirection: 'column',
    //       boxShadow: 'none',
    //       p: 1,

    //       // minHeight: 450,
    //       borderRadius: 2,
    //     }}
    //   >
    <Grid
      size={{ xs: 12 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <Card
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          p: 1,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CardContent
          sx={{
            p: '0px !important',
            minWidth: 0,
            minHeight: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <VisitorDetailTabs
            invitationCode={invitationCode}
            activeVisitor={activeVisitor}
            handleChooseCard={handleChooseCard}
            tabValue={activeTab}
            onTabChange={setActiveTab}
          />
        </CardContent>
        {hasData && activeTab === 0 && (
          <CardActions sx={{ justifyContent: 'center', mt: 1 }}>{renderActions()}</CardActions>
        )}
      </Card>
      <InvitationQrCard invitationCode={invitationCode} activeVisitor={activeVisitor} />
    </Grid>
  );
};

export default VisitorDetailCard;
