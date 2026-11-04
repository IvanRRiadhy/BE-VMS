import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
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
} from '@tabler/icons-react';

import VisitorRow from 'src/customs/pages/admin/content/Visitor/Transaction/VisitorRow';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import { exportVisitorExcel, exportVisitorPdf } from './VisitorExport';
import { useTranslation } from 'react-i18next';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'src/hooks/useDebounce';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
type Props = {
  selectedGroupId: any;
  groupHeader: any;
  groupVisitors: any[];
  groupDetailLoading: boolean;
  selectedVisitor: any;
  setSelectedVisitor: any;
  openGroup: boolean;
  setOpenGroup: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddInvitation: () => void;
  handleExtend: any;
  handleViewDetail: (visitor: any) => void;
  onHistoryApproval: () => void;
};

export default function VisitorListTable({
  selectedGroupId,
  groupHeader,
  groupVisitors,
  groupDetailLoading,
  selectedVisitor,
  setSelectedVisitor,
  openGroup,
  setOpenGroup,
  handleAddInvitation,
  handleExtend,
  handleViewDetail,
  onHistoryApproval,
}: Props) {
  const { t } = useTranslation();
  const lg = window.innerWidth > 1200;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const rowsPerPage = 10;

  const debouncedSearch = useDebounce(search, 500);

  const filteredVisitors = useMemo(() => {
    return groupVisitors.filter((visitor) => {
      const matchesName = visitor.visitor_name
        ?.toLowerCase()
        .includes(debouncedSearch.trim().toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        visitor.visitor_status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesName && matchesStatus;
    });
  }, [groupVisitors, debouncedSearch, statusFilter]);

  const totalCount = filteredVisitors.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;

  const paginatedVisitors = filteredVisitors.slice(startIndex, startIndex + rowsPerPage);

  const from = totalCount === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + rowsPerPage, totalCount);

  useEffect(() => {
    setPage(1);
  }, [selectedGroupId, debouncedSearch, statusFilter]);
  if (!selectedGroupId) {
    return (
      <Box
        flex={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
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
          Add Invitation
        </Button>
      </Box>
    );
  }

  return (
    <Box
      flexGrow={1}
      sx={{
        width: '100%',
        flex: 1,
        minWidth: 0,
        overflowX: 'auto',
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          border: '1px solid #d6d6d6ff',
          minWidth: lg ? 900 : '100%',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>
                <IconButton size="small" onClick={() => setOpenGroup((prev) => !prev)}>
                  {openGroup ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                </IconButton>
              </TableCell>

              <TableCell colSpan={10}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={1} alignItems="center">
                    <CustomTextField
                      fullWidth
                      size="medium"
                      placeholder="Search visitor name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
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
                          backgroundColor: 'background.paper',
                        },
                      }}
                    />
                    <FormControl size="medium" sx={{ minWidth: 160 }}>
                      <InputLabel id="visitor-status-label">Status</InputLabel>
                      <CustomSelect
                        labelId="visitor-status-label"
                        label="Status"
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="Preregis">Preregis</MenuItem>
                        <MenuItem value="Check In">Check In</MenuItem>
                        <MenuItem value="Check Out">Check Out</MenuItem>
                        <MenuItem value="Waiting">Waiting</MenuItem>
                        <MenuItem value="Available">Available</MenuItem>
                      </CustomSelect>
                    </FormControl>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Tooltip title="History Approval" arrow>
                      <Button
                        variant="contained"
                        size="medium"
                        color="primary"
                        startIcon={<IconCheck size={16} />}
                        sx={{ height: 36 }}
                        onClick={onHistoryApproval}
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
                Identity Id
              </TableCell>
              <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                Organization
              </TableCell>
              <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                Host
              </TableCell>
              {/* <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                Visit Start
              </TableCell>
              <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                Visit End
              </TableCell> */}
              <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                Status
              </TableCell>
              <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {groupDetailLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedVisitors.length > 0 ? (
              paginatedVisitors.map((visitor, index) => (
                <VisitorRow
                  key={`${visitor.id}-${index}`}
                  visitor={visitor}
                  index={index}
                  selectedVisitor={selectedVisitor}
                  setSelectedVisitor={setSelectedVisitor}
                  handleExtend={() => handleExtend(visitor)}
                  handleViewDetail={handleViewDetail}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography color="text.secondary">No visitor data</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
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
    </Box>
  );
}
