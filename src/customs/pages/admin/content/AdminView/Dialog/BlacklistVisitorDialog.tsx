import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
} from '@mui/material';
import { IconX, IconUserX, IconClock } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getOperatorBlacklist } from 'src/customs/api/operator';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';

export default function BlacklistVisitorDialog({ open, onClose }: any) {

  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDir, setSortDir] = useState('desc');
  const [sortColumn, setSortColumn] = useState('id');
  const [searchKeyword, setSearchKeyword] = useState('');
  // const [totalActive, setTotalActive] = useState(0);
  // const [totalNonActive, setTotalNonActive] = useState(0);

  // const [blacklistData, setBlacklistData] = useState<any>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const start = page * rowsPerPage;
  //       const res = await getOperatorBlacklist(
  //         token as string,
  //         start,
  //         sortDir,
  //         rowsPerPage,
  //         searchKeyword || '',
  //       );
  //       let rows = res.collection.map((item: any) => {
  //         return {
  //           id: item.id,
  //           name: item.visitor.name || '-',
  //           phone: item.visitor.phone || '-',
  //           reason: item.reason || '-',
  //           is_active: item.is_active,
  //           approved_by: item.approved_by_name || '-',
  //         };
  //       });

  //       const activeCount = rows.filter((x: any) => x.is_active).length;
  //       const nonActiveCount = rows.filter((x: any) => !x.is_active).length;
  //       setTotalActive(activeCount);
  //       setTotalNonActive(nonActiveCount);

  //       setBlacklistData(rows ?? []);
  //     } catch (error) {}
  //   };

  //   fetchData();
  // }, [token, page, rowsPerPage, sortDir, searchKeyword]);


    const start = page * rowsPerPage;

    const { data, isLoading } = useQuery({
      queryKey: ['operator-blacklist', page, rowsPerPage, sortDir, searchKeyword],
      queryFn: async () => {
        const res = await getOperatorBlacklist(
          token as string,
          start,
          sortDir,
          rowsPerPage,
          searchKeyword || '',
        );

        return res.collection.map((item: any) => ({
          id: item.id,
          name: item.visitor?.name || '-',
          phone: item.visitor?.phone || '-',
          reason: item.reason || '-',
          is_active: item.is_active,
          approved_by: item.approved_by_name || '-',
        }));
      },
      enabled: !!token && open,
      placeholderData: (previousData) => previousData,
    });

    const blacklistData = data ?? [];

    const { totalActive, totalNonActive } = useMemo(() => {
      const active = blacklistData.filter((x: any) => x.is_active).length;
      const nonActive = blacklistData.filter((x: any) => !x.is_active).length;

      return {
        totalActive: active,
        totalNonActive: nonActive,
      };
    }, [blacklistData]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Blacklist Visitor</DialogTitle>

      <IconButton
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
        onClick={onClose}
      >
        <IconX />
      </IconButton>

      <Divider />

      <DialogContent>
        <Grid container spacing={3} mb={2}>
          <Grid size={6}>
            <Card sx={{ borderRadius: 3, bgcolor: 'error.light' }}>
              <CardContent sx={{ p: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      backgroundColor: 'error.light',
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <IconUserX color="red" />
                  </Box>

                  <Box>
                    <Typography variant="h6" color="text.secondary" fontWeight={'semibold'}>
                      Active Blacklist
                    </Typography>

                    <Typography variant="h5" fontWeight={600}>
                      {totalActive}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={6}>
            <Card sx={{ borderRadius: 3, bgcolor: 'warning.light' }}>
              <CardContent sx={{ p: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      backgroundColor: 'warning.light',
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <IconClock color="orange" />
                  </Box>

                  <Box>
                    <Typography variant="h6" color="text.secondary" fontWeight={'semibold'}>
                      Non Active Blacklist
                    </Typography>

                    <Typography variant="h5" fontWeight={600}>
                      {totalNonActive}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <DynamicTable
          data={blacklistData}
          isHaveSearch={false}
          isBlacklistAction={false}
          isHaveAction={false}
          // onBlacklist={handleActionBlacklist}
          isHaveChecked
          isNoActionTableHead={true}
          defaultRowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
          isHavePagination={true}
        />
      </DialogContent>
    </Dialog>
  );
}
