import React, { useMemo, useState } from 'react';
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
  Tabs,
  Tab,
  IconButton,
  Stack,
} from '@mui/material';
import {
  IconSearch,
  IconClock,
  IconCreditCard,
  IconPrinter,
  IconFilter,
  IconX,
} from '@tabler/icons-react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import VisitorFilterDialog from './VisitorFilterDialog';
import { IconRefresh } from '@tabler/icons-react';
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
  onClear?: any;
  anchorEl: HTMLElement | null;
  searchKeyword: string;
  selectMultiple: boolean;
  bulkAction: string;
  selectedVisitors: string[];
  scannedVisitorNumber?: string | null;
  totalVisitors: number;
  filteredVisitors: any[];
  relatedVisitors: any[];
  onRefresh?: () => Promise<void>;
  invitationCode: any[];
  isReconnecting?: any;
  availableActions: AvailableAction[];
  isWebSocketOnline?: any;
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
  handleSelectLiveVisitor: (visitor: any) => void;
  handleApplyBulkAction: () => void;
  handleChooseCard: () => void;
  handlePrintClick: () => void;
  page?: any;
  rowsPerPage?: number;
  totalCount?: number;
  setPage?: any;
  liveCount?: any;
  relatedCount?: any;
  livePagination?: any;
  relatedPagination?: any;
  visitorStatusFilter: any;
  setVisitorStatusFilter: React.Dispatch<React.SetStateAction<any>>;
  visitorStartDate: string;
  visitorEndDate: string;
  setVisitorStartDate: React.Dispatch<React.SetStateAction<string>>;
  setVisitorEndDate: React.Dispatch<React.SetStateAction<string>>;
}

