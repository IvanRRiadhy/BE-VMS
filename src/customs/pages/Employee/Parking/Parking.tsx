// import { Grid2 as Grid, Typography } from '@mui/material';
// import { Box } from '@mui/system';
// import { IconCar } from '@tabler/icons-react';
// import React from 'react';
// import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
// import { DynamicTable } from 'src/customs/components/table/DynamicTable';

// const Parking = () => {
//

//   return (
//     <PageContainer title="Parking" description="Parking page">
//       <Box>
//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, lg: 12 }}>
//             <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
//           </Grid>
//           <Grid size={{ xs: 12, lg: 12 }}>
//             {/* {isDataReady ? ( */}
//             <DynamicTable
//               overflowX={'auto'}
//               data={[]}
//               isHavePagination={true}
//               // selectedRows={selectedRows}
//               // defaultRowsPerPage={rowsPerPage}
//               rowsPerPageOptions={[10, 20, 100]}
//               // onPaginationChange={(page, rowsPerPage) => {
//               //   setPage(page);
//               //   setRowsPerPage(rowsPerPage);
//               // }}
//               isHaveChecked={true}
//               isHaveAction={true}
//               isHaveSearch={true}
//               isHaveFilter={true}
//               isHaveExportPdf={false}
//               isHaveExportXlf={false}
//               isHaveFilterDuration={false}
//               isHaveAddData={false}
//               isHaveFilterMore={false}
//               isHaveHeader={false}
//               isHavePdf={false}
//             />
//           </Grid>
//         </Grid>
//       </Box>
//     </PageContainer>
//   );
// };

// export default Parking;



import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Menu,
  MenuItem,
  Select,
  FormControl,
  Pagination,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  IconCar,
  IconSearch,
  IconCalendar,
  IconRefresh,
  IconDotsVertical,
  IconClock,
  IconMapPin,
  IconId,
  IconDoorEnter,
  IconX,
  IconCheck,
  IconHistory,
} from '@tabler/icons-react';

import PageContainer from 'src/components/container/PageContainer';

interface ParkingActivity {
  id: number;
  name: string;
  nip: string;
  plate: string;
  gate: string;
  time: string;
  date: string;
  duration: string;
  status: 'Waiting' | 'Completed' | 'Rejected';
  slot?: string;
  accessType: string;
}

const initialData: ParkingActivity[] = [
  {
    id: 1,
    name: 'Budi Santoso',
    nip: '102345',
    plate: 'B 1234 KLM',
    gate: 'Gate P1 - Masuk',
    time: '09:42:31',
    date: '26 Nov 2026',
    duration: '2 jam 14 menit',
    status: 'Waiting',
    slot: 'P1 - A-015',
    accessType: 'Parking Pegawai (Otomatis)',
  },
  {
    id: 2,
    name: 'Rina Amalia',
    nip: '102346',
    plate: 'B 5678 ZXY',
    gate: 'Gate P1 - Masuk',
    time: '07:15:08',
    date: '26 Nov 2026',
    duration: '4 jam 36 menit',
    status: 'Completed',
    slot: 'P1 - A-016',
    accessType: 'Parking Pegawai (Otomatis)',
  },
  {
    id: 3,
    name: 'Dedi Pratama',
    nip: '102347',
    plate: 'B 9012 ABC',
    gate: 'Gate P2 - Masuk',
    time: '13:20:17',
    date: '25 Nov 2026',
    duration: '3 jam 12 menit',
    status: 'Completed',
    slot: 'P2 - B-010',
    accessType: 'Parking Pegawai (Otomatis)',
  },
  {
    id: 4,
    name: 'Siti Rahayu',
    nip: '102348',
    plate: 'B 3456 DEF',
    gate: 'Gate P1 - Masuk',
    time: '08:58:10',
    date: '26 Nov 2026',
    duration: '5 jam 27 menit',
    status: 'Completed',
    slot: 'P1 - A-020',
    accessType: 'Parking Pegawai (Otomatis)',
  },
];

