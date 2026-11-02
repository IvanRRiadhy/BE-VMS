import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  Pagination,
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
  IconCheck,
  IconFileExport,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconPdf,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';

import VisitorRow from '../VisitorRow';
import { useEffect, useState } from 'react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

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
  handleViewDetail: (visitor: any) => void;
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
  handleViewDetail,
}: TransactionVisitorDetailProps) => {
  const [page, setPage] = useState(1);

  // const rowsPerPage = 10;
  const rowsPerPage = 10;

  const totalCount = groupVisitors.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;

  const paginatedVisitors = groupVisitors.slice(startIndex, startIndex + rowsPerPage);

  const from = totalCount === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + rowsPerPage, totalCount);

  // Reset pagination ketika group berubah
  useEffect(() => {
    setPage(1);
  }, [selectedGroupId]);
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
        <>
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

                  <TableCell colSpan={10}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <CustomTextField
                        fullWidth
                        size="medium"
                        placeholder="Search..."
                        // value={search}
                        // onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconSearch size={18} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: '350px',
                          '& .MuiOutlinedInput-root': {
                            // borderRadius: 2,
                            backgroundColor: 'background.paper',
                          },
                        }}
                      />

                      <Box display="flex" gap={0.5}>
                        <Tooltip title="History Approval" arrow>
                          <Button
                            variant="contained"
                            size="medium"
                            color="primary"
                            startIcon={<IconCheck size={16} />}
                            sx={{ height: 36 }}
                            onClick={() => {}}
                          >
                            <Typography variant="caption" fontSize={'0.7rem'}>
                              History Approval
                            </Typography>
                          </Button>
                        </Tooltip>
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
                              exportVisitorExcel(
                                groupHeader?.group_name ?? 'Visitors',
                                groupVisitors,
                              )
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
                  <TableCell>{/* <Checkbox /> */}</TableCell>
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
                    Identity ID
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                    Organization
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                    Visit Start
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                    Visit End
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
                        <CircularProgress size={40} thickness={4} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedVisitors.length > 0 ? (
                    paginatedVisitors.map((visitor: any, index: number) => (
                      <VisitorRow
                        key={visitor.id}
                        visitor={visitor}
                        index={startIndex + index}
                        selectedVisitor={selectedVisitor}
                        setSelectedVisitor={setSelectedVisitor}
                        handleRemoveVisitor={handleRemoveVisitor}
                        handleViewDetail={handleViewDetail}
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
          {openGroup && !groupDetailLoading && totalCount > 0 && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
              mt={2}
              px={1}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {from}–{to} of {totalCount} visitors
              </Typography>

              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
        </>
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
