import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Grid2 as Grid,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Box } from '@mui/system';
import { IconDoor, IconSearch, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { showSwal } from 'src/customs/components/alerts/alerts';

export default function TriggeredAccessDialog({ open, onClose }: any) {
  const data = [
    { id: 1, access_name: 'Access 1' },
    { id: 2, access_name: 'Access 2' },
    { id: 3, access_name: 'Access 3' },
    { id: 4, access_name: 'Access 4' },
    { id: 5, access_name: 'Access 5' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [openConfirmationDialog, setOpenConfirmationnDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // ⏳ debounce search 400ms
  useEffect(() => {
    const delay = setTimeout(() => {
      setFilteredData(
        data.filter((item) => item.access_name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleConfirmDialogAccess = async () => {
    const resConfirm = await showSwal('confirm', 'Do you want to open this access?');

    if (resConfirm) {
      setSelectedCard(null);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>Open Access</DialogTitle>
        <IconButton
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={onClose}
        >
          <IconX />
        </IconButton>
        <Divider />
        <DialogContent>
          <Box mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Name Access Control"
              variant="outlined"
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

          <Grid container spacing={2}>
            {filteredData.map((card) => {
              const isChosen = selectedCard === card.id;

              return (
                <Grid key={card.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Paper
                    onClick={() => {
                      setSelectedCard(card.id);
                      handleConfirmDialogAccess();
                    }}
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 2,
                      height: 250,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isChosen ? theme.palette.primary.main : 'divider',
                      backgroundColor: isChosen ? theme.palette.primary.light : 'background.paper',
                      boxShadow: isChosen ? theme.shadows[8] : theme.shadows[2],
                      transition: theme.transitions.create(
                        ['transform', 'box-shadow', 'background-color', 'border-color'],
                        { duration: theme.transitions.duration.shorter },
                      ),
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: theme.shadows[6],
                        backgroundColor: isChosen
                          ? theme.palette.primary.main
                          : theme.palette.action.hover,
                        borderColor: theme.palette.primary.main,
                      },
                    })}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'brown',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconDoor size={40} color="white" />
                    </Box>
                    <Typography variant="h4" textAlign="center">
                      {card.access_name}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}
