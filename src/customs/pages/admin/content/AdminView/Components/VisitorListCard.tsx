import React from 'react';
import {
  Card,
  Box,
  CardHeader,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  FormControl,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
  CardContent,
  ListItem,
  Avatar,
  CardActions,
  Select,
  Button,
} from '@mui/material';
import {
  IconChevronDown,
  IconSearch,
  IconClock,
  IconCreditCard,
  IconPrinter,
} from '@tabler/icons-react';

interface AvailableAction {
  value: string;
  label: string;
}

interface PermissionHook {
  canExtend: boolean;
  canCardIssuance: boolean;
}

interface VisitorListCardProps {
  isFullscreen: boolean;
  typeVisitor: any;
  anchorEl: HTMLElement | null;
  searchKeyword: string;
  selectMultiple: boolean;
  bulkAction: string;
  selectedVisitors: string[];
  scannedVisitorNumber?: string | null;
  totalVisitors: number;
  filteredVisitors: any[];
  relatedVisitors: any[];
  invitationCode: any[];
  availableActions: AvailableAction[];
  lgUp: boolean;
  theme: any;
  permissionHook: PermissionHook;
  containerRef: React.RefObject<HTMLDivElement | null>;
  CustomTextField: React.ElementType;
  getCdnUrl: (path?: string) => string;
  formatDateTime: (date?: string, extend?: any) => string;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setTypeVisitor: React.Dispatch<React.SetStateAction<'related' | 'live'>>;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
  setSelectMultiple: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedVisitors: React.Dispatch<React.SetStateAction<string[]>>;
  setBulkAction: React.Dispatch<React.SetStateAction<string>>;
  setOpenExtendVisit: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectRelatedVisitor: (visitor: any) => void;
  handleApplyBulkAction: () => void;
  handleChooseCard: () => void;
  handlePrintClick: () => void;
}

