import {
  Box,
  Button,
  Checkbox,
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
import {
  IconFileExport,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconPdf,
  IconPlus,
} from '@tabler/icons-react';
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
  selectedVisitor?: any;
  setSelectedVisitor?: any;
  handleRemoveVisitor: () => void;
  handleAddInvitation: () => void;
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
  selectedVisitor,
  setSelectedVisitor,
  handleRemoveVisitor,
  handleAddInvitation,
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

                <TableCell colSpan={9}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        textTransform: 'capitalize',
                      }}
                    >
                      {groupHeader?.group_name ?? '-'}
                    </Typography>

                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Export PDF" arrow>
                        <Button
                          variant="contained"
                          size="medium"
                          color="error"
                          startIcon={<IconFileTypePdf size={16} />}
                          sx={{ height: 36 }}
                          onClick={() =>
                            exportVisitorPdf(groupHeader?.group_name ?? 'Visitors', groupVisitors)
                          }
                        >
                          <Typography variant="caption" fontSize={'0.7rem'}>
                            Export PDF
                          </Typography>
                        </Button>
                      </Tooltip>

                      <Tooltip title="Export Excel" arrow>
                        <Button
                          variant="contained"
                          size="medium"
                          color="success"
                          startIcon={<IconFileExport size={16} />}
                          sx={{ height: 36 }}
                          onClick={() =>
                            exportVisitorExcel(groupHeader?.group_name ?? 'Visitors', groupVisitors)
                          }
                        >
                          <Typography variant="caption" fontSize={'0.7rem'}>
                            Export Excel
                          </Typography>
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Visitor Name
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Email
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Phone
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Invitation Code
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Organization
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Host
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Site
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  Status
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                  {t('action')}
                </TableCell>
              </TableRow>
            </TableHead>

            {openGroup && (
              <TableBody>
                {groupDetailLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : groupVisitors.length > 0 ? (
                  groupVisitors.map((visitor: any, index: number) => (
                    <VisitorRow
                      key={visitor.id}
                      visitor={visitor}
                      index={index}
                      selectedVisitor={selectedVisitor}
                      setSelectedVisitor={setSelectedVisitor}
                      handleRemoveVisitor={handleRemoveVisitor}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">No visitor data</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      ) : (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={1}
        >
          <img src={bg_nodata} width={150} />

          <Typography color="text.secondary" mt={2} variant="h5">
            {t('selectGroupFromTheList')}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus />}
            onClick={handleAddInvitation}
          >
            {t('add')} Invitation
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TransactionVisitorDetail;
