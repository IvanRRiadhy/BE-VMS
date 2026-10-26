import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  MenuItem,
  IconButton,
  Box,
  Select,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { axiosInstance2 } from 'src/customs/api/interceptor';

export interface GroupScanPreview {
  id: string;
  documentType: 'ktp' | 'passport';
  selected: boolean;

  data: {
    name?: string;
    gender?: string;
    indentity_id?: string;
    document_image_url?: string;
  };

  image?: {
    base64?: string;
    cdn_url?: string;
  };
}

import { styled, keyframes } from '@mui/material/styles';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8,
  color: theme.palette.grey[500],
}));

export default function GroupScanPreviewDialog({
  open,
  data,
  onClose,
  onApply,
  onToggle,
  onChangeType,
}: {
  open: boolean;
  data: GroupScanPreview[];
  onClose: () => void;
  onApply: () => void;
  onToggle: (id: string) => void;
  onChangeType: (id: string, type: 'ktp' | 'passport') => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Scan Preview (Group)</DialogTitle>
      <CloseButton onClick={onClose}>
        <IconX />
      </CloseButton>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {data.map((item) => {
            const imageSrc = item.image?.base64
              ? item.image.base64
              : item.image?.cdn_url
                ? `${axiosInstance2.defaults.baseURL}/cdn${item.image.cdn_url}`
                : 'https://dummyimage.com/400x250/e0e0e0/666&text=No+Image';

            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderColor: item.selected ? 'primary.main' : 'divider',
                    boxShadow: item.selected ? 3 : 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => onToggle(item.id)}
                >
                  {/* IMAGE */}
                  <CardMedia component="img" height="160" image={imageSrc} alt="Document preview" />

                  <CardContent>
                    {/* HEADER */}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Chip
                        label={item.documentType.toUpperCase() || '-'}
                        color="primary"
                        size="small"
                      />
                      <Checkbox
                        checked={item.selected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => onToggle(item.id)}
                      />
                    </Box>
                    <CustomSelect
                      size="small"
                      value={item.documentType}
                      onClick={(e: any) => e.stopPropagation()} 
                      onChange={(e: any) => {
                        e.stopPropagation(); 
                        onChangeType(item.id, e.target.value as 'ktp' | 'passport');
                      }}
                      fullWidth
                    >
                      <MenuItem value="ktp">KTP</MenuItem>
                      <MenuItem value="passport">Passport</MenuItem>
                    </CustomSelect>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}

          {data.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                No scan result available
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onApply} disabled={!data.some((d) => d.selected)}>
          Apply to Visitor Form
        </Button>
      </DialogActions>
    </Dialog>
  );
}
