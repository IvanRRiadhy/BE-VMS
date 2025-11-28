import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { IconSearch, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { searchVisitor } from 'src/customs/api/operator';
import { useSession } from 'src/customs/contexts/SessionContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: (result: any) => void;
  container: any;
}

const SearchVisitorDialog: React.FC<Props> = ({ open, onClose, onSearch, container }) => {
  const { token } = useSession();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) {
      // Reset semua field dan error ketika dialog ditutup
      setName('');
      setCode('');
      setPlateNumber('');
      setErrorMsg('');
    }
  }, [open]);

  const handleSearch = async () => {
    if (!code.trim() && !name.trim() && !plateNumber.trim()) {
      setErrorMsg('Please enter at least one search field.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      // kirim semua parameter ke API
      const res = await searchVisitor(token as string, {
        code: code.trim(),
        name: name.trim(),
        vehicle_plate_number: plateNumber.trim(),
      });

      const data = res.collection?.data ?? [];
      console.log('data', data);

      if (data.length === 0) {
        setErrorMsg('No visitor found with the given criteria.');
      } else {
        onSearch(data);
        onClose();
      }
    } catch (error) {
      console.error('Error fetching visitor:', error);
      setErrorMsg('Failed to fetch visitor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName('');
    setCode('');
    setPlateNumber('');
    setErrorMsg('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      container={container ?? undefined}
      PaperProps={{
        sx: (theme) => ({
          // default (untuk semua ukuran selain XL)
          position: 'relative',

          // hanya XL
          [theme.breakpoints.up('xl')]: {
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, 0)',
          },
        }),
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconSearch size={20} stroke={1.5} />
        Search Visitor
      </DialogTitle>

      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0, mb: 0.5 }}>
              Name
            </CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter visitor name"
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="code" sx={{ mt: 0, mb: 0.5 }}>
              Code
            </CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter visitor code"
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="plate" sx={{ mt: 0, mb: 0.5 }}>
              Vehicle Plate Number
            </CustomFormLabel>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="Enter vehicle plate number"
            />
          </Box>

          {errorMsg && <Box sx={{ color: 'error.main', fontSize: 14 }}>{errorMsg}</Box>}

          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button variant="outlined" onClick={handleClear}>
              Clear
            </Button>

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchVisitorDialog;
