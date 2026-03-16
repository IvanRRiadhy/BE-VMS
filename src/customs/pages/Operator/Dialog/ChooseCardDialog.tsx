import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Box,
  Grid2 as Grid,
  Paper,
  TextField,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import { IconX, IconSearch, IconSwipe, IconCards, IconKeyOff } from '@tabler/icons-react';

const ChooseCardDialog = ({
  open,
  onClose,
  containerRef,
  searchTerm,
  setSearchTerm,
  isChecked,
  isIndeterminate,
  handleSelectAll,
  capacity,
  currentUsedCards,
  selectedCards,
  handleToggleCard,
  filteredCards,
  selectedVisitors,
  availableCount,
  handleOpenSwipeDialog,
  handleConfirmChooseCards,
  setOpenRevokeDialog,
}: any) => {
  const isSwipeDisabled =
    //  currentUsedCards.length === 0 ||
    selectedCards.some((cardNumber: string) => {
      const card = currentUsedCards.find((c: any) => c.card_number === cardNumber);

      return card?.current_used === true && card?.is_swapcard === true;
    });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" container={containerRef?.current}>
      <DialogTitle>Choose Card</DialogTitle>

      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Box mb={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
                disabled={capacity === 0}
              />
            }
            label="Select All"
          />
        </Box>

        {/* LAST USED CARD */}
        {currentUsedCards.length > 0 && (
          <>
            <Grid container spacing={2} mb={2}>
              {currentUsedCards.map((card: any) => {
                const isSelectable = card.current_used;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                    <Paper
                      sx={(theme) => ({
                        p: 2,
                        borderRadius: 2,
                        position: 'relative',
                        height: 280,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: theme.palette.warning.main,
                        backgroundColor: theme.palette.warning.light,
                        boxShadow: theme.shadows[6],
                        opacity: isSelectable ? 1 : 0.5,
                        cursor: isSelectable ? 'pointer' : 'not-allowed',
                      })}
                      onClick={(e) => {
                        if (!isSelectable) return;
                        e.stopPropagation();

                        handleToggleCard(card.card_number);
                      }}
                    >
                      <Box
                        flexGrow={1}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography variant="h1" color="text.secondary" mt={1}>
                          {card.card_number}
                        </Typography>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                          maxWidth={300}
                          mt={1}
                        >
                          <Typography variant="body1" fontWeight={600}>
                            Card
                          </Typography>
                          <Typography variant="body1">{card.card_number}</Typography>
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                          maxWidth={300}
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Typography variant="body1" fontWeight={600}>
                            BLE
                          </Typography>
                          <Typography variant="body1">{card.card_mac || '-'}</Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1">{card.name}</Typography>

                      <Typography variant="body2" color="warning.main" fontWeight={600}>
                        {card.current_used ? '(Current Card)' : '(Swapped Card)'}
                      </Typography>

                      <FormControlLabel
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        control={
                          <Checkbox
                            checked={selectedCards.includes(card.card_number)}
                            disabled={!isSelectable}
                            onChange={() => handleToggleCard(card.card_number)}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {/* CARD LIST */}
        <Grid container spacing={2}>
          {filteredCards.map((card: any) => {
            const isChosen = selectedCards.includes(card.card_number);
            const isLimitReached =
              selectedCards.length >= (selectedVisitors.length || 1) && !isChosen;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                <Paper
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCard(card.card_number);
                  }}
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 2,
                    position: 'relative',
                    height: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isChosen ? theme.palette.primary.main : 'divider',
                    boxShadow: isChosen ? theme.shadows[8] : theme.shadows[2],
                    backgroundColor: isChosen ? theme.palette.primary.light : 'background.paper',
                    transition: theme.transitions.create(
                      ['transform', 'box-shadow', 'border-color', 'background-color'],
                      {
                        duration: theme.transitions.duration.shorter,
                      },
                    ),
                    '&:hover': {
                      transform: isLimitReached ? 'none' : 'translateY(-3px)',
                      boxShadow: isLimitReached ? theme.shadows[1] : theme.shadows[6],
                    },
                  })}
                >
                  <Box
                    flexGrow={1}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography variant="h1" color="text.secondary" mt={2}>
                      {card.remarks || '-'}
                    </Typography>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                      maxWidth={300}
                      mt={1}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        Card
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {card.card_number || '-'}
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                      maxWidth={300}
                      flexWrap={'wrap'}
                      gap={1}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        BLE
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {card.card_mac || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1">{card.name}</Typography>

                  <FormControlLabel
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    control={
                      <Checkbox
                        checked={isChosen}
                        // disabled={!isChosen}
                        onChange={() => {
                          handleToggleCard(card.card_number);
                        }}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Box mt={3} display="flex" gap={1}>
          <Typography>
            Cards chosen: {selectedCards.length} / {availableCount}
          </Typography>

          <Typography>
            Maximum cards allowed: <b>{selectedVisitors.length || 1}</b>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          color="warning"
          startIcon={<IconSwipe />}
          onClick={handleOpenSwipeDialog}
          disabled={isSwipeDisabled}
        >
          Swipe
        </Button>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<IconCards />}
          onClick={handleConfirmChooseCards}
        >
          Give
        </Button>

        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<IconKeyOff />}
          onClick={() => setOpenRevokeDialog(true)}
        >
          Revoke
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ChooseCardDialog);
