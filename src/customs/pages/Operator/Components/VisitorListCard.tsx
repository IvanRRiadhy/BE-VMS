import {
  Card,
  Box,
  Button,
  Typography,
  Avatar,
  Tooltip,
  Checkbox,
  CardContent,
  InputAdornment,
  FormControlLabel,
  Divider,
  MenuItem,
  Select,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {  IconX } from '@tabler/icons-react';
import { IconSearch } from '@tabler/icons-react';
import { useMemo } from 'react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { axiosInstance2 } from 'src/customs/api/interceptor';

interface Props {
  relatedVisitors: any[];
  selectedVisitors: string[];
  scannedVisitorNumber: string | null;
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
  handleClearAll: () => void;
  handleSelectRelatedVisitor: (visitor: any) => void;
  handleCheckboxChange: (visitor: any, checked: boolean) => void;
  activeSelfie?: string;
  containerRef?: any;
  selectMultiple?: any;
  setSelectMultiple?: any;
  setSelectedVisitors?: any;
  bulkAction?: any;
  setBulkAction?: any;
  availableActions?: any;
  handleApplyBulkAction?: any;
  permissionHook?: any;
  setOpenExtendVisit?: any;
  handleChooseCard?: any;
  handlePrintClick?: any;
  loadingAccess?: boolean;
}

const VisitorListCard: React.FC<Props> = ({
  relatedVisitors,
  selectedVisitors,
  scannedVisitorNumber,
  searchKeyword,
  setSearchKeyword,
  handleClearAll,
  handleSelectRelatedVisitor,
  handleCheckboxChange,
  activeSelfie,
  containerRef,
  selectMultiple,
  setSelectMultiple,
  setSelectedVisitors,
  bulkAction,
  setBulkAction,
  availableActions,
  handleApplyBulkAction,
  permissionHook,
  setOpenExtendVisit,
  handleChooseCard,
  handlePrintClick,
  loadingAccess,
}) => {
  const totalVehicle = useMemo(() => {
    return relatedVisitors.filter((v) => {
      const plate = v.vehicle_plate_number?.trim();
      const type = v.vehicle_type?.trim();

      const isPlateValid = plate && plate !== '-';
      const isTypeValid = type && type !== '-';

      return isPlateValid || isTypeValid;
    }).length;
  }, [relatedVisitors]);

  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const getCdnUrl = (path?: string) => {
    if (!path || path === '-' || path.trim() === '') return null;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${axiosInstance2.defaults.baseURL}/cdn${cleanPath}`;
  };
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid #eee',
          flexShrink: 0,
        }}
      >
        <Box display="flex" gap={1}>
          <CustomTextField
            fullWidth
            size="small"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search Visitor"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              p: '5px',
              borderRadius: 1,
              backgroundColor: 'red',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '32px',
              height: '33px',
            }}
            onClick={handleClearAll}
          >
            <Tooltip title="Clear All" arrow>
              <IconX size={18} color="white" />
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs */}
        <Box mt={1} display="flex" gap={1} justifyContent={'space-between'} width={'100%'}>
          {/* <Button variant="contained" size="small" fullWidth>
            Live Visitors
          </Button>*/}
          <Button variant="contained" size="small">
            Related Visitors
          </Button>
          <Tooltip
            title="Click and Select more than 1 visitor"
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: '0.7rem',
                  padding: '8px 14px',
                },
              },
              popper: {
                container: containerRef.current,
              },
            }}
            arrow
          >
            <FormControlLabel
              value="end"
              control={
                <Checkbox
                  checked={selectMultiple}
                  onChange={(e) => {
                    setSelectMultiple(e.target.checked);
                    setSelectedVisitors([]);
                  }}
                />
              }
              label="Select Multiple"
              labelPlacement="end"
              sx={{ marginRight: 0, width: '150px', justifyContent: 'end' }}
            />
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          // flex: 1,
          overflowY: 'auto',
          p: 1,
          ...(relatedVisitors.length == 0 && {
            height: 'calc(100vh - 300px)',
          }),
          ...(relatedVisitors.length < 5 && {
            flex: 1,
          }),
          ...(relatedVisitors.length >= 5 && {
            height: 'calc(100vh - 330px)',
          }),
        }}
      >
        {relatedVisitors.map((item) => {
          const isActive = selectedVisitors.includes(item.id);
          const isDriving = item.is_driving === true;
          const isScanned =
            item.visitor_number &&
            scannedVisitorNumber &&
            item.visitor_number === scannedVisitorNumber;

          return (
            <Card
              key={item.id}
              onClick={() => handleSelectRelatedVisitor(item)}
              sx={{
                mb: 1,
                cursor: 'pointer',
                backgroundColor: isActive ? '#f0f7ff' : '#fff',
                borderLeft: isActive ? '4px solid #1976d2' : '4px solid transparent',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={getCdnUrl(item.selfie_image) || undefined}
                    alt={item.name}
                    sx={{ width: 50, height: 50 }}
                  />

                  <Box>
                    <Typography fontWeight="600">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.organization}
                    </Typography>
                  </Box>

                  {/* BADGES */}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    {isDriving && (
                      <Tooltip
                        title="Parking"
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
                        <Box
                          sx={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '6px',
                            px: 1,
                            py: 0.25,
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            cursor: 'default',
                          }}
                        >
                          P
                        </Box>
                      </Tooltip>
                    )}

                    {isScanned && (
                      <Tooltip
                        title="Scanned"
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
                        <Box
                          sx={{
                            backgroundColor: '#1976D2',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '6px',
                            px: 1,
                            py: 0.25,
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            cursor: 'default',
                          }}
                        >
                          S
                        </Box>
                      </Tooltip>
                    )}
                  </Box>

                  <Checkbox
                    checked={isActive}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(item, e.target.checked);
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Divider />
      <Box
        display={'flex'}
        gap={1}
        width={'100%'}
        sx={{ mt: 2, mb: 1, justifyContent: 'space-between', marginLeft: '0 !important' }}
        flexWrap={theme.breakpoints.down('lg') ? 'nowrap' : 'wrap'}
      >
        <Box display="flex" gap={1} ref={containerRef} sx={{ marginLeft: '0 !important' }}>
          <Select
            sx={{ width: '130px', height: '40px' }}
            value={bulkAction}
            onChange={(e: any) => setBulkAction(e.target.value)}
            MenuProps={{
              disablePortal: true,
              container: containerRef.current,
            }}
          >
            {availableActions.map((action: any) => (
              <MenuItem key={action.value} value={action.value}>
                {action.label}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            color="primary"
            sx={{ width: '80px', height: '40px' }}
            disabled={!bulkAction || selectedVisitors.length === 0}
            onClick={handleApplyBulkAction}
          >
            Apply
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography>Total: {relatedVisitors.length}</Typography>
        <Typography>Vehicle: {totalVehicle}</Typography>
      </Box>
    </Card>
  );
};

export default VisitorListCard;
