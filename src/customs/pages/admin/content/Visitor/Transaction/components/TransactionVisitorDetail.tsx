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
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';

import VisitorRow from '../VisitorRow';

interface TransactionVisitorDetailProps {
  selectedGroupId: string | null;
  openGroup: boolean;
  setOpenGroup: React.Dispatch<React.SetStateAction<boolean>>;

  groupHeader: any;
  groupVisitors: any[];
  groupDetailLoading: boolean;

  exportVisitorPdf: (title: string, visitors: any[]) => void;
  exportVisitorExcel: (title: string, visitors: any[]) => void;

  t: (key: string) => string;
}

const TransactionVisitorDetail = ({
  selectedGroupId,
  openGroup,
  setOpenGroup,
  groupHeader,
  groupVisitors,
  groupDetailLoading,
  exportVisitorPdf,
  exportVisitorExcel,
  t,
}: TransactionVisitorDetailProps) => {
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
        <TableContainer
          component={Paper}
          sx={{
            border: '1px solid #d6d6d6ff',
          }}
        >
          <Table>
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
                        fontSize: 18,
                      }}
                    >
                      {groupHeader?.group_name ?? '-'}
                    </Typography>

                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Export PDF">
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

                      <Tooltip title="Export Excel">
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

              <TableRow>
                <TableCell />

                <TableCell>Visitor Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groupDetailLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : groupVisitors.length > 0 ? (
                groupVisitors.map((visitor: any, index: number) => (
                  <VisitorRow key={visitor.id} visitor={visitor} index={index} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
          <img src={bg_nodata} width={150} />

          <Typography color="text.secondary" mt={2} variant="h5">
            {t('selectGroupFromTheList')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TransactionVisitorDetail;
