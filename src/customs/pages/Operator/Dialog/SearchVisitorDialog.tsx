// src/customs/components/operator/SearchVisitorDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface Props {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}

const SearchVisitorDialog: React.FC<Props> = ({ open, onClose, onSearch }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Search Visitor</DialogTitle>
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
        <Box display="flex" flexDirection="column" gap={1} mt={0}>
          {/* Input nama */}
          <Box>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0, mb: 0.5 }}>
              Name
            </CustomFormLabel>
            <TextField fullWidth variant="outlined" size="small" />
          </Box>

          {/* Input kode undangan */}
          <Box>
            <CustomFormLabel htmlFor="code" sx={{ mt: 0, mb: 0.5 }}>
              Code
            </CustomFormLabel>
            <TextField fullWidth variant="outlined" size="small" />
          </Box>

          {/* Input plat kendaraan */}
          <Box>
            <CustomFormLabel htmlFor="plate" sx={{ mt: 0, mb: 0.5 }}>
              Vehicle Plate Number
            </CustomFormLabel>
            <TextField fullWidth variant="outlined" size="small" />
          </Box>

          {/* Tombol aksi */}
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" onClick={() => console.log('clear')}>
              Clear
            </Button>
            <Button variant="contained" onClick={onSearch}>
              Search
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchVisitorDialog;
