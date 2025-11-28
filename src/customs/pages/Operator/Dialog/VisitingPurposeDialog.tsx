import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  DialogActions,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

export default function VisitingPurposeDialog({ open, onClose, data }: any) {
  function getColorByName(name: string) {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);

    return `hsl(${hue}, 70%, 55%)`; // solid warna, tidak gradient
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detail Visiting Purposes</DialogTitle>
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
        <Grid container spacing={2}>
          {data.map((item: any) => (
            <Grid key={item.id} item xs={12}>
              <Card
                sx={{
                  p: 1,
                  borderRadius: 1,
                  background: getColorByName(item.name),
                  boxShadow: '0 6px 14px rgba(93, 135, 255, 0.3)',
                }}
              >
                <CardContent
                  sx={{
                    px: 2,
                    // py: 1,
                    py: '10px !important',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h5" color="white">
                    {item.name}
                  </Typography>
                  <Typography variant="h5" color="white">
                    {item.count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