const Parking = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const cards = [
    {
      title: 'Total Parking',
      subTitle: `4`,
      subTitleSetting: 10,
      icon: IconCar,
      color: 'none',
    },
  ];
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Activity detail ditampilkan hanya setelah user memilih menu
  const [selectedActivity, setSelectedActivity] =
    useState<ParkingActivity | null>(null);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuActivity, setMenuActivity] =
    useState<ParkingActivity | null>(null);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.nip.toLowerCase().includes(keyword) ||
        item.plate.toLowerCase().includes(keyword);

      const matchesLocation =
        location === 'all' ||
        item.gate.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  }, [data, search, location]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage),
  );

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const waitingCount = data.filter(
    (item) => item.status === 'Waiting',
  ).length;

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    item: ParkingActivity,
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuActivity(item);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleViewActivity = () => {
    if (menuActivity) {
      setSelectedActivity(menuActivity);
    }
    handleCloseMenu();
  };

  const handleCloseActivity = () => {
    setSelectedActivity(null);
  };

  const handleParkingAction = (status: 'Completed' | 'Rejected') => {
    if (!selectedActivity) return;

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedActivity.id
          ? { ...item, status }
          : item,
      ),
    );

    setSelectedActivity({
      ...selectedActivity,
      status,
    });
  };

  const getStatus = (status: ParkingActivity['status']) => {
    const config = {
      Waiting: {
        label: 'Menunggu',
        color: 'warning' as const,
      },
      Completed: {
        label: 'Selesai',
        color: 'success' as const,
      },
      Rejected: {
        label: 'Ditolak',
        color: 'error' as const,
      },
    };

    return (
      <Chip
        size="small"
        label={config[status].label}
        color={config[status].color}
        sx={{
          fontWeight: 600,
          borderRadius: '8px',
          minWidth: 85,
        }}
      />
    );
  };

  return (
    <PageContainer
      title="Riwayat Parkir"
      description="Parking activity history"
    >
      <Box>

        {/* HEADER */}
        {/* <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconHistory size={27} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                Riwayat Parkir
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data aktivitas parkir berdasarkan tap gate.
              </Typography>
            </Box>
          </Stack>
        </Stack> */}

        {/* MAIN CONTENT */}
        <Grid container spacing={2.5} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>

          {/* HISTORY TABLE */}
          <Grid size={{ xs: 12, md: selectedActivity ? 8 : 12 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 1 }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>

                {/* FILTER */}
                <Grid container spacing={1.5} mb={2.5}>
                  <Grid size={{ xs: 12, sm: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Cari nama, NIP, atau plat nomor..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconSearch size={19} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCalendar size={18} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 5, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setPage(1);
                        }}
                      >
                        <MenuItem value="all">Semua Lokasi</MenuItem>
                        <MenuItem value="Gate P1">Gate P1</MenuItem>
                        <MenuItem value="Gate P2">Gate P2</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 1, md: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      sx={{ height: 40, minWidth: 0 }}
                      onClick={() => {
                        setSearch('');
                        setLocation('all');
                        setPage(1);
                      }}
                    >
                      <IconRefresh size={20} />
                    </Button>
                  </Grid>
                </Grid>

                {/* TABLE */}
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 850 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: 'action.hover',
                          '& th': {
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={
                              paginatedData.length > 0 &&
                              paginatedData.every((item) =>
                                selectedRows.includes(item.id),
                              )
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows((prev) => [
                                  ...new Set([
                                    ...prev,
                                    ...paginatedData.map((item) => item.id),
                                  ]),
                                ]);
                              } else {
                                setSelectedRows((prev) =>
                                  prev.filter(
                                    (id) =>
                                      !paginatedData.some(
                                        (item) => item.id === id,
                                      ),
                                  ),
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>Waktu Tap</TableCell>
                        <TableCell>Pegawai</TableCell>
                        <TableCell>Plat Nomor</TableCell>
                        <TableCell>Lokasi Gate</TableCell>
                        <TableCell>Aksi</TableCell>
                        <TableCell>Durasi</TableCell>
                        <TableCell align="center">Aksi</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedData.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          selected={selectedActivity?.id === item.id}
                          sx={{
                            '& td': { whiteSpace: 'nowrap' },
                            cursor: 'pointer',
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={selectedRows.includes(item.id)}
                              onChange={(e) => {
                                setSelectedRows((prev) =>
                                  e.target.checked
                                    ? [...prev, item.id]
                                    : prev.filter((id) => id !== item.id),
                                );
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={700} variant="body2">
                              {item.time}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.date}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: 'primary.light',
                                  color: 'primary.main',
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                {item.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')}
                              </Avatar>
                              <Box>
                                <Typography
                                  fontWeight={600}
                                  variant="body2"
                                >
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  NIP {item.nip}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={item.plate}
                              variant="outlined"
                              sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {item.gate}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {getStatus(item.status)}
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {item.duration}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, item)}
                            >
                              <IconDotsVertical size={19} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                      {paginatedData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Box py={5}>
                              <IconCar
                                size={40}
                                color={theme.palette.text.disabled}
                              />
                              <Typography color="text.secondary" mt={1}>
                                Tidak ada data parkir.
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* PAGINATION */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  mt={3}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign={{ xs: 'center', sm: 'left' }}
                  >
                    Menampilkan{' '}
                    {filteredData.length === 0
                      ? 0
                      : (page - 1) * rowsPerPage + 1}
                    –
                    {Math.min(page * rowsPerPage, filteredData.length)} dari{' '}
                    {filteredData.length} data
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    flexWrap="wrap"
                    justifyContent="center"
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                      siblingCount={isMobile ? 0 : 1}
                    />

                    {/* <FormControl size="small" sx={{ minWidth: 85 }}>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                      >
                        {[10, 20, 100].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value} / halaman
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl> */}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* ACTIVITY DETAIL - RIGHT SIDE */}
          {selectedActivity && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  position: { md: 'sticky' },
                  top: 20,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* HEADER */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2.5}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      Activity Parking
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={handleCloseActivity}
                    >
                      <IconX size={21} />
                    </IconButton>
                  </Stack>

                  <Divider sx={{ mb: 2.5 }} />

                  {/* EMPLOYEE */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    mb={3}
                  >
                    <Avatar
                      sx={{
                        width: 54,
                        height: 54,
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      {selectedActivity.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </Avatar>

                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={700}>
                        {selectedActivity.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        NIP {selectedActivity.nip}
                      </Typography>
                    </Box>

                    {getStatus(selectedActivity.status)}
                  </Stack>

                  {/* DETAIL INFORMATION */}
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5}>
                      <IconCar size={24} color={theme.palette.text.secondary} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Plat Nomor
                        </Typography>
                        <Typography fontWeight={700}>
                          {selectedActivity.plate}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                      <IconDoorEnter
                        size={24}
                        color={theme.palette.text.secondary}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Lokasi Gate
                        </Typography>
                        <Typography fontWeight={700}>
                          {selectedActivity.gate}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                      <IconClock
                        size={24}
                        color={theme.palette.text.secondary}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Waktu Tap
                        </Typography>
                        <Typography fontWeight={700}>
                          {selectedActivity.date} {selectedActivity.time}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                      <IconId
                        size={24}
                        color={theme.palette.text.secondary}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tipe Akses
                        </Typography>
                        <Typography fontWeight={700}>
                          {selectedActivity.accessType}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        bgcolor: 'success.light',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <IconMapPin
                        size={24}
                        color={theme.palette.success.dark}
                      />
                      <Box flex={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Slot Parkir (Jika Tersedia)
                        </Typography>
                        <Typography fontWeight={700}>
                          {selectedActivity.slot || 'Belum ditentukan'}
                        </Typography>
                      </Box>
                      <IconCheck
                        size={22}
                        color={theme.palette.success.dark}
                      />
                    </Box>
                  </Stack>

                  {/* ACTION BUTTONS */}
                  {selectedActivity.status === 'Waiting' && (
                    <>
                      <Divider sx={{ my: 2.5 }} />

                      <Stack spacing={1.5}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<IconDoorEnter size={19} />}
                          onClick={() => handleParkingAction('Completed')}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                          }}
                        >
                          Buka Palang Parkir
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="large"
                          startIcon={<IconX size={19} />}
                          onClick={() => handleParkingAction('Rejected')}
                          sx={{
                            py: 1.3,
                            borderRadius: 2,
                            fontWeight: 700,
                          }}
                        >
                          Tolak Akses
                        </Button>
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* ROW ACTION MENU */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleViewActivity}>
            Lihat Activity Parking
          </MenuItem>
        </Menu>
      </Box>
    </PageContainer>
  );
};

export default Parking;
