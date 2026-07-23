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
  const selectedVisitor =
    relatedVisitors.find((v: any) => v.visitor_number === invitationCode[0]?.visitor_number) ||
    relatedVisitors.find((v: any) => v.visitor_number === selectedVisitorNumber);

  const data = invitationCode[0];
  const status = data?.visitor_status;
  const isHost = data?.is_host;
  const isBlocked = !!data?.is_block;

  const renderActions = () => {
    if (
      selectedVisitor &&
      (
        selectedVisitor.is_praregister_done == null ||
        selectedVisitor.is_praregister_done === false
      ) &&
      !isHost
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

    if (!['Checkin', 'Checkout', 'Block', 'Unblock', 'Denied'].includes(status || '')) {
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

  const [activeTab, setActiveTab] = useState(0);
  const hasData = invitationCode && invitationCode.length > 0;

  return (
    <Grid
      size={{ xs: 12 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
      }}
      id="tour-visitor-detail"
    >
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
          p: 1,

          // minHeight: 450,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: '0px !important' }}>
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
