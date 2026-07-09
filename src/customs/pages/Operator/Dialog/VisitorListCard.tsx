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
} from '@tabler/icons-react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

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
  handleSelectLiveVisitor: (visitor: any) => void;
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
  handleSelectLiveVisitor,
  handleApplyBulkAction,
  handleChooseCard,
  handlePrintClick,
}) => {
  const ITEMS_PER_PAGE = 8;

  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(filteredVisitors.length / ITEMS_PER_PAGE);

  const pagedVisitors = filteredVisitors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  return (
    <Card
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box display="flex" justifyContent="space-between" flexWrap={'nowrap'} gap={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Tabs
            value={typeVisitor}
            onChange={(_, value) => setTypeVisitor(value)}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <Tab value="live" label="Live Visitors" />
            <Tab value="related" label="Related Visitors" />
          </Tabs>

          <Tooltip arrow title={`Total visitor: ${totalVisitors}`} placement="top">
            <Typography variant="body2" color="text.secondary">
              ({totalVisitors})
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      <Box display={'flex'} gap={2} mt={2} justifyContent={'space-between'}>
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
            placeholder="Search Visitor"
            sx={{ flex: 1 }}
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
              color="primary"
              sx={{
                border: 1,
                borderColor: 'divider',
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

        <Box display="flex" gap={1} alignItems="center" justifyContent={'flex-end'}>
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
          </Tooltip>
          <IconButton size="small" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
          </IconButton>

          <Typography display={'flex'}>
            <span> {filteredVisitors.length > 0 ? page : 0}</span> / <span>{totalPages}</span>
          </Typography>
          <IconButton
            size="small"
            onClick={() => setPage(page + 1)}
            disabled={totalPages === 0 || page >= totalPages}
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
              xl: 'repeat(4, 1fr)',
            },
            gap: 1,
          }}
        >
          {pagedVisitors.map((visitor, index) => {
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
      </CardActions>
    </Card>
  );
};

export default VisitorListCard;
