import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid2 as Grid,
  IconButton,
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
                xl: 190,
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
import { IconX } from '@tabler/icons-react';

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
  recordsFiltered?: any;
  captureVehicle?: any;
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
  recordsFiltered,
  captureVehicle,
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

  const visiblePurposes = todayVisitingPurpose?.slice(0, 4) ?? [];
  const remainingCount = Math.max((todayVisitingPurpose?.length ?? 0) - 4, 0);

  const [openAllPurpose, setOpenAllPurpose] = useState(false);
  const handleOpenAllVisitingPurpose = () => {
    setOpenAllPurpose(true);
  };

  const handleCloseAllVisitingPurpose = () => {
    setOpenAllPurpose(false);
  };

  const visitorTypeDefaults = [
    {
      id: 'general-visitor',
      name: 'General Visitor',
      background: '#E8F3FF',
      text: '#2F80ED',
    },
    {
      id: 'all-access-vip',
      name: 'All Access (VIP)',
      background: '#FFF4D6',
      text: '#B77900',
    },

    {
      id: 'staff',
      name: 'Staff',
      background: '#EAF8F1',
      text: '#249B62',
    },
    {
      id: 'remise',
      name: 'Remise',
      background: '#FFF6E5',
      text: '#D99000',
    },
    {
      id: 'utility-maintenance',
      name: 'Utility Maintenance',
      background: '#F1EDFF',
      text: '#7257C7',
    },
    {
      id: 'perkasan',
      name: 'Perkasan',
      background: '#EAF7F7',
      text: '#168B8B',
    },
    {
      id: 'office-dku',
      name: 'Office DKU',
      background: '#E8F1FB',
      text: '#3B6EA5',
    },
  ];

  const visiblePurposess = visitorTypeDefaults
    .map((type) => {
      const item = todayVisitingPurpose?.find(
        (item: any) => item.name?.toLowerCase() === type.name.toLowerCase(),
      );

      return {
        ...type,
        count: item?.count ?? 0,
        originalData: item,
      };
    })
    .slice(0, 4);

  const allVisitorTypes = visitorTypeDefaults.map((type) => {
    const item = todayVisitingPurpose?.find(
      (item: any) => item.name?.toLowerCase() === type.name.toLowerCase(),
    );

    return {
      ...type,
      count: item?.count ?? 0,
      originalData: item,
    };
  });

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
      <Card
        sx={{ backgroundColor: 'background.paper', p: 2, borderRadius: 1.5 }}
        id="tour-occupancy"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Visitor Type
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
          {visiblePurposes.length > 0 ? (
            <>
              {visiblePurposess.map((item: any) => {
                return (
                  <Grid size={{ xs: 12, lg: 6 }} key={item.id}>
                    <Card
                      sx={{
                        flex: 1,
                        p: 0,
                        borderRadius: 2,
                        backgroundColor: item.background,
                        color: item.text,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.1)',
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => handleOpenDetailVistingPurpose(item)}
                    >
                      <CardContent sx={{ p: '15px !important' }}>
                        <Typography fontWeight={600}>{item.name}</Typography>

                        <Typography variant="h4" fontWeight="bold" mt={1}>
                          {item.count}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}

              {/* {remainingCount > 0 && (
                <Grid size={12}>
                  <Button fullWidth variant="outlined" onClick={handleOpenAllVisitingPurpose}>
                    View All ({todayVisitingPurpose.length})
                  </Button>
                </Grid>
              )} */}
              {visitorTypeDefaults.length > 4 && (
                <Grid size={12}>
                  <Button fullWidth variant="outlined" onClick={handleOpenAllVisitingPurpose}>
                    View All
                  </Button>
                </Grid>
              )}
            </>
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
      <Grid id="tour-identity-image">
        <ImageCard
          title="Identity Image"
          imageSrc={identityImage}
          emptyText="No Identity Image"
          isFullscreen={isFullscreen}
          onClick={() => identityImage && handleOpen(identityImage, 'Identity Image')}
        />
      </Grid>
      <Grid sx={{ flex: 1, display: 'flex', height: '100%' }}>
        <ImageCard
          title="Capture Vehicle"
          imageSrc={captureVehicle}
          emptyText="No Capture Vehicle"
          isFullscreen={isFullscreen}
          onClick={() => captureVehicle && handleOpen(captureVehicle, 'Capture Vehicle')}
        />
        {/* <AlertCard
          isFullscreen={isFullscreen}
          title="Alerts"
          data={alertData || []}
          onViewAll={() => setOpenAlertDialog(true)}
          onItemClick={(item) => console.log(item)}
        /> */}
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
      <Dialog open={openAllPurpose} onClose={handleCloseAllVisitingPurpose} maxWidth="md" fullWidth>
        <DialogTitle>
          Visitor Type
          <IconButton
            aria-label="close"
            onClick={handleCloseAllVisitingPurpose}
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

        <DialogContent dividers>
          <Grid container spacing={2}>
            {allVisitorTypes.map((item: any) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
                <Card
                  sx={{
                    backgroundColor: item.background,
                    color: item.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => {
                    handleCloseAllVisitingPurpose();
                    handleOpenDetailVistingPurpose({
                      ...item,
                      ...(item.originalData ?? {}),
                      count: item.count,
                    });
                  }}
                >
                  <CardContent>
                    <Typography fontWeight={600}>{item.name}</Typography>

                    <Typography variant="h4" fontWeight="bold">
                      {item.count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default VisitorImage;
