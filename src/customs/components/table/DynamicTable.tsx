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
  TableFooter,
  TablePagination,
  IconButton,
  Switch,
} from '@mui/material';
import BlankCard from 'src/components/shared/BlankCard';
import { Stack } from '@mui/system';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { AddCircle, CalendarMonth, ChecklistOutlined, Search } from '@mui/icons-material';
import EditIconOutline from '@mui/icons-material/Edit';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Calendar from '../calendar/Calendar';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

type HeaderItem = { name: string };

type HeaderContent = {
  title: string;
  subTitle: string;
  items: HeaderItem[];
};

type DynamicTableProps<T extends { id: string | number }> = {
  overflowX?: 'auto' | 'scroll' | 'unset';
  minWidth?: number | string;
  stickyHeader?: boolean;
  data: T[];
  isHaveChecked?: boolean;
  isHaveAction?: boolean;
  isHaveSearch?: boolean;
  isHaveFilter?: boolean;
  isHaveExportPdf?: boolean;
  isHaveExportXlf?: boolean;
  isHaveFilterDuration?: boolean;
  isHaveAddData?: boolean;
  isHaveHeader?: boolean;
  isHaveImage?: string;
  isHaveBooleanSwitch?: boolean;
  headerContent?: HeaderContent;
  defaultSelectedHeaderItem?: string;
  isHavePagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  totalCount?: number;
  isHaveFilterMore?: boolean;
  filterMoreContent?: React.ReactNode;
  onHeaderItemClick?: (item: HeaderItem) => void;
  onCheckedChange?: (selected: T[]) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
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
  isHaveChecked = false,
  isHaveAction = false,
  isHaveSearch = false,
  isHaveFilter = false,
  isHaveExportPdf = false,
  isHaveExportXlf = false,
  isHaveFilterDuration = false,
  isHaveAddData = false,
  isHaveHeader = false,
  isHaveBooleanSwitch = false,
  isHaveImage,
  headerContent,
  defaultSelectedHeaderItem,
  isHavePagination,
  rowsPerPageOptions,
  defaultRowsPerPage,
  totalCount,
  isHaveFilterMore = false,
  filterMoreContent,
  onHeaderItemClick,
  onCheckedChange,
  onEdit,
  onDelete,
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
    const newChecked = event.target.checked
      ? [...checkedIds, ...currentPageIds.filter((id) => !checkedIds.includes(id))]
      : checkedIds.filter((id) => !currentPageIds.includes(id));

    setCheckedIds(newChecked);

    const selectedRows = data.filter((row) => newChecked.includes(row.id));
    onCheckedChange?.(selectedRows);
  };

  const handleCheckRow = (id: T['id']) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked
      ? [...checkedIds, id]
      : checkedIds.filter((cid) => cid !== id);
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

  // end -----------
  return (
    <>
      {/* HEADER */}
      {isHaveHeader && headerContent && (
        <Box marginBottom={4}>
          <BlankCard>
            <CardContent>
              <Grid2 container size={{ xs: 12, sm: 12 }}>
                {/* Column 1 */}
                <Grid2 size={{ xs: 12, sm: 7 }}>
                  <Stack direction={'column'}>
                    <Typography sx={{ fontSize: '1rem' }} variant="subtitle2">
                      {headerContent.title}
                    </Typography>
                    <Typography mt={1.5} variant="subtitle2">
                      {headerContent.subTitle}
                    </Typography>
                  </Stack>
                </Grid2>

                {/* Column 2: Loop items */}
                <Grid2
                  size={{ xs: 12, sm: 5 }}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={{ xs: 'space-around', sm: 'flex-end' }}
                >
                  <Tabs
                    value={headerContent.items.findIndex(
                      (item) => item.name === selectedHeaderItem,
                    )}
                    onChange={(e, newValue) => {
                      const selectedItem = headerContent.items[newValue];
                      setSelectedHeaderItem(selectedItem.name);
                      onHeaderItemClick?.(selectedItem);
                    }}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: '32px',
                      '& .MuiTab-root': {
                        minHeight: '32px',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        px: 2,
                        marginTop: { xs: 1, sm: 2 },
                      },
                      '& .Mui-selected': {
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    {headerContent.items.map((item, idx) => (
                      <Tab
                        key={idx}
                        label={item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                      />
                    ))}
                  </Tabs>
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
                gap: { xs: 2, sm: 0 }, // gap 2 hanya saat xs (mobile), 0 saat sm ke atas
              }}
            >
              {/* SEARCH MENU */}
              <Stack direction="row" spacing={2}>
                {isHaveSearch && (
                  <Grid2
                    container
                    spacing={1.5}
                    size={{ xs: 12 }}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid2 size={{ xs: 11, lg: 11 }}>
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
                    <Grid2 size={{ xs: 1, lg: 1 }}>
                      <Button
                        variant="contained"
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

              {/* EXPORT AND FILTER DURATION BUTTON */}
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
                      inputProps={{
                        sx: {
                          height: 36,
                          padding: '0 12px',
                          display: 'flex',
                          alignItems: 'center',
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
                  <EditIconOutline sx={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: '1.2rem', cursor: 'pointer' }} />
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
                          indeterminate={
                            paginatedData.some((row) => checkedIds.includes(row.id)) &&
                            !paginatedData.every((row) => checkedIds.includes(row.id))
                          }
                          checked={
                            paginatedData.length > 0 &&
                            paginatedData.every((row) => checkedIds.includes(row.id))
                          }
                          onChange={handleCheckAll}
                        />
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: isHaveChecked ? 40 : 0, // 48px is the width of the checkbox cell
                        zIndex: 2,
                        background: 'white',
                      }}
                    ></TableCell>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {col
                          .replace(/_/g, ' ') // Replace underscores with spaces
                          .replace(/\b\w/g, (char) => char.toUpperCase())}{' '}
                        {/* Uppercase first letter of each word */}
                      </TableCell>
                    ))}
                    {isHaveAction && (
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
                          sx={{ position: 'sticky', left: 0, zIndex: 2, background: 'white' }}
                        >
                          <Checkbox
                            checked={checkedIds.includes(row.id)}
                            onChange={handleCheckRow(row.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: isHaveChecked ? 40 : 0,
                          background: 'white',
                          zIndex: 1,
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      {/* <TableCell>
                      <> {isHaveImage && <img src={} />} </> 
                    </TableCell> */}
                      {columns.map((col) => (
                        <TableCell key={col}>
                          {isHaveBooleanSwitch && typeof row[col] === 'boolean' ? (
                            <Switch
                              checked={row[col] as boolean}
                              onChange={(_, checked) =>
                                onBooleanSwitchChange?.(row.id, col, checked)
                              }
                              color="primary"
                              size="small"
                            />
                          ) : (
                            String(row[col])
                          )}
                        </TableCell>
                      ))}
                      {isHaveAction && (
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
                                  backgroundColor: 'primary.main',

                                  width: 28,
                                  height: 28,
                                  padding: 0.5,
                                  borderRadius: '50%',
                                }}
                              >
                                <IconPencil width={14} height={14} />
                              </IconButton>
                            </Tooltip>

                            {/* Spacer */}
                            <Box mx={0.5} />

                            {/* Tombol Delete (Merah, Kecil) */}
                            <Tooltip title="Delete">
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
                                }}
                              >
                                <IconTrash width={14} height={14} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
                {/* <TableFooter>
                <TableRow></TableRow>
              </TableFooter> */}
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
