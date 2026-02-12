import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid2 as Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IconCards, IconCheck, IconX } from '@tabler/icons-react';

interface SwipeCardDialogProps {
  open: boolean;
  onClose: () => void;

  findCard: (cardNumber: string) => any;
  showSwal: (type: 'success' | 'error', message: string) => void;
  setSnackbar: (val: any) => void;

  onSubmit: (payload: { oldCardData: any; newCardData: any; actionType: any }) => void;
}

const SwipeCardNoCodeDialog: React.FC<SwipeCardDialogProps> = ({
  open,
  onClose,
  findCard,
  showSwal,
  setSnackbar,
  onSubmit,
}) => {
  const [oldCard, setOldCard] = useState('');
  const [newCard, setNewCard] = useState('');

  const [oldVerified, setOldVerified] = useState(false);
  const [newVerified, setNewVerified] = useState(false);

  const [oldCardData, setOldCardData] = useState<any | null>(null);
  const [newCardData, setNewCardData] = useState<any | null>(null);

  const [focusTarget, setFocusTarget] = useState<'old' | 'new' | null>('old');

  const oldCardRef = useRef<HTMLInputElement | null>(null);
  const newCardRef = useRef<HTMLInputElement | null>(null);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!open) return;

    setOldCard('');
    setNewCard('');
    setOldVerified(false);
    setNewVerified(false);
    setOldCardData(null);
    setNewCardData(null);
    setFocusTarget('old');

    setTimeout(() => {
      oldCardRef.current?.focus();
    }, 100);
  }, [open]);

  useEffect(() => {
    if (focusTarget === 'new') {
      newCardRef.current?.focus();
    }
    if (focusTarget === 'old') {
      oldCardRef.current?.focus();
    }
  }, [focusTarget]);

  const handleOldCardEnter = () => {
    const card = findCard(oldCard);

    if (!card) {
      showSwal('error', 'The card you entered was not found');
      setOldVerified(false);
      return;
    }

    if (!card.is_used) {
      showSwal('error', 'The card you entered has not been used');
      setOldVerified(false);
      return;
    }

    setSnackbar({
      open: true,
      message: 'Card Verified',
      severity: 'success',
    });

    setOldVerified(true);
    setOldCardData(card);
    setFocusTarget('new');
  };

  const handleNewCardEnter = () => {
    const card = findCard(newCard);

    if (!card) {
      showSwal('error', 'New card not found');
      setNewVerified(false);
      return;
    }

    if (card.is_used) {
      showSwal('error', 'Card already in use');
      setNewVerified(false);
      return;
    }

    setNewVerified(true);
    setNewCardData(card);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Change Card Dialog
        <Button
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            background: 'none',
            color: '#000',
          }}
        >
          <IconX />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Box
                sx={{
                  height: 250,
                  bgcolor: 'grey.100',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                {oldVerified && oldCardData ? (
                  <Box textAlign="center">
                    <Typography fontWeight={700} fontSize={24}>
                      {oldCardData.card_number}
                    </Typography>
                    <Typography color="success.main">Verified ✓</Typography>
                  </Box>
                ) : (
                  <Box textAlign="center">
                    <IconCards size={80} stroke={1.5} color="#d8d5d5ff" />
                    <Typography mt={1} fontWeight={600} color="text.secondary">
                      Old Card
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                size="small"
                placeholder="Enter your card"
                inputRef={oldCardRef}
                value={oldCard}
                onChange={(e) => setOldCard(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOldCardEnter()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleOldCardEnter} sx={{ color: 'success.main' }}>
                        <IconCheck size={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, md: 2 }}
            textAlign="center"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ArrowForwardIcon
              sx={{
                fontSize: 40,
                color: 'text.secondary',
                transform: { xs: 'rotate(90deg)', md: 'none' }, // 🔥
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Box
                sx={{
                  height: 250,
                  bgcolor: 'primary.light',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                {newVerified && newCardData ? (
                  <Box textAlign="center">
                    <Typography fontWeight={700} fontSize={24}>
                      {newCardData.card_number}
                    </Typography>
                    <Typography color="success.main">Verified ✓</Typography>
                  </Box>
                ) : (
                  <Box textAlign="center">
                    <IconCards size={80} stroke={1.5} color="#d8d5d5ff" />
                    <Typography mt={1} fontWeight={600} color="text.secondary">
                      New Card
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                size="small"
                placeholder="Enter new card number"
                disabled={!oldCardData}
                inputRef={newCardRef}
                value={newCard}
                onChange={(e) => setNewCard(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewCardEnter()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleNewCardEnter} sx={{ color: 'success.main' }}>
                        <IconCheck size={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          color="warning"
          disabled={!oldVerified || !newVerified}
          onClick={() =>
            onSubmit({
              oldCardData,
              newCardData,
              actionType: 'SWIPE',
            })
          }
        >
          Swipe
        </Button>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={!oldVerified || !newVerified}
          onClick={() =>
            onSubmit({
              oldCardData,
              newCardData,
              actionType: 'GIVE',
            })
          }
        >
          Give
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwipeCardNoCodeDialog;
