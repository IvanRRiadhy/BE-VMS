import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid2 as Grid,
  Box,
  Typography,
  Divider,
  Avatar,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { axiosInstance2 } from 'src/customs/api/interceptor';

type Props = {
  open: boolean;
  onClose: () => void;
  visitorDetail: any[];
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  disabledIndexes: number[];
  selectedVisitorData: any[];
};

const RelatedInvitationDialog: React.FC<Props> = ({
  open,
  onClose,
  visitorDetail,
  selected,
  setSelected,
  disabledIndexes,
  selectedVisitorData,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Related Visitor Invitation</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                overflowX: 'auto',
                p: 1,
                maxWidth: '100%',
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 3,
                },
              }}
            >
              {visitorDetail.length === 0 ? (
                <Typography color="text.secondary">No related visitors found</Typography>
              ) : (
                visitorDetail.map((v: any, index: number) => {
                  const isDisabled = disabledIndexes.includes(index);
                  const isSelected = selected.includes(index);

                  return (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.4 : 1,
                        textAlign: 'center',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease',
                        flex: '0 0 auto',
                        '&:hover': {
                          transform: isDisabled ? 'none' : 'scale(1.05)',
                        },
                      }}
                      onClick={() => {
                        if (isDisabled) return;
                        setSelected((prev) =>
                          prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
                        );
                      }}
                    >
                      <Avatar
                        src={`${axiosInstance2.defaults.baseURL}/cdn` + v.selfie_image}
                        alt={v.name}
                        sx={{ width: 60, height: 60 }}
                      />

                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'white',
                          borderRadius: '50%',
                          p: 0.2,
                          '& .MuiSvgIcon-root': { fontSize: 16 },
                        }}
                      />

                      <Typography mt={1} fontSize={14} noWrap width={60}>
                        {v.visitor.name}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Tombol select/unselect */}
            {/* <Box display="flex" justifyContent="flex-start" gap={1}>
                <Button size="small" variant="outlined">
                  Select All
                </Button>
                <Button size="small" variant="outlined" color="error">
                  Unselect All
                </Button>
              </Box> */}

            <Divider sx={{ mt: 2, mb: 2 }} />

            <DynamicTable
              data={selectedVisitorData}
              isHaveChecked={false}
              isHavePagination={false}
              isHaveHeaderTitle
              titleHeader="Selected Visitor"
            />

            {/* Dropdown Action + Apply */}
            {/* Dropdown Action + Apply */}
            {/* <Box display="flex" alignItems="center" gap={2} mt={2}>
                <CustomSelect
                  sx={{ width: '20%' }}
                  value={selectedAction}
                  onChange={(e: any) => {
                    const action = e.target.value;
                    setSelectedAction(action);

                    // Kalau belum pilih, reset semua
                    if (!action) {
                      setDisabledIndexes([]);
                      setSelected([]);
                      return;
                    }

                    const newDisabledIndexes = visitorDetail
                      .map((v, i) => {
                        const status = (v.visitor_status || '').trim();

                        if (status === 'Block' && action !== 'Unblock') {
                          return i;
                        }

                        switch (action) {
                          case 'Checkin':
                            return status === 'Checkin' || status === 'Checkout' ? i : null;

                          case 'Checkout':
                            return status !== 'Checkin' ? i : null;

                          case 'Block':
                            return status === 'Block' ? i : null;

                          case 'Unblock':
                            return status !== 'Block' ? i : null;

                          default:
                            return null;
                        }
                      })
                      .filter((x) => x !== null);

                    // console.log('🎯 Action:', action);
                    // console.log('🚫 Disabled indexes:', newDisabledIndexes);

                    // Update state
                    setDisabledIndexes(newDisabledIndexes);

                    // Pastikan selected tidak mengandung index yang baru di-disable
                    setSelected((prev) => prev.filter((i) => !newDisabledIndexes.includes(i)));
                  }}
                  displayEmpty
                >
                  <MenuItem value="">Select Action</MenuItem>
                  <MenuItem value="Checkin">Check In</MenuItem>
                  <MenuItem value="Checkout">Check Out</MenuItem>
                  <MenuItem value="Block">Block</MenuItem>
                  <MenuItem value="Unblock">Unblock</MenuItem>
                </CustomSelect>

                <Button
                  sx={{ width: '10%' }}
                  variant="contained"
                  color="primary"
                  disabled={
                    !selectedAction ||
                    visitorDetail.length === 0 ||
                    disabledIndexes.length === visitorDetail.length ||
                    selected.length === 0
                  }
                  onClick={() => confirmMultipleAction(selectedAction as any)}
                >
                  Apply
                </Button>
              </Box> */}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default RelatedInvitationDialog;
