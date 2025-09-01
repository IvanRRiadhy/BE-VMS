import React, { useState } from 'react';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  CardContent,
  Grid2,
  Typography,
  Tooltip,
  Fab,
  InputAdornment,
  Drawer,
  Tab,
  Tabs,
  TablePagination,
  IconButton,
  Switch,
} from '@mui/material';
import BlankCard from 'src/components/shared/BlankCard';
import { RichHtmlCell } from './RichHtmlCell';
import { Stack } from '@mui/system';
import {
  IconLogin2,
  IconLogout2,
  IconPencil,
  IconPlus,
  IconStar,
  IconTrash,
} from '@tabler/icons-react';
import { AddCircle, CalendarMonth, ChecklistOutlined, Search } from '@mui/icons-material';
import EditIconOutline from '@mui/icons-material/Edit';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Calendar from '../calendar/Calendar';
import {
  IconAdjustmentsHorizontal,
  IconUserFilled,
  IconCheck,
  IconX,
  IconStarFilled,
} from '@tabler/icons-react';

type HeaderItem = { name: string };

type HeaderContent = {
  title?: string;
  subTitle?: string;
  items: HeaderItem[];
};

type DynamicTableProps<T extends { id: string | number }> = {
  overflowX?: 'auto' | 'scroll' | 'unset';
  minWidth?: number | string;
  stickyHeader?: boolean;
  data: T[];
  selectedRows?: T[];
  setSelectedRows?: React.Dispatch<React.SetStateAction<T[]>>;
  selectedRef?: React.MutableRefObject<T[]>;
  isHaveGender?: boolean;
  isHaveChecked?: boolean;
  isHaveAction?: boolean;
  isHaveActionOnlyEdit?: boolean;
  isHaveVisitor?: boolean;
  stickyVisitorCount?: number;
  isHaveSearch?: boolean;
  isHaveFilter?: boolean;
  isHaveExportPdf?: boolean;
  isHaveExportXlf?: boolean;
  isHaveImportExcel?: boolean;
  isHaveFilterDuration?: boolean;
  isActionVisitor?: boolean;
  isHaveAddData?: boolean;
  isHaveHeader?: boolean;
  isHaveEmployee?: boolean;
  isHaveVerified?: boolean;
  isHaveImage?: boolean;
  isHaveObjectData?: boolean;
  isHaveVip?: boolean;
  isHaveBooleanSwitch?: boolean;
  headerContent?: HeaderContent;
  defaultSelectedHeaderItem?: string;
  isHavePagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  isHaveIntegration?: boolean;
  isSelectedType?: boolean;
  htmlFields?: string[];
  htmlClampLines?: number;
  htmlMaxWidth?: number | string;
  onNameClick?: (row: T) => void;
  isVip?: (row: T) => boolean;
  totalCount?: number;
  isHaveFilterMore?: boolean;
  filterMoreContent?: React.ReactNode;
  onView?: (row: T) => void;
  onEmployeeClick?: (employeeId: string) => void;
  onImportExcel?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderItemClick?: (item: HeaderItem) => void;
  onCheckedChange?: (selected: T[]) => void;
  onEdit?: (row: T) => void;
  onBatchEdit?: (row: T[]) => void;
  onDelete?: (row: T) => void;
  onBatchDelete?: (row: T[]) => void;
  onSearchKeywordChange?: (keyword: string) => void;
  onFilterByColumn?: (filter: { column: string }) => void;
  onFilterCalenderChange?: (ranges: any) => void;
  onAddData?: (add: boolean) => void;
  onPaginationChange?: (page: number, rowsPerPage: number) => void;
  onBooleanSwitchChange?: (row: any, field: string, value: boolean) => void;
};

