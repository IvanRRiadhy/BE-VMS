import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  DialogActions,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';

interface ImageCardProps {
  title: string;
  imageSrc?: string | null;
  emptyText: string;
  isFullscreen?: boolean;
  onClick?: () => void;
}

const ImageCard = ({
  title,
  imageSrc,
  emptyText,
  isFullscreen = false,
  onClick,
}: ImageCardProps) => {
  return (
    <Card
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e0e0e0',
        boxShadow: 1,
      }}
    >
      <CardHeader
        title={title}
        sx={{ p: 0 }}
        slotProps={{
          title: {
            sx: {
              fontSize: '15px !important',
              mb: '2px',
            },
          },
        }}
      />

      <CardContent
        sx={{
          flex: 1,
          p: 0,
          overflow: 'hidden',
          pb: '0 !important',
        }}
      >
        {imageSrc ? (
          <Box
            component="img"
            src={imageSrc}
            alt={title}
            sx={{
              width: '100%',
              maxHeight: '300px',
              height: isFullscreen ? { xs: '250px', md: '100%', xl: '270px' } : '200px',
              borderRadius: '8px',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
            }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
            onClick={onClick}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={isFullscreen ? '100%' : { xs: '200px', md: '100%', xl: '190px' }}
            sx={{
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              color: '#888',
              fontStyle: 'italic',
              fontSize: '0.9rem',
            }}
          >
            {emptyText}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

import { Dialog, DialogContent } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface VisitorImageProps {
  faceImage?: string | null;
  identityImage?: string | null;
  isFullscreen?: boolean;
}

const VisitorImage = ({ faceImage, identityImage, isFullscreen = false }: VisitorImageProps) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  const handleOpen = (src: string, title: string) => {
    setSelectedImage(src);
    setSelectedTitle(title);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };
  return (
    <Grid
      container
      direction="column"
      spacing={1}
      sx={{ height: '100%', flexGrow: 1, flexWrap: 'nowrap' }}
    >
      <Grid sx={{ flex: 1, display: 'flex' }}>
        <ImageCard
          title="Face Image"
          imageSrc={faceImage}
          emptyText="No Face Image"
          isFullscreen={isFullscreen}
          onClick={() => faceImage && handleOpen(faceImage, 'Face Image')}
        />
      </Grid>

      <Grid sx={{ flex: 1, display: 'flex' }}>
        <ImageCard
          title="Identity Image"
          imageSrc={identityImage}
          emptyText="No Identity Image"
          isFullscreen={isFullscreen}
          onClick={() => identityImage && handleOpen(identityImage, 'Identity Image')}
        />
      </Grid>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Preview
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          dividers
        >
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt={selectedTitle}
              sx={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: 2,
                objectFit: 'contain',
                cursor: 'zoom-in',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" fullWidth onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default VisitorImage;
