// src/customs/components/operator/DetailVisitorDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Divider,
  Grid2 as Grid,
  Tabs,
  Tab,
  Button,
  Avatar,
} from '@mui/material';
import {
  IconBrandGmail,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCalendarTime,
  IconCar,
  IconCards,
  IconCheckupList,
  IconGenderMale,
  IconHome,
  IconLicense,
  IconMapPin,
  IconNumbers,
  IconPhone,
  IconTicket,
  IconUser,
  IconUserCheck,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { Box } from '@mui/system';
import { BASE_URL } from 'src/customs/api/interceptor';
import moment from 'moment';

interface Props {
  open: boolean;
  onClose: () => void;
  visitorData: any[];
}

const DetailVisitorDialog: React.FC<Props> = ({ open, onClose, visitorData }) => {
  const [tabValue, setTabValue] = useState(0);
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return (
      moment
        .utc(dateStr) // data asal UTC
        .tz('Asia/Jakarta') // ubah ke zona waktu Jakarta
        .format('DD MMM YYYY, HH:mm') + ' WIB'
    );
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Detail Visitor</DialogTitle>
      <IconButton sx={{ position: 'absolute', right: '10px', top: '10px' }} onClick={onClose}>
        <IconX />
      </IconButton>
      {/* <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5.8 }}>
            <Typography variant="h5" fontWeight="medium">
              Identity Information
            </Typography>
            <Grid container spacing={2} mt={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Name</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor.name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Email</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Address</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.address || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Phone</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Gender</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {' '}
                <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Organization</CustomFormLabel>
                <Typography variant="body1" fontWeight="medium">
                  {visitorData[0]?.visitor_name || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            sx={{
              display: { xs: 'none', md: 'flex' }, // hanya muncul di layar besar
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
            <Divider orientation="vertical" flexItem />
          </Grid>
          <Grid size={{ xs: 12, md: 5.8 }}>
            <Typography variant="h5" fontWeight="medium" mb={2}>
              History
            </Typography>
            <DynamicTable data={[]} isHaveSearch={true} />
          </Grid>
        </Grid>
      </DialogContent> */}

      <DialogContent dividers>
        <Grid container spacing={2} alignItems={'stretch'} height={'100%'}>
          <Grid size={{ xs: 12, xl: 5 }}>
            <Box>
              {/* Foto Visitor */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={2}
                justifyContent="center"
                sx={{ position: 'relative' }}
              >
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Avatar
                    src={
                      visitorData[0]?.selfie_image
                        ? `${BASE_URL}/cdn${visitorData[0].selfie_image}`
                        : ''
                    }
                    alt="visitor"
                    sx={{ width: 100, height: 100 }}
                  />
                  <Typography variant="h5" mt={2}>
                    {visitorData[0]?.visitor?.name || '-'}
                  </Typography>
                </Box>

                {/* <Button
                  variant="contained"
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => setOpenRelated(true)}
                >
                  Related
                </Button> */}
              </Box>

              {/* Tabs */}
              <Tabs
                value={tabValue}
                onChange={(e, newVal) => setTabValue(newVal)}
                variant="fullWidth"
              >
                <Tab label="Info" />
                <Tab label="Visit Information" />
                <Tab label="Purpose Visit" />
              </Tabs>

              {/* Tab Panels */}
              {tabValue === 0 && (
                <Box sx={{ mt: 2 }}>
                  {/* Grid Info Visitor */}
                  <Grid container rowSpacing={4} columnSpacing={2} mt={1}>
                    {/* Email */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconBrandGmail />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Email</CustomFormLabel>
                          <Typography
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal',
                            }}
                          >
                            {visitorData[0]?.visitor?.email || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Phone */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconPhone />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Phone</CustomFormLabel>
                          <Typography
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal',
                            }}
                          >
                            {visitorData[0]?.visitor?.phone || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Address */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconHome />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Address</CustomFormLabel>
                          <Typography
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal',
                            }}
                          >
                            {visitorData[0]?.visitor?.address || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Gender */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconGenderMale />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Gender</CustomFormLabel>
                          <Typography>{visitorData[0]?.visitor?.gender || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Organization */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconBuildingSkyscraper />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Organization</CustomFormLabel>
                          <Typography
                            sx={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal',
                            }}
                          >
                            {visitorData[0]?.visitor?.organization || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Card */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconCards />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>

                          <Typography>{visitorData[0]?.card[0]?.card_number}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container rowSpacing={4} columnSpacing={2}>
                    {/* Group Code */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconUsersGroup />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Code</CustomFormLabel>
                          <Typography>{visitorData[0]?.group_code || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Group Name */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconUser />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Name</CustomFormLabel>
                          <Typography>{visitorData[0]?.group_name || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Visitor Number */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconNumbers />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visitor Number</CustomFormLabel>
                          <Typography>{visitorData[0]?.visitor_number || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Invitation Code */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconTicket />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Invitation Code</CustomFormLabel>
                          <Typography>{visitorData[0]?.invitation_code || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Visitor Status */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconCheckupList />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                            <Typography>{visitorData[0]?.visitor_status || '-'}</Typography> Visitor
                            Status
                          </CustomFormLabel>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Vehicle Type */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconCar />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Vehicle Type</CustomFormLabel>
                          <Typography>{visitorData[0]?.vehicle_type || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Vehicle Plate No. */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconLicense />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>
                            Vehicle Plate No.
                          </CustomFormLabel>
                          <Typography>{visitorData[0]?.vehicle_plate_number || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container rowSpacing={4} columnSpacing={2}>
                    {/* Agenda */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconCalendarEvent />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Agenda</CustomFormLabel>
                          <Typography>{visitorData[0]?.agenda || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* PIC Host */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconUserCheck />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0 }}>PIC Host</CustomFormLabel>
                          <Typography>{visitorData[0]?.host_name || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Period Start */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconCalendarTime />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Period Start</CustomFormLabel>
                          <Typography>
                            {formatDateTime(visitorData[0]?.visitor_period_start)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Period End */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconCalendarEvent />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Period End</CustomFormLabel>
                          <Typography>
                            {formatDateTime(visitorData[0]?.visitor_period_end)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Registered Site */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <IconMapPin />
                        <Box>
                          <CustomFormLabel sx={{ mt: 0, mb: 0 }}>Registered Site</CustomFormLabel>
                          <Typography>{visitorData[0]?.site_place_name || '-'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid
            display={{ xs: 'none', md: 'flex' }}
            justifyContent="center"
            alignItems="stretch"
            sx={{ px: 1 }}
          >
            <Divider orientation="vertical" flexItem />
          </Grid>
          <Grid
            size={{ xs: 12, xl: 6 }}
            display="flex"
            justifyContent="center"
            // alignItems="center"
            sx={{ textAlign: 'center' }}
          >
            <Box sx={{ width: '100%' }}>
              <DynamicTable
                data={[]}
                isHaveSearch={false}
                isHaveHeaderTitle={true}
                titleHeader="History"
              />
              {/* <DynamicTable
                data={accessData}
                isHaveHeaderTitle={true}
                titleHeader="Access"
                isNoActionTableHead={true}
                isHavePagination={false}
                overflowX="auto"
                isHaveApproval={false}
                isHaveAction={true}
                isHaveAccess={true}
                isHaveChecked={true}
                onAccessAction={handleAccessAction}
              /> */}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default DetailVisitorDialog;
