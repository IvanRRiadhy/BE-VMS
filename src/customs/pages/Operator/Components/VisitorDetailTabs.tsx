import { Box, Tabs, Tab, Grid2 as Grid, Typography, Button } from '@mui/material';
import { useState } from 'react';
import {
  IconBrandGmail,
  IconPhone,
  IconHome,
  IconGenderMale,
  IconBuildingSkyscraper,
  IconCards,
  IconUsersGroup,
  IconUser,
  IconNumbers,
  IconTicket,
  IconCheckupList,
  IconCar,
  IconLicense,
  IconCalendarEvent,
  IconUserCheck,
  IconCalendarTime,
  IconMapPin,
} from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import moment from 'moment-timezone';
interface Props {
  invitationCode: any[];
  handleChooseCard: () => void;
}

const VisitorDetailTabs: React.FC<Props> = ({ invitationCode, handleChooseCard }) => {
  const [tabValue, setTabValue] = useState(0);
  const data = invitationCode?.[0];

  const formatDateTime = (dateStr?: string, extendMinutes?: number) => {
    if (!dateStr) return '-';

    const baseTime = moment.utc(dateStr);

    // Tambahkan menit hanya kalau ada extend
    if (extendMinutes && extendMinutes > 0) {
      baseTime.add(extendMinutes, 'minutes');
    }

    return baseTime.tz(moment.tz.guess()).format('DD MMM YYYY, HH:mm');
  };

  return (
    <>
      <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)} variant="fullWidth">
        <Tab label="Info" />
        <Tab label="Visit Information" />
        <Tab label="Purpose Visit" />
      </Tabs>

      {/* TAB 1 — INFO */}
      {tabValue === 0 && (
        <Box sx={{ mt: 2 }}>
          <Grid container rowSpacing={4} columnSpacing={2} mt={1}>
            {/* EMAIL */}
            <Grid size={{ xs: 6, md: 6 }}>
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
                    {invitationCode[0]?.visitor?.email || '-'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* PHONE */}
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconPhone />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Phone</CustomFormLabel>
                  <Typography>{data?.visitor?.phone || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* ADDRESS */}
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconHome />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Address</CustomFormLabel>
                  <Typography>{data?.visitor?.address || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* GENDER */}
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconGenderMale />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Gender</CustomFormLabel>
                  <Typography>{data?.visitor?.gender || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* ORGANIZATION */}
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <IconBuildingSkyscraper />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Organization</CustomFormLabel>
                  <Typography>{data?.visitor?.organization || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* CARD */}
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" gap={2} alignItems={'center'}>
                  <IconCards />
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>
                </Box>

                <Box>
                  {/* {data?.card?.length > 0 && data.card[0]?.card_number?.trim() ? (
                    <Typography fontWeight={600}>{data.card[0].card_number}</Typography>
                  // ) 
                  
                  // : data?.visitor_status === 'Checkin' ? (
                  //   <Button variant="contained" onClick={handleChooseCard}>
                  //     Choose Card
                  //   </Button>
                  ) : null} */}
                  {data?.card?.length > 0 &&
                  data.card[data.card.length - 1]?.card_number?.trim() ? (
                    <Typography fontWeight={600}>
                      {data.card[data.card.length - 1].card_number}
                    </Typography>
                  ) : null}

                  {/* <Grid size={{ xs: 6, md: 6 }}>
                            <Box
                              display={'flex'}
                              justifyContent={'space-between'}
                              flexWrap={'wrap'}
                              // alignItems={'center'}
                            >
                              <Box display="flex" gap={2} alignItems="flex-start" flexWrap={'wrap'}>
                                <IconCards />
                                <Box>
                                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Card</CustomFormLabel>
                                </Box>
                              </Box>
                              <Box>
                                {!invitationCode || invitationCode.length === 0 ? (
                                  <></>
                                ) : invitationCode[0]?.card && invitationCode[0].card.length > 0 ? (
                                  invitationCode[0].card[0]?.card_number?.trim() ? (
                                    <Box>
                                      <Typography sx={{ fontWeight: 600 }}>
                                        {invitationCode[0].card[0].card_number}
                                      </Typography> */}

                  {/* {invitationCode[0]?.tracking_ble?.length > 0 &&
                                      invitationCode[0].tracking_ble[0]?.visitor_give_access ===
                                        0 && (
                                        <Button
                                          sx={{ mt: 1 }}
                                          variant="contained"
                                          color="primary"
                                          startIcon={<IconSend width={18} />}
                                        >
                                          Send Tracking
                                        </Button>
                                      )} */}
                  {/* </Box>
                                  ) : (
                                    <></>
                                  )
                                ) : invitationCode[0]?.visitor_status === 'Checkin' ? (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleChooseCard}
                                    sx={{ mt: 0.5 }}
                                  >
                                    Choose Card
                                  </Button>
                                ) : (
                                  <></>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        </Grid> */}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 2 — VISIT INFORMATION */}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Grid container rowSpacing={4} columnSpacing={2}>
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconUsersGroup />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Code</CustomFormLabel>
                  <Typography>{data?.group_code || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconUser />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Group Name</CustomFormLabel>
                  <Typography>{data?.group_name || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconNumbers />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visitor Number</CustomFormLabel>
                  <Typography>{data?.visitor_number || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconTicket />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Invitation Code</CustomFormLabel>
                  <Typography>{data?.invitation_code || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconCheckupList />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Visitor Status</CustomFormLabel>
                  <Typography>{data?.visitor_status || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconCar />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Vehicle Type</CustomFormLabel>
                  <Typography>{data?.vehicle_type || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconLicense />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Vehicle Plate No.</CustomFormLabel>
                  <Typography>{data?.vehicle_plate_number || '-'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 3 — PURPOSE VISIT */}
      {tabValue === 2 && (
        <Box sx={{ mt: 2 }}>
          <Grid container rowSpacing={4} columnSpacing={2}>
            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconCalendarEvent />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Agenda</CustomFormLabel>
                  <Typography>{data?.agenda || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconUserCheck />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>PIC Host</CustomFormLabel>
                  <Typography>{data?.host_name || '-'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconCalendarTime />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Period Start</CustomFormLabel>
                  {formatDateTime(data?.visitor_period_start) || '-'}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconCalendarEvent />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Period End</CustomFormLabel>
                  <Typography>
                    {formatDateTime(data?.visitor_period_end, data?.extend_visitor_period)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 6 }}>
              <Box display="flex" gap={2}>
                <IconMapPin />
                <Box>
                  <CustomFormLabel sx={{ mt: 0, mb: 0.5 }}>Registered Site</CustomFormLabel>
                  <Typography>{data?.site_place_name || '-'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default VisitorDetailTabs;
