import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid2 as Grid,
  MenuItem,
  Select,
  Typography,
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
        // flex: 1,
        // display: 'flex',
        // flexDirection: 'column',
        display: 'block',
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
              fontSize: '16px !important',
              mb: '8px',
              fontWeight: 'bold',
            },
          },
        }}
      />

      <CardContent
        sx={{
          p: 0,
          overflow: 'hidden',
          '&:last-child': {
            pb: 0,
          },
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

              // height: isFullscreen ? { xs: '250px', md: '100%', xl: '270px' } : '250px',
              height: {
                xs: 250,
                md: 190,
                xl: 200,
              },
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
            sx={{
              width: '100%',
              minHeight: {
                xs: 120,
                md: 150,
                xl: 180,
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
              borderRadius: 2,
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

import { Fragment, useState } from 'react';
import VisitingPurposeDialog from '../Dialog/VisitingPurposeDialog';
import PreviewImageDialog from '../Dialog/PreviewImageDialog';
import AlertCard from './AlertCard';

interface VisitorImageProps {
  faceImage?: string | null;
  identityImage?: string | null;
  isFullscreen?: boolean;
  openMore?: any;
  setOpenMore?: any;
  handleOpenMore?: any;
  handleOpenDetailVistingPurpose?: any;
  getColorByName?: any;
  todayVisitingPurpose?: any;
}



const VisitorImage = ({
  faceImage,
  identityImage,
  isFullscreen = false,
  openMore,
  setOpenMore,
  handleOpenMore,
  handleOpenDetailVistingPurpose,
  getColorByName,
  todayVisitingPurpose,
}: VisitorImageProps) => {
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
  };
  const [alertData, setAlertData] = useState<any[]>([]);

  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  return (
    <Grid
      container
      direction="column"
      spacing={1}
      sx={{ height: '60%', flexGrow: 1, flexWrap: 'nowrap' }}
    >
      {/* <Grid sx={{ flex: 1, display: 'flex' }}>
          <ImageCard
            title="Face Image"
            imageSrc={faceImage}
            emptyText="No Face Image"
            isFullscreen={isFullscreen}
            onClick={() => faceImage && handleOpen(faceImage, 'Face Image')}
          />
        </Grid> */}{' '}
      <Card sx={{ backgroundColor: 'background.paper', p: 2, borderRadius: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Live Occupancy
          </Typography>

          <FormControl size="small">
            <Select
              defaultValue="today"
              sx={{
                minWidth: 120,
                borderRadius: 2,
              }}
            >
              <MenuItem value="today">Today</MenuItem>
              {/* <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem> */}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={2} mt={2}>
          {todayVisitingPurpose?.length > 0 ? (
            todayVisitingPurpose.map((item: any) => (
              <Grid size={{ xs: 12, lg: 6 }} key={item.id}>
                <Card
                  sx={{
                    flex: 1,
                    p: 0,
                    borderRadius: 1,
                    background: getColorByName(item.name),
                    boxShadow: '0 6px 14px rgba(93, 135, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 18px rgba(93, 135, 255, 0.45)',
                    },
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOpenDetailVistingPurpose(item)}
                >
                  <CardContent sx={{ p: '15px !important', color: '#fff', }}>
                    <Typography fontWeight={600}>{item.name}</Typography>

                    <Typography variant="h4" fontWeight="bold" mt={1}>
                      {item.count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Card
                variant="outlined"
                sx={{
                  py: 5,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                }}
              >
                <Typography color="text.secondary">No visiting purpose available.</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Card>
      <Grid>
        <ImageCard
          title="Identity Image"
          imageSrc={identityImage}
          emptyText="No Identity Image"
          isFullscreen={isFullscreen}
          onClick={() => identityImage && handleOpen(identityImage, 'Identity Image')}
        />
      </Grid>
      <Grid sx={{ flex: 1, display: 'flex', height: '100%' }}>
        <AlertCard
          isFullscreen={isFullscreen}
          title="Alerts"
          data={alertData || []}
          onViewAll={() => setOpenAlertDialog(true)}
          onItemClick={(item) => console.log(item)}
        />
      </Grid>
      <PreviewImageDialog
        open={open}
        image={selectedImage}
        title={selectedTitle}
        onClose={handleClose}
      />
      <VisitingPurposeDialog
        open={openMore}
        onClose={() => setOpenMore(false)}
        data={todayVisitingPurpose}
      />
    </Grid>
  );
};

export default VisitorImage;