export function DynamicTable<T extends { id: string | number }>({
  overflowX = 'unset',
  minWidth = 'auto',
  stickyHeader = false,
  data,
  selectedRows,
  setSelectedRows,
  isHaveChecked = false,
  isHaveAction = false,
  isHaveActionOnlyEdit = false,
  isSelectedType = false,
  isHaveVisitor = false,
  isActionVisitor = false,
  isHaveSearch = false,
  isHaveFilter = false,
  isHaveExportPdf = false,
  isHaveExportXlf = false,
  isHaveImportExcel = false,
  isHaveFilterDuration = false,
  isHaveGender = false,
  isHaveVip = false,
  isHaveAddData = false,
  isHaveHeader = false,
  isHaveBooleanSwitch = false,
  isHaveVerified = false,
  isHaveEmployee = false,
  isHaveImage,
  isHaveObjectData,
  headerContent,
  defaultSelectedHeaderItem,
  isHavePagination,
  isHaveIntegration,
  onNameClick,
  htmlFields = [],
  htmlClampLines,
  htmlMaxWidth,
  rowsPerPageOptions,
  defaultRowsPerPage,
  totalCount,
  isVip,
  isHaveFilterMore = false,
  filterMoreContent,
  onEmployeeClick,
  onImportExcel,
  onHeaderItemClick,
  onCheckedChange,
  onEdit,
  onView,
  onBatchEdit,
  onDelete,
  onBatchDelete,
  onSearchKeywordChange,
  onFilterByColumn,
  onFilterCalenderChange,
  onAddData,
  onPaginationChange,
  onBooleanSwitchChange,
}: DynamicTableProps<T>) {
  const [checkedIds, setCheckedIds] = useState<Array<T['id']>>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedHeaderItem, setSelectedHeaderItem] = useState<string | null>(
    defaultSelectedHeaderItem ?? null,
  );
  const [showDrawer, setShowDrawer] = React.useState(false);

  const BASE_URL = `http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/cdn`;

  const [showDrawerFilterMore, setShowDrawerFilterMore] = React.useState(false);

  // Paginaton state.
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage || 10);

  // if (!data || data.length === 0) {
  //   return <div>Tidak ada data</div>;
  // }

  const columns =
    data.length > 0
      ? (Object.keys(data[0]).filter((k) => k !== 'id') as Extract<keyof T, string>[])
      : [];

  // const columns = Object.keys(data[0]).filter((k) => k !== 'id') as Extract<keyof T, string>[];

  const handleCheckAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageIds = paginatedData.map((row) => row.id);
    let newCheckedSet = new Set(checkedIds);

    if (event.target.checked) {
      currentPageIds.forEach((id) => newCheckedSet.add(id));
    } else {
      currentPageIds.forEach((id) => newCheckedSet.delete(id));
    }

    const newChecked = Array.from(newCheckedSet);

    setCheckedIds(newChecked);
    onCheckedChange?.(data.filter((row) => newChecked.includes(row.id)));
  };

  const handleCheckRow = (id: string, checked: boolean) => {
    const newChecked = checked
      ? [...checkedIds, id]
      : checkedIds.filter((checkedId) => checkedId !== id);

    setCheckedIds(newChecked);
    onCheckedChange?.(data.filter((row) => newChecked.includes(row.id)));
  };
  const handleSearch = () => {
    onSearchKeywordChange?.(searchKeyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddData = () => {
    onAddData?.(true);
  };
  const handleColumnChange = (value: string) => {
    setSelectedColumn(value);
    onFilterByColumn?.({ column: value });
  };

  const onChangeFilterCalender = (ranges: any) => {
    onFilterCalenderChange?.(ranges);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    onPaginationChange?.(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    onPaginationChange?.(0, newRowsPerPage);
  };

  const paginatedData = isHavePagination ? data : data;

  const toTitleCase = (text: string) => {
    return text
      .replace(/_/g, ' ') // ganti underscore jadi spasi
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)); // kapital di setiap kata
  };

  const imageFields = ['faceimage', 'photo', 'avatar', 'image'];
  const objectFields = ['multiple_option_fields'];

  const GENDER_MAP: Record<string, string> = {
    '0': 'Female',
    '1': 'Male',
    '2': 'Prefer not to say',
  };

  // 1) Tetapkan lebar kolom yang konsisten
  const CHECKBOX_COL_WIDTH = 40;
  const ACTION_COL_WIDTH = 105; // sesuaikan dgn 2 tombol icon + gap
  const INDEX_COL_WIDTH = 56; // kolom nomor
  const DATA_COL_WIDTH = 180;
  const STICKY_DATA_COUNT = 2;

  // 2) Helper: base offset kiri sebelum kolom data
  const getLeftBase = () =>
    (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
    (isActionVisitor ? ACTION_COL_WIDTH : 0) +
    INDEX_COL_WIDTH;

  // 3) Helper: posisi kiri untuk kolom data sticky ke-i
  const getStickyLeft = (i: number) => getLeftBase() + i * DATA_COL_WIDTH;

  // 4) Helper: apakah kolom data (ke-i) harus sticky
  const isStickyVisitorCol = (i: number) => isHaveVisitor && i < STICKY_DATA_COUNT;
  // end -----------
  const headerMap: Record<string, string> = {
    companies: 'Companies',
    badge_type: 'Badge Type',
    clear_codes: 'Clearcodes',
    badge_status: 'Badge Status',
    floor_plan: 'Floor Plan',
    access_control: 'Access Control',
    organizations: 'Organization',
    departments: 'Department',
    access_cctv: 'Access CCTV',
    districts: 'District',
    members: 'Member',
    card: 'Card',
    visitor: 'Visitor',
    visitor_blacklist: 'Visitor Blacklist',
    brand: 'Brand',
    floor: 'Floor',
    floor_plan_masked_area: 'Floor Plan Masked Area',
    floor_plan_device: 'Floor Plan Device',
    building: 'Building',
    ble_reader: 'Ble Reader',
  };
  return (
    <>
      {/* HEADER */}
      {isHaveHeader && headerContent && (
        <Box marginBottom={4}>
          <BlankCard>
            <CardContent sx={{ overflow: 'visible' }}>
              <Grid2 container size={{ xs: 12, sm: 12 }}>
                <Grid2
                  size={{ xs: 12, sm: 12 }}
                  display="flex"
                  alignItems="center"
                  justifyContent={{ xs: 'flex-start', sm: 'flex-start' }}
                >
                  <Stack direction="column" sx={{ width: '100%' }}>
                    <Typography sx={{ fontSize: '1rem' }} variant="subtitle2" fontWeight={600}>
                      {headerContent.title}
                    </Typography>

                    {/* HAPUS Box overflowX, biarkan scroller Tabs yang kerja */}
                    <Tabs
                      value={headerContent.items.findIndex(
                        (item) => item.name === selectedHeaderItem,
                      )}
                      onChange={(_e, newValue) => {
                        const selectedItem = headerContent.items[newValue];
                        setSelectedHeaderItem(selectedItem.name);
                        onHeaderItemClick?.(selectedItem);
                      }}
                      variant="scrollable"
                      scrollButtons="auto"
                      allowScrollButtonsMobile
                      textColor="primary"
                      indicatorColor="primary"
                      sx={{
                        maxWidth: '100%',
                        width: '100%',
                        minHeight: 20,
                        '& .MuiTabs-scroller': {
                          overflowX: 'auto !important',
                          WebkitOverflowScrolling: 'touch',
                        },
                        '& .MuiTabs-flexContainer': {
                          gap: 0.5,
                        },
                        '& .MuiTab-root': {
                          minWidth: 'auto', // penting biar tab tidak “kaku” 72px+
                          whiteSpace: 'nowrap', // biar label tidak turun baris
                          minHeight: 20,
                          textTransform: 'none',
                          fontSize: '0.6rem',
                          px: 1.5,
                          mt: { xs: 1, sm: 2 },
                          borderRadius: '999px',
                          border: '1px solid',
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          transition: 'all 0.3s',
                          mr: 1,
                        },
                        '& .MuiTab-root.Mui-selected': {
                          fontWeight: 'bold',
                          backgroundColor: 'primary.main',
                          color: '#fff',
                          border: '1px solid transparent',
                        },
                        '& .MuiTabs-indicator': { display: 'none' },
                      }}
                    >
                      {headerContent.items.map((item, idx) => (
                        <Tab
                          key={idx}
                          label={
                            headerMap[item.name] ||
                            item.name.charAt(0).toUpperCase() + item.name.slice(1)
                          }
                          disableRipple
                        />
                      ))}
                    </Tabs>
                  </Stack>
                </Grid2>
              </Grid2>
            </CardContent>
          </BlankCard>
        </Box>
      )}

      {/*  TABLE */}
      <BlankCard>
        <CardContent>
          <Grid2 container sx={{ marginBottom: 0.1 }}>
            {/* ROW 1 */}
            <Grid2
              size={{ xs: 12 }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap={'wrap'}
              sx={{
                mb: 3,
                gap: { xs: 2, md: 0 }, // gap 2 hanya saat xs (mobile), 0 saat sm ke atas
              }}
            >
              {/* SEARCH MENU */}
              <Stack direction="row" spacing={2}>
                {isHaveSearch && (
                  <Grid2
                    container
                    spacing={1.5}
                    // size={{ xs: 12 }}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid2 size={{ xs: 10, lg: 10 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{
                          height: 36,
                        }}
                        InputProps={{
                          sx: {
                            height: 36,
                          },
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 2, lg: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={
                          handleSearch // panggil fungsi kamu
                        }
                        sx={{
                          height: 36,
                          width: '100%',
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography fontSize={'0.7rem'} variant="caption" my={0.2}>
                          Search
                        </Typography>
                      </Button>
                    </Grid2>
                  </Grid2>
                )}
              </Stack>

              {/* EXPORT AND IMPORT AND FILTER DURATION BUTTON */}
              <Stack direction="row" spacing={1} alignItems="center">
                {isHaveExportPdf && (
                  <Button
                    size="medium"
                    variant="outlined"
                    startIcon={<AddCircle />}
                    color="error"
                    sx={{ height: 36 }}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Export pdf
                    </Typography>
                  </Button>
                )}
                {isHaveImportExcel && onImportExcel && (
                  <>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      id="upload-excel"
                      style={{ display: 'none' }}
                      onChange={onImportExcel}
                    />
                    <label htmlFor="upload-excel">
                      <Button
                        component="span"
                        size="medium"
                        variant="contained"
                        startIcon={<AddCircle />}
                        color="success"
                        sx={{ height: 36 }}
                      >
                        <Typography variant="caption" fontSize={'0.7rem'}>
                          Import xls
                        </Typography>
                      </Button>
                    </label>
                  </>
                )}

                {isHaveExportXlf && (
                  <Button
                    size="medium"
                    variant="outlined"
                    startIcon={<AddCircle />}
                    color="secondary"
                    sx={{ height: 36 }}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Export xls
                    </Typography>
                  </Button>
                )}

                {isHaveFilterMore && (
                  <Button
                    onClick={() => setShowDrawerFilterMore(true)}
                    size="medium"
                    variant="outlined"
                    startIcon={<IconAdjustmentsHorizontal />}
                    color="info"
                    sx={{ height: 36 }}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Filter more
                    </Typography>
                  </Button>
                )}

                {isHaveFilterDuration && (
                  <Button
                    onClick={() => setShowDrawer(true)}
                    size="medium"
                    variant="outlined"
                    startIcon={<CalendarMonth />}
                    color="info"
                    sx={{ height: 36 }}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      By duration
                    </Typography>
                  </Button>
                )}

                {isHaveFilter && (
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      displayEmpty
                      value={selectedColumn}
                      onChange={(e) => handleColumnChange(e.target.value)}
                      sx={{
                        height: 36,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            fontSize: '0.7rem',
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <Typography fontSize={'0.7rem'} variant="caption">
                          Sort by column
                        </Typography>
                      </MenuItem>
                      {columns.map((col) => (
                        <MenuItem key={col} value={col}>
                          <Typography fontSize={'0.7rem'} variant="caption">
                            {toTitleCase(col)}
                          </Typography>
                        </MenuItem>
                      ))}{' '}
                    </Select>
                  </FormControl>
                )}

                {isHaveAddData && (
                  <Tooltip title="Add Data">
                    <Fab
                      size="small"
                      color="primary"
                      sx={{ height: 36, width: 40 }}
                      onClick={handleAddData}
                    >
                      <IconPlus width={16} height={16} />
                    </Fab>
                  </Tooltip>
                )}
              </Stack>
            </Grid2>
            {checkedIds.length > 0 && (
              <Grid2
                size={{ xs: 12, sm: 12 }}
                sx={{
                  padding: 1.6,
                  backgroundColor: 'primary.light',
                }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ChecklistOutlined sx={{ fontSize: '1.2rem' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.9rem' }}>
                    {checkedIds.length} Selected
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={3} pr={2.5}>
                  {/* View */}

                  {/* <RemoveRedEyeIcon
                    sx={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    onClick={() => {
                      if (!Array.isArray(selectedRows) || selectedRows.length === 0) return;
                      onBatchView?.(selectedRows);
                    }} */}

                  {/* Tombol Edit (batch edit hanya jika perlu) */}
                  <EditIconOutline
                    sx={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    onClick={() => {
                      if (!Array.isArray(selectedRows) || selectedRows.length === 0) return;
                      onBatchEdit?.(selectedRows);
                    }}
                  />

                  <DeleteOutlineOutlinedIcon
                    sx={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    onClick={async () => {
                      if (!Array.isArray(selectedRows) || selectedRows.length === 0) return;

                      const confirmed = await onBatchDelete?.(selectedRows);

                      // Jika berhasil (misalnya return true), reset selection
                      if (confirmed) {
                        setCheckedIds([]);
                        if (setSelectedRows) {
                          setSelectedRows([]);
                        }
                      }
                    }}
                  />
                </Box>
              </Grid2>
            )}
          </Grid2>
          <TableContainer>
            {paginatedData.length === 0 ? (
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TableCell
                      colSpan={
                        columns.length +
                        (isHaveChecked ? 1 : 0) + // checkbox
                        1 + // NO
                        (isHaveAction ? 1 : 0) // action
                      }
                      sx={{ padding: 0 }} // hilangkan padding agar Box bekerja optimal
                    >
                      <Box
                        height={50}
                        width="100%"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.secondary',
                        }}
                      >
                        Tidak ada data
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            ) : (
              <Table
                aria-label="simple table"
                sx={{ minWidth, whiteSpace: 'nowrap' }}
                stickyHeader={stickyHeader}
              >
                <TableHead>
                  <TableRow>
                    {isHaveChecked && (
                      <TableCell
                        padding="checkbox"
                        sx={{ position: 'sticky', left: 0, zIndex: 2, background: 'white' }}
                      >
                        <Checkbox
                          checked={
                            paginatedData.length > 0 &&
                            paginatedData.every((row) => checkedIds.includes(row.id))
                          }
                          indeterminate={
                            paginatedData.some((row) => checkedIds.includes(row.id)) &&
                            !paginatedData.every((row) => checkedIds.includes(row.id))
                          }
                          onChange={handleCheckAll}
                        />
                      </TableCell>
                    )}
                    {isHaveAction && isActionVisitor && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
                          zIndex: 4,
                          background: 'white',
                          minWidth: ACTION_COL_WIDTH,
                          maxWidth: ACTION_COL_WIDTH,
                        }}
                      >
                        Action
                      </TableCell>
                    )}

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left:
                          (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
                          (isActionVisitor ? ACTION_COL_WIDTH : 0),
                        zIndex: 4,
                        background: 'white',
                        minWidth: INDEX_COL_WIDTH,
                        maxWidth: INDEX_COL_WIDTH,
                        // marginRight: '10px',
                      }}
                    >
                      #
                    </TableCell>
                    {columns.map((col, idx) => {
                      const makeSticky = isStickyVisitorCol(idx);

                      return (
                        <TableCell
                          key={col}
                          sx={{
                            ...(makeSticky && {
                              position: 'sticky',
                              left: getStickyLeft(idx),
                              zIndex: 4, // header > body
                              background: 'white',
                              minWidth: DATA_COL_WIDTH,
                              maxWidth: DATA_COL_WIDTH,
                            }),
                          }}
                        >
                          {col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </TableCell>
                      );
                    })}
                    {isHaveAction && !isActionVisitor && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          bgcolor: 'background.paper',
                          zIndex: 4, // header > body
                          p: 0,
                          verticalAlign: 'middle',
                          textAlign: 'center',
                        }}
                      >
                        Action
                      </TableCell>
                    )}

                    {isHaveActionOnlyEdit && isSelectedType && (
                      <TableCell
                        sx={{ position: 'sticky', right: 0, background: 'white', zIndex: 2 }}
                      >
                        Action
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={row.id}>
                      {isHaveChecked && (
                        <TableCell
                          padding="checkbox"
                          sx={{ position: 'sticky', left: 0, zIndex: 3, background: 'white' }}
                        >
                          <Checkbox
                            checked={checkedIds.includes(row.id)}
                            onChange={(e) => handleCheckRow(row.id as string, e.target.checked)}
                          />
                        </TableCell>
                      )}

                      {isHaveAction && isActionVisitor && (
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
                            zIndex: 3,
                            background: 'white',
                            minWidth: ACTION_COL_WIDTH, // ditambah biar muat icon VIP
                            maxWidth: ACTION_COL_WIDTH,
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={0.3}>
                            {/* Detail Visitor */}
                            <Tooltip title="Detail Visitor">
                              <IconButton
                                onClick={() => onView?.(row)}
                                disableRipple
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'gray !important',
                                  width: 28,
                                  height: 28,
                                  padding: 0.5,
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: 'success.dark',
                                    color: 'white',
                                  },
                                }}
                              >
                                <RemoveRedEyeIcon width={18} height={18} />
                              </IconButton>
                            </Tooltip>
                            {/* Tombol Checkin */}
                            <Tooltip title="Check In">
                              <IconButton
                                onClick={() => onEdit?.(row)}
                                disableRipple
                                sx={{
                                  color: 'white',
                                  backgroundColor: '#13DEB9 !important',
                                  width: 28,
                                  height: 28,
                                  padding: 0.5,
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: 'success.dark',
                                    color: 'white',
                                  },
                                }}
                              >
                                <IconLogin2 width={18} height={18} />
                              </IconButton>
                            </Tooltip>

                            {/* Tombol Checkout */}
                            <Tooltip title="Check Out">
                              <IconButton
                                onClick={() => onDelete?.(row)}
                                disableRipple
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'error.main',
                                  width: 28,
                                  height: 28,
                                  padding: 0.5,
                                  borderRadius: '50%',
                                  // hover
                                  '&:hover': {
                                    backgroundColor: 'error.dark',
                                    color: 'white',
                                  },
                                }}
                              >
                                <IconLogout2 width={18} height={18} />
                              </IconButton>
                            </Tooltip>

                            {/* Ikon VIP */}
                            {/* {isHaveVip &&
                              (row.is_vip ? (
                                <Tooltip title="VIP">
                                  <IconStarFilled color="gold" />
                                </Tooltip>
                              ) : // <Tooltip title="Not VIP">
                              //   <IconStarFilled color="lightgray" />
                              // </Tooltip>
                              null)} */}

                            {/* {isHaveVip && isVip?.(row) && (
                              <Tooltip title="VIP">
                                <IconStarFilled color="gold" />
                              </Tooltip>
                            )} */}
                          </Box>
                        </TableCell>
                      )}

                      <TableCell
                        sx={{
                          position: 'sticky',
                          left:
                            (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
                            (isActionVisitor ? ACTION_COL_WIDTH : 0),
                          zIndex: 3,
                          background: 'white',
                          minWidth: INDEX_COL_WIDTH,
                          maxWidth: INDEX_COL_WIDTH,
                        }}
                      >
                        {index + 1 + page * rowsPerPage}
                      </TableCell>

                      {columns.map((col, idx) => {
                        const makeSticky = isStickyVisitorCol(idx);
                        return (
                          <TableCell
                            key={col}
                            sx={{
                              ...(makeSticky && {
                                position: 'sticky',
                                left: getStickyLeft(idx),
                                zIndex: 3, // body < header
                                background: 'white',
                                minWidth: DATA_COL_WIDTH,
                                maxWidth: DATA_COL_WIDTH,
                              }),
                            }}
                          >
                            {isHaveVip && col === 'is_vip' ? (
                              row[col] ? (
                                <Tooltip title="VIP">
                                  <IconStarFilled color="gold" />
                                </Tooltip>
                              ) : (
                                <Tooltip title="Not VIP">
                                  <IconStarFilled color="lightgray" />
                                </Tooltip>
                              )
                            ) : htmlFields.includes(col) && typeof row[col] === 'string' ? (
                              <RichHtmlCell
                                html={String(row[col] ?? '')}
                                lines={htmlClampLines}
                                maxWidth={htmlMaxWidth}
                              />
                            ) : isHaveEmployee && col === 'employee_id' ? (
                              <Tooltip title="View Employee">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEmployeeClick?.(String(row[col] ?? ''))}
                                  sx={{
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    backgroundColor: (theme) => theme.palette.grey[100],
                                  }}
                                >
                                  <IconUserFilled />
                                </IconButton>
                              </Tooltip>
                            ) : isHaveGender && col === 'gender' ? (
                              GENDER_MAP[String(row[col])] ?? String(row[col] ?? '-')
                            ) : isHaveImage &&
                              imageFields.includes(col) &&
                              typeof row[col] === 'string' ? (
                              <img
                                src={(() => {
                                  const value = row[col];
                                  if (!value) return '';
                                  if (value.startsWith('data:image')) return value;
                                  if (value.startsWith('http')) return value;
                                  return `${BASE_URL}${value}`;
                                })()}
                                alt="employee"
                                style={{
                                  width: 55,
                                  height: 55,
                                  // borderRadius: '50%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : isHaveBooleanSwitch && typeof row[col] === 'boolean' ? (
                              <Switch
                                checked={row[col] as boolean}
                                onChange={(_, checked) =>
                                  onBooleanSwitchChange?.(row.id, col, checked)
                                }
                                color="primary"
                                size="small"
                              />
                            ) : isHaveObjectData &&
                              objectFields?.includes(col) &&
                              typeof row[col] === 'object' &&
                              row[col] !== null ? (
                              Array.isArray(row[col]) ? (
                                row[col].map((item: any) => item.name).join(', ')
                              ) : (
                                (row[col] as { name?: string }).name ?? '-'
                              )
                            ) : (
                              <>
                                {isHaveIntegration && col === 'name' && onNameClick ? (
                                  <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => {
                                      // e.stopPropagation();
                                      onNameClick?.(row);
                                    }}
                                    sx={{
                                      p: 1,
                                      minWidth: 0,
                                      textTransform: 'none',
                                      fontSize: '0.875rem',
                                      textDecoration: 'underline',
                                    }}
                                    // target="_blank"
                                  >
                                    {String(row[col] ?? '-')}
                                  </Button>
                                ) : (
                                  String(row[col] ?? '-')
                                )}

                                {isHaveVerified &&
                                  col === 'email' &&
                                  (col == 'is_email_verified' ? (
                                    <Tooltip title="Email Verified">
                                      <Box
                                        sx={{
                                          mt: '10px',
                                          backgroundColor: 'green',
                                          borderRadius: '50%',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          marginLeft: '5px',
                                          p: '2px',
                                        }}
                                      >
                                        <IconCheck color="white" size={16} />
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Email Not Verified">
                                      <Box
                                        sx={{
                                          mt: '20px',
                                          backgroundColor: 'red',
                                          borderRadius: '50%',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          marginLeft: '5px',
                                          p: '2px',
                                        }}
                                      >
                                        <IconX color="white" size={16} />
                                      </Box>
                                    </Tooltip>
                                  ))}
                              </>
                            )}
                          </TableCell>
                        );
                      })}

                      {isHaveAction && !isActionVisitor && (
                        <TableCell
                          sx={{
                            position: 'sticky',
                            right: 0,
                            bgcolor: 'background.paper',
                            zIndex: 2, // body < header
                            p: 0, // padding diatur di inner Box
                            verticalAlign: 'middle', // ikut tinggi baris
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                              px: 1.5,
                              py: 1.25, // samakan dengan baris lain
                              height: '100%',
                            }}
                          >
                            {/* Tombol Edit */}
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => onEdit?.(row)}
                                disableRipple
                                sx={{
                                  color: 'white',
                                  backgroundColor: '#FA896B',
                                  width: 28,
                                  height: 28,
                                  p: 0.5,
                                  borderRadius: '50%',
                                  '&:hover': { backgroundColor: '#e06f52', color: 'white' },
                                }}
                              >
                                <IconPencil width={14} height={14} />
                              </IconButton>
                            </Tooltip>

                            {/* Tombol Delete */}
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => onDelete?.(row)}
                                disableRipple
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'error.main',
                                  width: 28,
                                  height: 28,
                                  p: 0.5,
                                  borderRadius: '50%',
                                  '&:hover': { backgroundColor: 'error.dark' },
                                }}
                              >
                                <IconTrash width={14} height={14} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}

                      {isHaveActionOnlyEdit && !isActionVisitor && isSelectedType && (
                        <TableCell
                          sx={{
                            position: 'sticky',
                            right: 0,
                            background: 'white',
                            zIndex: 2,
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Box display="flex" alignItems="end">
                            {/* Tombol Edit (Primary, Kecil) */}
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => onEdit?.(row)}
                                disableRipple
                                sx={{
                                  color: 'white',
                                  backgroundColor: '#FA896B',

                                  width: 28,
                                  height: 28,
                                  padding: 0.5,
                                  borderRadius: '50%',
                                }}
                              >
                                <IconPencil width={14} height={14} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          {isHavePagination && (
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={totalCount ?? data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </CardContent>
      </BlankCard>
      {/* DRAWER CALENDER RANGE FILTER */}
      <Drawer anchor="right" open={showDrawer} onClose={() => setShowDrawer(false)}>
        <Calendar onChange={onChangeFilterCalender} />
      </Drawer>

      <Drawer
        anchor="right"
        PaperProps={{
          sx: {
            width: '40vw',
          },
        }}
        open={showDrawerFilterMore}
        onClose={() => setShowDrawerFilterMore(false)}
      >
        {filterMoreContent}
      </Drawer>
    </>
  );
}
