import { Grid2 as Grid, Card, CardContent, Tooltip, Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  IconCards,
  IconClipboard,
  IconClock,
  IconDoor,
  IconKey,
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
import { usePermission } from 'src/hooks/usePermission';

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
}

const ActionPanelCard: FC<Props> = ({
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
  return (
    <Grid
      size={{ xs: 12, lg: 4.5 }}
      sx={{
        display: 'flex',
        justifyContent: isFullscreen ? 'center' : 'flex-start',
        alignItems: isFullscreen ? 'center' : 'stretch',
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
    </Grid>
  );
};

export default ActionPanelCard;
