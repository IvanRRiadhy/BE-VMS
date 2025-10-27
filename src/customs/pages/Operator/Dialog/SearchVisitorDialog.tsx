// src/customs/components/operator/SearchVisitorDialog.tsx
import React, { useState } from 'react';
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
import { getInvitationCode } from 'src/customs/api/operator';
import { useSession } from 'src/customs/contexts/SessionContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: (result: any) => void;
}

const SearchVisitorDialog: React.FC<Props> = ({ open, onClose, onSearch }) => {
  const { token } = useSession();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async () => {
    if (!code.trim()) {
      setErrorMsg('Please enter a visitor code.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await getInvitationCode(token as string, code.trim());
      const data = res.collection?.data ?? [];

      if (data.length === 0) {
        setErrorMsg('Visitor code not found.');
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
      // bisa aktifkan kalau mau di atas, bukan tengah
      // PaperProps={{
      //   sx: {
      //     position: 'absolute',
      //     top: '10%',
      //     left: '50%',
      //     transform: 'translate(-50%, 0)',
      //   },
      // }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconSearch size={20} stroke={1.5} />
        Search Visitor
      </DialogTitle>

      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: '10px',
          top: '10px',
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {/* Input nama */}
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

          {/* Input kode undangan */}
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

          {/* Input plat kendaraan */}
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

          {/* Tombol aksi */}
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
