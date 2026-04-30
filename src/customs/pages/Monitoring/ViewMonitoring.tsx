import {
  Button,
  MenuItem,
  Tooltip,
  Typography,
  Grid2 as Grid,
  InputAdornment,
  Select,
  Grid2,
  IconButton,
  Switch,
  useMediaQuery,
} from '@mui/material';
import { Box, useTheme } from '@mui/system';
import {
  IconAlertTriangleFilled,
  IconBan,
  IconBell,
  IconCategory,
  IconChartLine,
  IconCheck,
  IconListTree,
  IconMenu,
  IconPencil,
  IconRefresh,
  IconScan,
  IconSearch,
  IconSettings,
  IconTrash,
  IconUserFilled,
  IconX,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import FRImage from 'src/assets/images/products/pic_fr.png';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ScanQrVisitorDialog from '../Operator/Dialog/ScanQrVisitorDialog';
import { getInvitationCode, getInvitationOperatorRelated } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useDebounce } from 'src/hooks/useDebounce';

interface Props {
  loading: boolean;
  onOpenFilter: () => void;
  onRefresh: () => void;
}

type Mode = 'viewer' | 'config';
type Layout = 1 | 2;

const CARD_HEIGHT = 420;

const ViewMonitoring: React.FC<Props> = ({ loading, onOpenFilter, onRefresh }: any) => {
  const [mode, setMode] = useState<Mode>('viewer');
  const [layout, setLayout] = useState<Layout>(1);
  const loadings = loading;
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const cardCount = 10;
  const gridSize = { xs: 12, sm: 6, md: 4, lg: 2.3 };

  const agents = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: `Agent ${i + 1}`,
  }));

  const statuses = ['Passed', 'Blacklisted', 'Rejected'];

  const dataCards = Array.from({ length: cardCount }).map((_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    status: statuses[i % 3], 
    isScanned: false,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed':
        return '#4CAF50'; // hijau
      case 'Blacklisted':
        return '#FF9800'; // orange
      case 'Rejected':
        return '#F44336'; // merah
      default:
        return '#9E9E9E';
    }
  };

  const configCardSx = {
    height: CARD_HEIGHT,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    backgroundColor: 'background.paper',
  };

  const circleBtnSx = {
    borderRadius: '50%',
    minWidth: 0,
    width: 30,
    height: 30,
    padding: 0,
  };

  const EmptyAgentCard = () => (
    <Box
      sx={{
        height: '100%',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        ×
      </Box>

      <Typography variant="body1">Empty Slot</Typography>
    </Box>
  );

  const cards = [
    {
      title: 'Total Visitor Today',
      icon: IconUserFilled,
      subTitle: '128',
      subTitleSetting: undefined,
      color: '#fff',
    },
    {
      title: 'Passsed Today',
      icon: IconCheck,
      subTitle: '98',
      subTitleSetting: undefined,
      color: '#fff',
    },
    {
      title: 'Rejected Today',
      icon: IconBan,
      subTitle: '18',
      subTitleSetting: undefined,
      color: '#fff',
    },
    {
      title: 'Blacklisted Today',
      icon: IconAlertTriangleFilled,
      subTitle: '12',
      subTitleSetting: undefined,
      color: '#fff',
    },
    {
      title: 'Total This Month',
      icon: IconChartLine,
      subTitle: '1248',
      subTitleSetting: undefined,
      color: '#fff',
    },
  ];

  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const { token } = useSession();

  const [openQRCode, setOpenQRCode] = useState(false);

  const handleCloseScanQR = () => {
    setOpenQRCode(false);
  };

  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [invitationCode, setInvitationCode] = useState<any[]>([]);
  const [relatedVisitors, setRelatedVisitors] = useState<any[]>([]);

  const handleSubmitQRCode = async (value: string) => {
    try {
      const res = await getInvitationCode(token as string, value);
      const data = res.collection?.data ?? [];
      console.log('data', res.collection?.data);

      if (data.length === 0) {
        showSwal('error', 'Your code does not exist.');
        return;
      }
      setScannedCode(value);
      const invitation = data[0];
      setInvitationId(invitation.id);
      const invitationId = invitation.id;

      setInvitationCode(data);

      // await fetchRelatedVisitorsByInvitationId(invitationId);
      const relatedVisitor = await getInvitationOperatorRelated(invitationId, token as string);
      console.log('relatedVisitor', relatedVisitor);
      setRelatedVisitors(relatedVisitor.collection ?? []);
      setOpenQRCode(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const mappedVisitors = relatedVisitors.map((v: any, i: number) => ({
    id: v.id || i,
    name: v.name || v.visitor_name || '-',
    status: v.status || 'Passed',
    scan: v.invitation_code === scannedCode ? 'Scanned' : 'Unscanned',
    tapIn: v.tap_in || '08:40:11',
    isScanned: v.invitation_code === scannedCode,
  }));

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const displayData = mappedVisitors.length > 0 ? mappedVisitors : dataCards;

  const filteredData = displayData.filter((item: any) => {
    const keyword = debouncedSearch.toLowerCase();

    return item.name?.toLowerCase().includes(keyword);
  });

  const handleClearAll = () => {
    setInvitationCode([]);
    setRelatedVisitors([]);
    setScannedCode(null);
    // setOpen(false);
    // setOpenDialogIndex(null);
    // setTorchOn(false);
    // setActionButton('');
  };

  return (
    <Box
      flexGrow={1}
      sx={{ p: 1, display: 'flex', flexDirection: 'column', pt: 0.5, backgroundColor: '#fff' }}
    >
      <Grid2 container spacing={2} mt={1}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
        </Grid>
      </Grid2>
      <Box
        sx={{
          padding: '6px 12px',
          // width: '300px',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          justifyContent: { xs: 'flex-start', lg: 'space-between' },

          boxShadow: 2,
          borderRadius: 1,
          flexWrap: 'wrap',
          gap: 1,
          mb: 2.5,
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            // width: '100%',
            // minWidth: 0,
            flex: { xs: '1 1 100%', lg: '0 1 auto' },
            minWidth: 0,
          }}
        >
          <CustomTextField
            fullWidth
            variant="outlined"
            placeholder="Search Visitor..."
            value={search}
            size="medium"
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              height: '45px',
              width: { xs: '100%', xl: '300px' },
              '& .MuiInputBase-root': {
                height: '100%',
              },
              '& .MuiOutlinedInput-input': {
                height: '100%',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={16} />
                </InputAdornment>
              ),
            }}
          />
          <Select size="medium" value={mode}>
            <MenuItem value="viewer">All Status</MenuItem>
            <MenuItem value="config">Passed</MenuItem>
            <MenuItem value="config">Blacklisted</MenuItem>
            <MenuItem value="config">Rejected</MenuItem>
          </Select>

          <CustomTextField type="date" size="medium" />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,

            flexWrap: 'wrap',
            flex: { xs: '1 1 100%', lg: '0 1 auto' }, 
            justifyContent: { xs: 'flex-start', lg: 'flex-end' },
            minWidth: 0,
          }}
        >
          {/* <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 15px',
              zIndex: 1300,
            }}
          >
            <IconCircleFilled
              size={12}
              style={{
                color: '#4CAF50',
                animation: 'blink 1s infinite',
              }}
            />
            <Typography variant="body1" color="textSecondary">
              Online
            </Typography>

            <style>
              {`
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.2; }
        100% { opacity: 1; }
      }
    `}
            </style>
          </div> */}
          <Button variant="contained" startIcon={<IconScan />} onClick={() => setOpenQRCode(true)}>
            Scan
          </Button>
          <Button variant="outlined" color="error" startIcon={<IconX />} onClick={handleClearAll}>
            Clear
          </Button>
          <Button
            startIcon={<IconRefresh />}
            size="small"
            sx={{
              textTransform: 'none',
              backgroundColor: '#fff !important',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#fff !important',
                color: 'text.secondary',
              },
            }}
          >
            Auto Refresh
          </Button>
          <Switch
            size="medium"
            // checked={autoRefresh}
            // onChange={(e) => {
            //   setAutoRefresh(e.target.checked);
            // }}
          />
          <Tooltip title="Category" arrow placement="top">
            <IconButton>
              <IconCategory />
            </IconButton>
          </Tooltip>
          <Tooltip title="Menu" arrow placement="top">
            <IconButton>
              <IconListTree />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {mode === 'viewer' && (
        <Grid container spacing={1} justifyContent={lgUp ? 'space-between' : 'center'} gap={3}>
          {filteredData.map((item) => (
            <Grid key={item.id} size={gridSize}>
              <Box
                sx={{
                  height: 380,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 1,
                  backgroundColor: '#fff',
                }}
              >
                <Box
                  sx={{
                    flex: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={FRImage}
                    alt="cam"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {item.isScanned && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      Scanned
                    </Box>
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: getStatusColor(item.status),
                      color: '#fff',
                      px: 2,
                      py: 0.5,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                    }}
                  >
                    {item.status}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '90px 10px 1fr',
                    rowGap: 1,
                    padding: 1,
                  }}
                >
                  <Typography>Scan</Typography>
                  <Typography>:</Typography>
                  <Typography>{item.isScanned ? 'Yes' : 'No'}</Typography>

                  <Typography>Tap In</Typography>
                  <Typography>:</Typography>
                  <Typography>08:40:11</Typography>

                  <Typography>Tap Out</Typography>
                  <Typography>:</Typography>
                  <Typography>16:40:11</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {mode === 'config' && (
        <Grid container spacing={1}>
          {Array.from({ length: 8 }).map((_, idx) => {
            const agent = agents[idx];
            return (
              <Grid key={idx} size={{ xs: 12, lg: 3 }}>
                {agent ? (
                  <Box sx={configCardSx}>
                    <Typography variant="h4" fontWeight={600}>
                      {agent.name}
                    </Typography>

                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Agent">
                        <Button color="warning" variant="contained" sx={circleBtnSx}>
                          <IconPencil />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Delete Agent">
                        <Button color="error" variant="contained" sx={circleBtnSx}>
                          <IconTrash />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                ) : (
                  <EmptyAgentCard />
                )}
              </Grid>
            );
          })}
        </Grid>
      )}
      <ScanQrVisitorDialog
        open={openQRCode}
        onClose={handleCloseScanQR}
        handleSubmitQRCode={handleSubmitQRCode}
        container={undefined}
      />
    </Box>
  );
};

export default ViewMonitoring;
