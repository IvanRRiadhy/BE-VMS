import {
  Grid2 as Grid,
  Card,
  CardContent,
  Tooltip,
  Button,
  Typography,
  Avatar,
  CardActions,
} from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
import {
  IconBan,
  IconCamera,
  IconCar,
  IconCards,
  IconCircleCheckFilled,
  IconCircleFilled,
  IconClipboard,
  IconClock,
  IconDoor,
  IconForbid2,
  IconLogin,
  IconLogout,
  IconMapPinCheck,
  IconParking,
  IconPencil,
  IconPrinter,
  IconQrcode,
  IconUser,
} from '@tabler/icons-react';
import { FC } from 'react';
import VisitorDetailTabs from './VisitorDetailTabs';
import VisitorInformationDetail from './VisitorInformationDetail';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface Props {
  permission: any;
  isFullscreen: boolean;
  handleOpenScanQR: () => void;
  handleActionClick: (type: string) => void;
  handleOpenAction: (type: string) => void;
  handlePrint: () => void;
  handleActionBlacklist: (type: string) => void;
  setOpenPreRegistration: (value: boolean) => void;
  setOpenInvitationVisitor: (value: boolean) => void;
  setOpenReturnCard: (value: boolean) => void;
  invitationCode: any[];
  visitor: any;
  handleChooseCard: () => void;
  permissionHook: any;
  relatedVisitors: any[];
  handleView: (id: string) => void;
  containerRef?: any;
  handleConfirmStatus: (type: any) => void;
  selectedVisitorNumber: any;
}