const VisitorListCard: React.FC<VisitorListCardProps> = ({
  isFullscreen,
  typeVisitor,
  onClear,
  anchorEl,
  searchKeyword,
  selectMultiple,
  bulkAction,
  selectedVisitors,
  scannedVisitorNumber,
  totalVisitors,
  filteredVisitors,
  relatedVisitors,
  isWebSocketOnline,
  invitationCode,
  availableActions,
  lgUp,
  theme,
  permissionHook,
  onRefresh,
  isReconnecting,
  containerRef,
  CustomTextField,
  getCdnUrl,
  setTypeVisitor,
  setSearchKeyword,
  setSelectMultiple,
  setSelectedVisitors,
  setBulkAction,
  setOpenExtendVisit,
  handleSelectRelatedVisitor,
  handleSelectLiveVisitor,
  handleApplyBulkAction,
  handleChooseCard,
  handlePrintClick,
  page,
  rowsPerPage,
  totalCount,
  setPage,
  liveCount,
  relatedCount,
  livePagination,
  relatedPagination,
  visitorStatusFilter,
  setVisitorStatusFilter,
  visitorStartDate,
  visitorEndDate,
  setVisitorStartDate,
  setVisitorEndDate,
}) => {
  // const totalPages = Math.ceil((totalCount ?? 0) / (rowsPerPage ?? 10));
  const pagination = typeVisitor === 'live' ? livePagination : relatedPagination;
  const totalPages = Math.ceil(pagination.totalCount / pagination.rowsPerPage);
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleApplyFilter = (filter: any, startDate: string, endDate: string) => {
    setVisitorStatusFilter(filter);
    setVisitorStartDate(startDate);
    setVisitorEndDate(endDate);

    if (typeVisitor === 'live') {
      livePagination?.setPage(0);
    }

    if (typeVisitor === 'related') {
      relatedPagination?.setPage(0);
    }

    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    setVisitorStatusFilter('all');
    setVisitorStartDate('');
    setVisitorEndDate('');

    if (typeVisitor === 'live') {
      livePagination?.setPage(0);
    }

    if (typeVisitor === 'related') {
      relatedPagination?.setPage(0);
    }

    setOpenFilter(false);
  };
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    const startTime = Date.now();

    try {
      setIsRefreshing(true);

      await onRefresh?.();

      const elapsed = Date.now() - startTime;
      const minimumDuration = 600;
      const remaining = Math.max(minimumDuration - elapsed, 0);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  return (
    <>
      <Card
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        id="tour-visitor-list"
      >
        <Box display="flex" justifyContent="space-between" flexWrap={'nowrap'} gap={1}>
          <Box
            sx={{
              display: 'inline-flex',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Tabs
              value={typeVisitor}
              onChange={(_, value) => setTypeVisitor(value)}
              sx={{
                minHeight: 50,

                '& .MuiTab-root': {
                  minHeight: 50,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRight: '1px solid',
                  borderColor: 'divider',

                  '&:last-of-type': {
                    borderRight: 'none',
                  },
                },

                '& .Mui-selected': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover',
                },

                '& .MuiTabs-indicator': {
                  height: 2,
                },
              }}
            >
              <Tab value="live" label={`Live Visitors (${liveCount})`} />
              <Tab value="related" label={`Related Visitors (${relatedCount})`} />
            </Tabs>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            {/* Online Indicator */}
            <Box
              display="flex"
              alignItems="center"
              gap={0.7}
              sx={{
                px: 1.2,
                height: 40,
                border: 1,
                borderColor: isWebSocketOnline ? 'success.light' : 'error.light',
                borderRadius: 2,

                animation: 'wsStatusPulse 2s ease-in-out infinite',

                '@keyframes wsStatusPulse': {
                  '0%': {
                    opacity: 0.75,
                    transform: 'scale(0.98)',
                  },
                  '50%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                  '100%': {
                    opacity: 0.75,
                    transform: 'scale(0.98)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: isWebSocketOnline ? 'success.main' : 'error.main',

                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: isWebSocketOnline ? 'success.main' : 'error.main',
                    animation: 'wsDotPulse 1.5s ease-out infinite',
                  },

                  '@keyframes wsDotPulse': {
                    '0%': {
                      transform: 'scale(0.7)',
                      opacity: 0.8,
                    },
                    '70%': {
                      transform: 'scale(1.7)',
                      opacity: 0,
                    },
                    '100%': {
                      transform: 'scale(1.7)',
                      opacity: 0,
                    },
                  },
                }}
              />

              <Typography
                variant="body2"
                fontWeight={600}
                color={isWebSocketOnline ? 'success.main' : 'error.main'}
              >
                {isWebSocketOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
            <Tooltip title="Clear data information">
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconX size={18} />}
                onClick={onClear}
              >
                Clear
              </Button>
            </Tooltip>
            {/* Refresh */}

            <Tooltip title="Refresh Visitor List" placement="top" arrow>
              <Button
                onClick={handleRefresh}
                startIcon={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: isRefreshing ? 'refreshSpin 0.8s linear infinite' : 'none',

                      '@keyframes refreshSpin': {
                        '0%': {
                          transform: 'rotate(0deg)',
                        },
                        '100%': {
                          transform: 'rotate(360deg)',
                        },
                      },
                    }}
                  >
                    <IconRefresh size={20} />
                  </Box>
                }
                sx={{
                  minWidth: 40,
                  height: 40,
                  px: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Box display={'flex'} gap={2} mt={1} justifyContent={'space-between'}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <CustomTextField
              fullWidth
              size="medium"
              value={searchKeyword}
              onChange={(e: any) => setSearchKeyword(e.target.value)}
              placeholder="Search Visitor Name or Organization"
              sx={{ width: lgUp ? '350px' : '100%' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <Tooltip title="Filter">
              <IconButton
                color={visitorStatusFilter !== 'all' ? 'primary' : 'default'}
                onClick={handleOpenFilter}
                sx={{
                  border: 1,
                  borderColor: visitorStatusFilter !== 'all' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                }}
              >
                <IconFilter size={20} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box
            display="flex"
            gap={1}
            alignItems="center"
            justifyContent={'flex-end'}
            id="tour-select-multiple"
          >
            {/* <Tooltip
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
                sx={{
                  marginRight: 0,
                  whiteSpace: 'nowrap',
                }}
              />
            </Tooltip> */}
            {/* <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((p: any) => p - 1)}
            >
              <ChevronLeft />
            </IconButton>

            <Typography display="flex">
              {`${totalPages === 0 ? 0 : page + 1} / ${totalPages}`}
            </Typography>
            <IconButton
              size="small"
              disabled={totalPages === 0 || page >= totalPages - 1}
              onClick={() => {
                if (page < totalPages - 1) {
                  setPage(page + 1);
                }
              }}
            >
              <ChevronRight />
            </IconButton> */}
            <IconButton
              size="small"
              disabled={pagination.page === 0}
              onClick={() => pagination.setPage((p: number) => p - 1)}
            >
              <ChevronLeft />
            </IconButton>

            <Typography display="flex">
              {`${totalPages === 0 ? 0 : pagination.page + 1} / ${totalPages}`}
            </Typography>

            <IconButton
              size="small"
              disabled={totalPages === 0 || pagination.page >= totalPages - 1}
              onClick={() => {
                if (pagination.page < totalPages - 1) {
                  pagination.setPage((p: number) => p + 1);
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mt: 1 }} />

        <CardContent
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)',
              },
              gap: 1,
            }}
          >
            {filteredVisitors.map((visitor, index) => {
              const isDriving = visitor.is_driving === true;
              const isScanned =
                visitor.visitor_number &&
                scannedVisitorNumber &&
                visitor.visitor_number === scannedVisitorNumber;

              const selected = selectedVisitors.includes(visitor.id);

              return (
                <Card
                  key={visitor.id || index}
                  onClick={() => {
                    if (typeVisitor === 'live') {
                      handleSelectLiveVisitor(visitor);
                    } else {
                      handleSelectRelatedVisitor(visitor);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: selected ? '2px solid' : '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    transition: '.2s',
                    padding: '5px',

                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0.5,
                      textAlign: 'center',
                      '&:last-child': {
                        pb: 0.5,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={getCdnUrl(visitor.selfie_image) || undefined}
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                        }}
                      />

                      {(isDriving || isScanned) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            right: -4,
                            bottom: -4,
                            display: 'flex',
                            gap: 0.5,
                          }}
                        >
                          {isDriving && (
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                bgcolor: 'success.main',
                                color: '#fff',
                                borderRadius: '50%',
                                fontSize: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              P
                            </Box>
                          )}

                          {isScanned && (
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                bgcolor: 'primary.main',
                                color: '#fff',
                                borderRadius: '50%',
                                fontSize: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              S
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Typography variant="subtitle2" fontWeight={700} mt={1.5} noWrap>
                      {visitor.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" noWrap>
                      {visitor.organization}
                    </Typography>
                    <br />

                    <Checkbox
                      checked={selected}
                      sx={{ mt: 1 }}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setSelectedVisitors((prev) => {
                          if (selectMultiple) {
                            return checked
                              ? [...new Set([...prev, visitor.id])]
                              : prev.filter((id) => id !== visitor.id);
                          }

                          // if (checked) {
                          //   handleSelectRelatedVisitor(visitor);
                          //   return [visitor.id];
                          // }

                          if (checked) {
                            if (typeVisitor === 'live') {
                              handleSelectLiveVisitor(visitor);
                            } else {
                              handleSelectRelatedVisitor(visitor);
                            }

                            return [visitor.id];
                          }

                          return [];
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </CardContent>

        {/* <CardActions sx={{ overflow: 'visible', p: '0' }}>
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
                {permissionHook.canExtend && (
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
                )}

                {permissionHook.canCardIssuance && (
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
                )}

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
        </CardActions> */}
      </Card>
      <VisitorFilterDialog
        open={openFilter}
        value={visitorStatusFilter}
        startDate={visitorStartDate}
        endDate={visitorEndDate}
        onClose={handleCloseFilter}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />
    </>
  );
};

export default VisitorListCard;
