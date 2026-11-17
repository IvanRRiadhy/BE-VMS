import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  Checkbox,
  Divider,
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { extendAccessCard, revokeAccessCard } from 'src/customs/api/operator';
import { IconX, IconSearch } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';

interface Props {
  open: boolean;
  onClose: () => void;
  visitor?: any;
  card?: any;
  registeredSiteId?: string;
  accessControls?: any[];
  isLoadingAccess?: boolean;
  onSuccess?: () => void;
  mode?: any;
}

const ExtendAccessCardDialog = ({
  open,
  onClose,
  visitor,
  card,
  registeredSiteId,
  accessControls = [],
  isLoadingAccess,
  onSuccess,
  mode,
}: Props) => {
  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const isExtend = mode === 'extend';
  const isRevoke = mode === 'revoke';
  const isDetail = mode === 'detail';
  useEffect(() => {
    if (open) {
      setSelectedAccess([]);
      setSearch('');
    }
  }, [open, card?.id]);

  // Search access control
  const filteredAccess = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return accessControls;

    return accessControls.filter((item) =>
      [
        item.name,
        item.Name,
        item.access_control_name,
        item.description,
        item.type,
        item.integrationName,
        item.visitor_give_access,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [accessControls, search]);

  // Select all
  const isAllSelected =
    accessControls.length > 0 && selectedAccess.length === accessControls.length;

  const isIndeterminate =
    selectedAccess.length > 0 && selectedAccess.length < accessControls.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedAccess(checked ? [...accessControls] : []);
  };

  // Select individual card
  const handleToggleAccess = (item: any) => {
    setSelectedAccess((prev) => {
      const exists = prev.some((x) => x.id === item.id);

      if (exists) {
        return prev.filter((x) => x.id !== item.id);
      }

      return [...prev, item];
    });
  };

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isExtend ? extendAccessCard(payload) : revokeAccessCard(payload),

    onSuccess: () => {
      showSwal(
        'success',
        isExtend ? 'Successfully extend access card' : 'Successfully revoke access card',
      );

      onSuccess?.();
      onClose();
    },

    onError: (error: any) => {
      showSwal(
        'error',
        error?.response?.data?.msg ||
          (isExtend ? 'Failed to extend access card' : 'Failed to revoke access card'),
      );
    },
  });

  const handleSubmit = () => {
    const payload = {
      trx_visitor_id: visitor?.id,
      trx_card_id: card?.id,
      registered_site_id: registeredSiteId,
      card_number: card?.card_number,
      access_controls: selectedAccess.map((item) => item.id),
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {isExtend ? 'Extend Access Card' : isDetail ? 'Access Card Detail' : 'Revoke Access Card'}

        <IconButton onClick={onClose} size="small">
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Card Information */}
          {/* <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Card Number
              </Typography>
              <Typography fontWeight={600}>
                {card?.card_number || '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Visitor
              </Typography>
              <Typography fontWeight={600}>
                {visitor?.name || '-'}
              </Typography>
            </Box>
          </Box> */}

          {/* <Divider /> */}

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search access control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <IconSearch size={18} style={{ marginRight: 8 }} />,
            }}
          />

          {/* Select All */}
          {/* <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={!accessControls.length || isLoadingAccess}
              />
              <Typography variant="body2">Select All</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {selectedAccess.length} / {accessControls.length} selected
            </Typography>
          </Box>

          <Divider /> */}
          {!isDetail && (
            <>
              {/* Select All */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={!accessControls.length || isLoadingAccess}
                  />
                  <Typography variant="body2">Select All</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {selectedAccess.length} / {accessControls.length} selected
                </Typography>
              </Box>

              <Divider />
            </>
          )}

          {/* Access Control Cards */}
          {isLoadingAccess ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={30} />
            </Box>
          ) : filteredAccess.length === 0 ? (
            <Box py={5} textAlign="center">
              <Typography color="text.secondary">No access control found</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, minmax(0, 1fr))',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {filteredAccess.map((item) => {
                const selected = selectedAccess.some((x) => x.id === item.id);

                return (
                  <Box
                    key={item.id}
                    onClick={() => {
                      if (!isDetail) {
                        handleToggleAccess(item);
                      }
                    }}
                    sx={{
                      minHeight: 170,
                      border: '1px solid',
                      borderColor: selected ? 'primary.main' : 'divider',
                      backgroundColor: selected ? 'action.selected' : 'background.paper',
                      borderRadius: 2,
                      p: 5,
                      cursor: isDetail ? 'default' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: isDetail ? 'divider' : 'primary.main',
                        boxShadow: isDetail ? 0 : 2,
                      },
                    }}
                  >
                    {/* <Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        textAlign="center"
                        sx={{
                          mb: 3,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {item.name || item.Name || '-'}
                      </Typography>

                      <Box display="flex" justifyContent="space-between" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="caption" fontWeight={500}>
                          {item.type || item.Type || '-'}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          Description
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={500}
                          textAlign="right"
                          sx={{ overflowWrap: 'anywhere' }}
                        >
                          {item.description || item.Description || '-'}
                        </Typography>
                      </Box>
                    </Box> */}
                    <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        textAlign="center"
                        sx={{
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {item.name || item.Name || item.access_control_name || '-'}
                      </Typography>
                    </Box>

                    <Box>
                      {isDetail && (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            textAlign="center"
                            sx={{
                              color: '#fff',
                              backgroundColor:
                                item.visitor_give_access === 'Grant'
                                  ? 'success.main'
                                  : item.visitor_give_access === 'Revoke'
                                  ? 'error.main'
                                  : 'grey.500',
                              borderRadius: 1,
                              px: 2,
                              py: 0.5,
                              minWidth: 80,
                            }}
                          >
                            {item.visitor_give_access || '-'}
                          </Typography>
                        </Box>
                      )}

                      {!isDetail && (
                        <Box display="flex" justifyContent="center">
                          <Checkbox
                            checked={selected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleAccess(item)}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>

        {!isDetail && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !selectedAccess.length ||
              !visitor?.id ||
              !card?.id ||
              !registeredSiteId ||
              mutation.isPending
            }
          >
            {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExtendAccessCardDialog;