const ActionPanelView: FC<Props> = ({
  permission,
  isFullscreen,
  handleOpenScanQR,
  handleActionClick,
  handleOpenAction,
  handlePrint,
  handleActionBlacklist,
  setOpenPreRegistration,
  setOpenInvitationVisitor,
  setOpenReturnCard,
  invitationCode,
  visitor,
  handleChooseCard,
  permissionHook,
  relatedVisitors,
  handleView,
  containerRef,
  handleConfirmStatus,
  selectedVisitorNumber,
}) => {
  const {
    canCheckin,
    canCheckout,
    canManageInvite,
    canBlacklist,
    canCardIssuance,
    canVisitorTriggerOpen,
    canParking,
    canExtend,
  } = permission;

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  // const data = invitationCode[0];
  const data = visitor;
  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d',
    Checkout: '#F44336',
    Block: '#000000',
    Deny: '#8B0000',
    Approve: '#21c45d',
    Pracheckin: '#21c45d',
    Preregis: '#a5a5a5ff',
    Waiting: '#4abfd4',
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '#9e9e9e'; // default abu
    return statusBgMap[status] || '#9e9e9e';
  };

  return (
    <Grid
      size={{ xs: 12, lg: 6 }}
      sx={{
        display: 'flex',
        justifyContent: isFullscreen ? 'center' : 'flex-start',
        alignItems: isFullscreen ? 'center' : 'stretch',
        height: '100%', // 🔥 penting
        width: '100%',
      }}
    >
      <Box
        display={'flex'}
        flexDirection={'column'}
        gap={1}
        sx={{
          height: '100%', 
          width: '100%',
        }}
      >
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height: isFullscreen ? '100%' : 'auto',
            //   maxHeight: isFullscreen ? '100%' : 400,
            maxHeight: isFullscreen
              ? { xs: '100%', sm: '100%', lg: '80%', xl: '100%' }
              : { xs: '100%', sm: '100%', xl: '400px' },
            overflow: isFullscreen ? 'auto' : 'visible',
            //   display: 'flex',
            //   flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              p: 1.5,
              paddingBottom: '0px !important',
              px: '5px !important',
              overflow: 'auto',
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, xl: 3 }}>
                <Box
                  display={'flex'}
                  flexDirection={'row'}
                  gap={1}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <IconCircleFilled size={14} stroke={1.5} style={{ color: 'red' }} />
                  <Typography color="red" fontWeight={'600'} variant="body2" mb={1}>
                    LIVE CAPTURE
                  </Typography>
                </Box>
                <Avatar
                  style={{
                    width: '100%',
                    // height: '180px',
                    height: '200px',
                    backgroundColor: '#000',
                    borderRadius: '10px',
                  }}
                  variant="square"
                >
                  <IconCamera size={40} stroke={1.5} style={{ color: '#fff' }} />
                </Avatar>
              </Grid>
              {/* <Grid size={{ xs: 12, md: 6, lg: 7, xl: 7.5 }}> */}
              <Grid size={{ xs: 12, xl: 9 }}>
                <Box>
                  <Box display={'flex'} justifyContent={'space-between'}>
                    <Box>
                      <Typography variant="body1" fontWeight={'600'}>
                        Name
                      </Typography>
                      <Typography variant="h4" fontWeight={'600'}>
                        {data?.name || '-'}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.7 }} mt={1}>
                        National ID : {data?.visitor_identity_id || '-'}
                      </Typography>
                    </Box>
                    <Box textAlign={'end'}>
                      <Typography variant="body1" fontWeight={'600'}>
                        Vehicle Number
                      </Typography>
                      <Typography
                        variant="h5"
                        mb={1}
                        style={{
                          backgroundColor: '#e4dfdfff',
                          borderRadius: '5px',
                          padding: '5px',
                        }}
                      >
                        {data?.vehicle_plate_number || '-'}
                      </Typography>
                      <Typography variant="body1" color="primary" fontWeight={'700'}>
                        {data?.vehicle_type || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display={'flex'} justifyContent={'space-between'} gap={2} mt={1}>
                    <Card
                      sx={{
                        boxShadow: '1px 1px 5px rgba(0,0,0,0.1)',
                        backgroundColor: '#f3f3f3ff',
                        // opacity: 0.8,
                      }}
                    >
                      <CardContent sx={{ padding: 1 }}>
                        <Typography variant="h6">Status</Typography>
                        <Box display={'flex'} gap={1} alignItems={'center'} mt={1}>
                          {data?.visitor_status && (
                            <IconCircleCheckFilled
                              style={{ color: getStatusColor(data?.visitor_status) }}
                            />
                          )}
                          <Typography sx={{ color: getStatusColor(data?.visitor_status) }}>
                            {data?.visitor_status || '-'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    <Card
                      sx={{
                        boxShadow: '1px 1px 5px rgba(0,0,0,0.1)',
                        backgroundColor: '#f3f3f3ff',
                        // opacity: 0.8,
                      }}
                    >
                      <CardContent sx={{ padding: '0px !important' }}>
                        <Typography variant="h6">Visit Start</Typography>
                        <Typography fontWeight={'bold'} mt={1}>
                          {formatDateTime(data?.visitor_period_start) || '-'}
                        </Typography>
                        <Typography variant="h6" mt={1}>
                          Visit End
                        </Typography>
                        <Typography fontWeight={'bold'} mt={1}>
                          {formatDateTime(data?.visitor_period_end) || '-'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Grid>
              {/* <Grid size={{ xs: 12, md: 6, lg: 2.6, xl: 2.5 }}>
                <Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems={{ xs: 'center', lg: 'flex-end' }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ textAlign: { xs: 'center', xl: 'right' } }}
                      fontWeight="600"
                      mb={1}
                    >
                      Plate Capture
                    </Typography>

                    <Avatar
                      sx={{
                        width: 110,
                        height: 80,
                        borderRadius: '10px',
                      }}
                    >
                      <IconCar />
                    </Avatar>
                  </Box>
                </Box>
              </Grid> */}
            </Grid>
          </CardContent>
        </Card>
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height: isFullscreen ? '100%' : 'auto',
            //   maxHeight: isFullscreen ? '100%' : 400,
            maxHeight: isFullscreen
              ? { xs: '100%', sm: '100%', lg: '80%', xl: '100%' }
              : { xs: '100%', sm: '100%', xl: '400px' },
            overflow: isFullscreen ? 'auto' : 'visible',
            //   display: 'flex',
            //   flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              p: 2,
              px: '5px !important',
              overflow: 'auto',
            }}
          >
            <Grid container spacing={1}>
              <Grid
                size={{ xs: 12, xl: 7 }}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Tooltip
                  title="Scan QR to search data visitor"
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: '1rem',
                        padding: '8px 14px',
                      },
                    },
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<IconQrcode size={25} />}
                    onClick={handleOpenScanQR}
                    size="large"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      boxShadow: '0 2px 6px rgba(93, 135, 255, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4169E1 0%, #3657D6 100%)',
                      },
                      zIndex: 999,
                      width: '100%',
                      height: '55px',
                      p: 0,
                    }}
                  >
                    <Typography variant="h5" color="white">
                      Scan
                    </Typography>
                  </Button>
                </Tooltip>

                {canManageInvite && (
                  <Box display={'flex'} mt={0.5} gap={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconClipboard size={25} />}
                      onClick={() => setOpenPreRegistration(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,

                        // boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                        zIndex: 999,
                        width: '100%',
                        height: '50px',
                        p: 0,
                        backgroundColor: '#',
                      }}
                    >
                      <Typography variant="h6" color="white">
                        Pra Register
                      </Typography>
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconUser size={25} />}
                      onClick={() => setOpenInvitationVisitor(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        // boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                        zIndex: 999,
                        width: '100%',
                        height: '50px',
                        p: 0,
                      }}
                    >
                      <Typography variant="h6" color="white">
                        Invitation
                      </Typography>
                    </Button>
                  </Box>
                )}

                <Grid container spacing={isFullscreen ? 1 : 1.5}>
                  {/* Checkin */}
                  {canCheckin && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconLogin size={25} />}
                        onClick={() => handleActionClick('Checkin')}
                        // color="success"
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,

                          boxShadow: '0 2px 6px rgba(0, 200, 83, 0.4)',
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                          backgroundColor: '#22C55E',
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Checkin
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                  {canCheckout && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconLogout size={25} />}
                        onClick={() => handleActionClick('Checkout')}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          background: 'linear-gradient(135deg, #FF5252 0%, #D50000 100%)',
                          boxShadow: '0 2px 6px rgba(255, 82, 82, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #D50000 0%, #B71C1C 100%)',
                          },
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Checkout
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                  {/* Card */}
                  {canCardIssuance && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconCards size={28} />}
                        onClick={() => handleOpenAction('card')}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,

                          px: '10px !important',
                          background: 'linear-gradient(135deg, #AB47BC 0%, #6A1B9A 100%)',
                          boxShadow: '0 2px 6px rgba(171, 71, 188, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8E24AA 0%, #4A148C 100%)',
                          },
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Card Issuance
                        </Typography>
                      </Button>
                    </Grid>
                  )}

                  {canCardIssuance && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconCards size={28} />}
                        onClick={() => setOpenReturnCard(true)}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: '10px !important',

                          background: 'linear-gradient(135deg, #1E88E5 0%, #3949AB 100%)',
                          boxShadow: '0 2px 6px rgba(171, 71, 188, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1E88E5 0%, #3949AB 100%)',
                          },
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Card Return
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, xl: 5 }}>
                <Grid container spacing={isFullscreen ? 1.5 : 1.5}>
                  {/* Access */}
                  {/* <Grid size={{ xs: 6, lg: 6 }}>
                  <Button
                    variant="contained"
                    startIcon={<IconKey size={25} />}
                    onClick={() => handleOpenAction('access')}
                    size="large"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      boxShadow: '0 2px 6px rgba(255, 152, 0, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FB8C00 0%, #E65100 100%)',
                      },
                      zIndex: 999,
                      width: '100%',
                      height: '50px',
                      p: 0,
                    }}
                  >
                    <Typography variant="h6" color="white">
                      Access
                    </Typography>
                  </Button>
                </Grid> */}

                  {/* Parking */}
                  {canParking && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconParking size={25} />}
                        onClick={() => handleOpenAction('parking')}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          background: '#00ACC1',
                          boxShadow: '0 2px 6px rgba(0, 172, 193, 0.4)',
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Parking
                        </Typography>
                      </Button>
                    </Grid>
                  )}

                  {/* Report */}
                  {canVisitorTriggerOpen && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconDoor size={25} />}
                        // onClick={handleOpenTriggeredAccess}
                        onClick={() => handleOpenAction('open')}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          background: 'brown',
                          boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                          '&:hover': {
                            background: 'brown',
                          },
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Open
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                  {canExtend && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconClock size={25} />}
                        onClick={() => handleOpenAction('extend')}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                          background: 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Extend
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                  <Grid size={{ xs: 6, lg: 6 }}>
                    <Button
                      variant="contained"
                      startIcon={<IconMapPinCheck size={25} />}
                      onClick={handleOpenScanQR}
                      size="large"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                        zIndex: 999,
                        width: '100%',
                        height: '50px',
                        p: 0,
                        backgroundColor: '#10B981',
                      }}
                    >
                      <Typography variant="h6" color="white">
                        Arrival
                      </Typography>
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6, lg: 6 }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        background: '#5f5f5f',
                        '&:hover': { backgroundColor: '#5f5f5f' },
                        marginLeft: 0,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        zIndex: 999,
                        width: '100%',
                        height: '50px',
                      }}
                      onClick={handlePrint}
                      startIcon={<IconPrinter size={25} />}
                    >
                      Print
                    </Button>
                  </Grid>
                  {canBlacklist && (
                    <Grid size={{ xs: 6, lg: 6 }}>
                      <Button
                        variant="contained"
                        startIcon={<IconUser size={25} />}
                        // onClick={handleOpenScanQR}
                        onClick={() => handleActionBlacklist('blacklist')}
                        size="large"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          boxShadow: '0 2px 6px rgba(96, 125, 139, 0.4)',
                          zIndex: 999,
                          width: '100%',
                          height: '50px',
                          p: 0,
                          backgroundColor: '#000',
                        }}
                      >
                        <Typography variant="h6" color="white">
                          Blacklist
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                  <Grid size={{ xs: 6, lg: 6 }}>
                    <Button
                      variant="contained"
                      startIcon={<IconPencil size={25} />}
                      // onClick={handleOpenScanQR}
                      // onClick={() => handleActionBlacklist('blacklist')}
                      onClick={() => handleOpenAction('enable')}
                      size="large"
                      sx={{
                        // background: '#5f5f5f',
                        // '&:hover': { backgroundColor: '#5f5f5f' },
                        marginLeft: 0,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        zIndex: 999,
                        width: '100%',
                        height: '50px',
                      }}
                    >
                      <Typography variant="h6" color="white">
                        Enable Edit
                      </Typography>
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6, lg: 6 }}>
                    <Button
                      variant="contained"
                      startIcon={<IconPencil size={25} />}
                      onClick={() => handleOpenAction('edit')}
                      size="large"
                      sx={{
                        // background: '#5f5f5f',
                        // '&:hover': { backgroundColor: '#5f5f5f' },
                        marginLeft: 0,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        zIndex: 999,
                        width: '100%',
                        height: '50px',
                      }}
                    >
                      <Typography variant="h6" color="white">
                        Edit Form
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ paddingTop: '10px !important', paddingBottom: '10px !important' }}>
            <VisitorInformationDetail
              invitationCode={invitationCode}
              visitor={visitor}
              handleChooseCard={handleChooseCard}
            />
          </CardContent>
          {invitationCode.length > 0 && invitationCode[0]?.visitor_number && (
            <>
              <CardActions sx={{ justifyContent: 'center', mt: 0, flexWrap: 'wrap', gap: 1 }}>
                {(() => {
                  const selectedVisitor =
                    relatedVisitors.find(
                      (v) => v.visitor_number === invitationCode[0]?.visitor_number,
                    ) || relatedVisitors.find((v) => v.visitor_number === selectedVisitorNumber);
                  if (
                    selectedVisitor &&
                    (selectedVisitor.is_praregister_done == null ||
                      selectedVisitor.is_praregister_done === false)
                  ) {
                    return (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => handleView(selectedVisitor.id)}
                      >
                        Fill Form
                      </Button>
                    );
                  }

                  const data = invitationCode[0];
                  const status = data?.visitor_status;
                  const isBlocked = !!data?.is_block;

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
                          <Tooltip
                            title="Check In"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              // color="#21c45d"
                              size="large"
                              onClick={() => handleConfirmStatus('Checkin')}
                              startIcon={<IconLogin />}
                              sx={{ backgroundColor: '#21c45d' }}
                            >
                              Check In
                            </Button>
                          </Tooltip>
                        )}
                        {permissionHook.canBlock && (
                          <Tooltip
                            title="Block"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => handleConfirmStatus('Block')}
                              startIcon={<IconForbid2 />}
                            >
                              Block
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  }

                  if (status === 'Checkin' && !isBlocked) {
                    return (
                      <Box display="flex" gap={1}>
                        {permissionHook.canCheckout && (
                          <Tooltip
                            title="Check Out"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              color="error"
                              size="large"
                              onClick={() => handleConfirmStatus('Checkout')}
                              startIcon={<IconLogout />}
                            >
                              Check Out
                            </Button>
                          </Tooltip>
                        )}
                        {permissionHook.canBlock && (
                          <Tooltip
                            title="Block"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => handleConfirmStatus('Block')}
                              startIcon={<IconForbid2 />}
                            >
                              Block
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  }
                  if (status === 'Checkout' && !isBlocked) {
                    return (
                      <Box display="flex" gap={1}>
                        {permissionHook.canBlock && (
                          <Tooltip
                            title="Block Visitor"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              sx={{ backgroundColor: '#000' }}
                              onClick={() => handleConfirmStatus('Block')}
                              startIcon={<IconForbid2 />}
                            >
                              Block
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  }

                  if (isBlocked) {
                    return (
                      <>
                        {permissionHook.canBlock && (
                          <Tooltip
                            title="Unblock"
                            placement="top"
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  fontSize: '1rem',
                                  padding: '8px 14px',
                                },
                              },
                              popper: {
                                container: containerRef.current,
                              },
                            }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              sx={{
                                backgroundColor: '#f44336',
                                '&:hover': { backgroundColor: '#d32f2f' },
                              }}
                              onClick={() => handleConfirmStatus('Unblock')}
                              startIcon={<IconBan />}
                            >
                              Unblock
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    );
                  }

                  return null;
                })()}
              </CardActions>
            </>
          )}
        </Card>
      </Box>
    </Grid>
  );
};

export default ActionPanelView;
