import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

export default function ExtendVisitDialog({
  open,
  onClose,
  container,
  durationOptions,
  selectedMinutes,
  setSelectedMinutes,
  applyToAll,
  onApplyToAllChange,
  onSubmit,
}: any) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" container={container}>
      <DialogTitle>Extend Visit</DialogTitle>

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
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <form onSubmit={onSubmit}>
          <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="center" sx={{ mb: 2 }}>
            {durationOptions.map((minutes: any) => (
              <Chip
                key={minutes}
                label={`${minutes} min`}
                clickable
                color={selectedMinutes === minutes ? 'primary' : 'default'}
                onClick={() => setSelectedMinutes(minutes)}
                sx={{
                  fontWeight: selectedMinutes === minutes ? 600 : 400,
                  px: 1.5,
                }}
              />
            ))}
          </Box>

          <FormControlLabel
            control={<Checkbox checked={applyToAll} onChange={onApplyToAllChange} />}
            label={
              <Typography variant="body2" color="text.secondary">
                Apply to another visitor
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            fullWidth
            disabled={!selectedMinutes}
          >
            Extend
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
