import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { IconFileSpreadsheet, IconPdf } from '@tabler/icons-react';

interface GroupVisitorTableProps {
  selectedGroupId: number | string | null;
  openGroup: boolean;
  setOpenGroup: React.Dispatch<React.SetStateAction<boolean>>;
  groupHeader: any;
  groupVisitors: any[];
  groupDetailLoading: boolean;
  exportVisitorPdf: (title: string, data: any[]) => void;
  exportVisitorExcel: (title: string, data: any[]) => void;
  formatDateTime: (value: any) => string;
  VisitorRow: React.ComponentType<{
    visitor: any;
    index: number;
  }>;
  bgNoData: string;
  t: (key: string) => string;
}

const GroupVisitorTable = ({
  selectedGroupId,
  openGroup,
  setOpenGroup,
  groupHeader,
  groupVisitors,
  groupDetailLoading,
  exportVisitorPdf,
  exportVisitorExcel,
  formatDateTime,
  VisitorRow,
  bgNoData,
  t,
}: GroupVisitorTableProps) => {
  return (
    <Box
      flexGrow={1}
      p={2}
      sx={{
        height: { xs: 'auto', xl: '78vh' },
        overflow: 'auto',
      }}
    >
      {selectedGroupId ? (
        <TableContainer component={Paper} sx={{ border: '1px solid #d6d6d6ff' }}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 50 }}>
                  <IconButton size="small" onClick={() => setOpenGroup(!openGroup)}>
                    {openGroup ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                  </IconButton>
                </TableCell>

                <TableCell colSpan={8}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      {groupHeader?.group_name ?? '-'}
                    </Typography>

                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Export PDF" arrow>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() =>
                            exportVisitorPdf(groupHeader?.group_name ?? 'Visitors', groupVisitors)
                          }
                        >
                          <IconPdf />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Export Excel" arrow>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() =>
                            exportVisitorExcel(groupHeader?.group_name ?? 'Visitors', groupVisitors)
                          }
                        >
                          <IconFileSpreadsheet />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow
                sx={{
                  backgroundColor: '#f7faff',
                }}
              >
                <TableCell width={50}>
                  <IconButton size="small" onClick={() => setOpenGroup(!openGroup)}>
                    {openGroup ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                  </IconButton>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Agenda
                    </Typography>
                    <Typography>{groupHeader?.agenda}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Visitor Type
                    </Typography>
                    <Typography>{groupHeader?.visitor_type_name}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Visit Start
                    </Typography>
                    <Typography>{formatDateTime(groupHeader?.visitor_period_start)}</Typography>
                  </Box>
                </TableCell>

                <TableCell colSpan={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Visit End
                    </Typography>
                    <Typography>{formatDateTime(groupHeader?.visitor_period_end)}</Typography>
                  </Box>
                </TableCell>

                <TableCell colSpan={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Host
                    </Typography>
                    <Typography>{groupHeader?.host_name}</Typography>
                  </Box>
                </TableCell>

                <TableCell />
              </TableRow>

              {groupDetailLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : groupVisitors.length > 0 ? (
                groupVisitors.map((visitor, index) => (
                  <VisitorRow key={visitor.id} visitor={visitor} index={index} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No visitor data</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <img src={bgNoData} width={150} />
          <Typography color="text.secondary" mt={2} variant="h5">
            {t('selectGroupFromTheList')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GroupVisitorTable;
