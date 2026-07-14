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
import { IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { searchVisitor } from 'src/customs/api/operator';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: (result: any) => void;
  container: any;
}

const SearchVisitorDialog: React.FC<Props> = ({ open, onClose, onSearch, container }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
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
      const res = await searchVisitor( {
        code: code.trim(),
        name: name.trim(),
        vehicle_plate_number: plateNumber.trim(),
      });

      const data = res.collection?.data ?? [];

      if (data.length === 0) {
        setErrorMsg('No visitor found with the given criteria.');
      } else {
        onSearch(data);
        onClose();
      }
    } catch (error) {
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
          position: 'relative',
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
        {t('searchVisitor')}
      </DialogTitle>

      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0, mb: 0.5 }}>
              {t('name')}
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
              {t('code')}
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
              {t('vehiclePlateNumber')}
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

          <Box display="flex" justifyContent="flex-end" gap={0.5} mt={1}>
            <Button variant="contained" color="error" onClick={handleClear} startIcon={<IconX />}>
              Clear
            </Button>

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconSearch />}
            >
              {loading ? 'Searching...' : t('search')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchVisitorDialog;