const VisitorListCard: React.FC<VisitorListCardProps> = ({
  isFullscreen,
  typeVisitor,
  anchorEl,
  searchKeyword,
  selectMultiple,
  bulkAction,
  selectedVisitors,
  scannedVisitorNumber,
  totalVisitors,
  filteredVisitors,
  relatedVisitors,
  invitationCode,
  availableActions,
  lgUp,
  theme,
  permissionHook,
  containerRef,
  CustomTextField,
  getCdnUrl,
  formatDateTime,
  setAnchorEl,
  setTypeVisitor,
  setSearchKeyword,
  setSelectMultiple,
  setSelectedVisitors,
  setBulkAction,
  setOpenExtendVisit,
  handleSelectRelatedVisitor,
  handleApplyBulkAction,
  handleChooseCard,
  handlePrintClick,
}) => {
  return (
    <Card
      sx={{
        flex: 1,
        height: '100%',
        maxHeight: isFullscreen ? '100%' : '530px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'auto',
        border: '1px solid #e0e0e0',
      }}
    >
      <Box display="flex" justifyContent="space-between" flexWrap={'nowrap'} gap={1}>
        <Box display="flex" alignItems="center" gap={0.5} flex={1}>
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            flex={1}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            <CardHeader
              title={typeVisitor === 'related' ? 'Related Visitors' : 'Live Visitors'}
              sx={{ p: 0, fontSize: '14px', fontWeight: 600 }}
            />

            <Tooltip arrow title={`Total visitor: ${totalVisitors}`} placement="top">
              <Typography variant="body1" sx={{ color: 'text.secondary' }} ml={1}>
                ({totalVisitors})
              </Typography>
            </Tooltip>

            <IconChevronDown size={18} />
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem
              onClick={() => {
                setTypeVisitor('related');
                setAnchorEl(null);
              }}
            >
              Related Visitors
            </MenuItem>
            <MenuItem
              onClick={() => {
                setTypeVisitor('live');
                setAnchorEl(null);
              }}
            >
              Live Visitors
            </MenuItem>
          </Menu>
        </Box>

        <Box display={'flex'} gap={1}>
          <FormControl sx={{ width: '100%' }}>
            <CustomTextField
              fullWidth
              size="medium"
              value={searchKeyword}
              onChange={(e: any) => setSearchKeyword(e.target.value)}
              placeholder="Search Visitor"
              sx={{ mb: 0, width: '100%', p: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <Tooltip
            title="Click and Select more than 1 visitor"
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: '8.7remrem',
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
              sx={{ marginRight: 0, width: '250px' }}
            />
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mt: 1 }} />

      <CardContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 0,
          pb: '0 !important',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {filteredVisitors.map((visitor, index) => {
          const isDriving = visitor.is_driving === true;
          const isScanned =
            visitor.visitor_number &&
            scannedVisitorNumber &&
            visitor.visitor_number === scannedVisitorNumber;

          return (
            <React.Fragment key={visitor.id || index}>
              <ListItem
                sx={{
                  px: 1,
                  py: 1.5,
                  borderBottom: index !== relatedVisitors.length - 1 ? 'none' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',

                  '&:hover': {
                    backgroundColor: 'rgba(93,135,255,0.08)',
                  },
                }}
                onClick={() => handleSelectRelatedVisitor(visitor)}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={getCdnUrl(visitor.selfie_image) || undefined}
                    alt={visitor.name}
                    sx={{ width: 45, height: 45 }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {visitor.name || '-'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {visitor.organization || '-'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                  <Box display="flex" gap={1} flexDirection={'column'}>
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
                    checked={selectedVisitors.includes(visitor.id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;

                      setSelectedVisitors((prev) => {
                        if (selectMultiple) {
                          if (isChecked) {
                            const updated = Array.from(new Set([...prev, visitor.id]));
                            return updated;
                          } else {
                            const updated = prev.filter((id) => id !== visitor.id);
                            return updated;
                          }
                        } else {
                          if (isChecked) {
                            handleSelectRelatedVisitor(visitor);
                            return [visitor.id];
                          } else {
                            return [];
                          }
                        }
                      });
                    }}
                  />
                </Box>
              </ListItem>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mt: 1,
                  px: 1,
                  gap: 0.5,
                }}
              >
                <Typography variant="body1" fontWeight="medium" sx={{ lineHeight: 1.3 }}>
                  {visitor.agenda || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  {`${formatDateTime(visitor.visitor_period_start)} - ${formatDateTime(visitor.visitor_period_end, visitor.extend_visitor_period)}`}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />
            </React.Fragment>
          );
        })}
      </CardContent>

      <CardActions sx={{ overflow: 'visible', p: '0' }}>
        <Divider />
        <Box
          display={'flex'}
          gap={1}
          width={'100%'}
          sx={{
            mt: 2,
            justifyContent: 'space-between',
            marginLeft: '0 !important',
          }}
          flexWrap={theme.breakpoints.down('lg') ? 'nowrap' : 'wrap'}
        >
          <Box display="flex" gap={1} ref={containerRef} sx={{ marginLeft: '0 !important' }}>
            <Select
              sx={{ width: '130px', height: '40px' }}
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              MenuProps={{
                disablePortal: true,
                container: containerRef.current,
              }}
            >
              {availableActions.map((action) => (
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

          {invitationCode.length > 0 && (
            <Box
              display={'flex'}
              gap={0.5}
              alignItems={'center'}
              justifyContent={lgUp ? 'flex-end' : 'start'}
              flexWrap={lgUp ? 'nowrap' : 'wrap'}
            >
             
                <Tooltip
                  title="Extend Time"
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
                    onClick={() => setOpenExtendVisit(true)}
                    startIcon={<IconClock size={18} />}
                    sx={{
                      color: '#fff',
                      background: !relatedVisitors.some(
                        (v) => selectedVisitors.includes(v.id) && v.visitor_status === 'Checkin',
                      )
                        ? undefined
                        : 'linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)',
                      '&.Mui-disabled': {
                        background: '#BDBDBD !important',
                        color: '#FFFFFF !important',
                        opacity: 0.8,
                      },
                    }}
                    disabled={
                      !relatedVisitors.some(
                        (v) => selectedVisitors.includes(v.id) && v.visitor_status === 'Checkin',
                      )
                    }
                  >
                    Extend
                  </Button>
                </Tooltip>
              
                <Tooltip
                  title="Card"
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
                    sx={{
                      background: 'linear-gradient(135deg, #AB47BC 0%, #6A1B9A 100%)',
                      color: '#fff',
                      textWrap: 'wrap',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                    }}
                    onClick={handleChooseCard}
                    startIcon={<IconCreditCard size={18} />}
                  >
                    Card Issuance
                  </Button>
                </Tooltip>
              

              <Tooltip
                title="Print Badge"
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
                  sx={{
                    backgroundColor: '#5f5f5f',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#5f5f5f',
                    },
                  }}
                  onClick={handlePrintClick}
                  startIcon={<IconPrinter size={18} />}
                >
                  Print
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default VisitorListCard;
