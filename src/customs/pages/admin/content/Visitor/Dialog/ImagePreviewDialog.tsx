import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';

interface ImagePreviewDialogProps {
  open: boolean;
  image?: string;
  title?: string;
  alt?: string;
  maxHeight?: string | number;
  onClose: () => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  image,
  title = 'Image Preview',
  alt = 'Preview',
  maxHeight = '75vh',
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title}

        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          component="img"
          src={image}
          alt={alt}
          sx={{
            maxWidth: '100%',
            maxHeight: maxHeight,
            borderRadius: 2,
            objectFit: 'contain',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
