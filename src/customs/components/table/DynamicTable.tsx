import React, { useState, useEffect } from 'react';
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
  Skeleton,
  Fab,
  InputAdornment,
  Drawer,
  Tab,
  Tabs,
  TablePagination,
  IconButton,
  Switch,
  Breadcrumbs,
} from '@mui/material';
import BlankCard from 'src/components/shared/BlankCard';
import { RichHtmlCell } from './RichHtmlCell';
import { Stack, useMediaQuery, useTheme } from '@mui/system';
import {
  IconAlertSquare,
  IconArrowAutofitLeft,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconFileExport,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypePdf,
  IconForbid2,
  IconHome,
  IconLogin2,
  IconLogout2,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconSettings,
  IconTrash,
  IconUserCheck,
  IconUserX,
  IconXboxX,
} from '@tabler/icons-react';
import {
  AddCircle,
  CalendarMonth,
  ChecklistOutlined,
  ExpandLess,
  ExpandMore,
  Search,
} from '@mui/icons-material';
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
import { InsertDriveFile } from '@mui/icons-material';

import backgroundnodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import moment from 'moment';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

type HeaderItem = { name: string };

type HeaderContent = {
  title?: string;
  subTitle?: string;
  items: HeaderItem[];
};

type DynamicTableProps<
  T extends { id: string | number; status?: any; early_access?: any; visitor_give_access?: any },
> = {
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
  isHaveAccess?: boolean;
  isHaveActionOnlyEdit?: boolean;
  // isHaveExportPdf?: boolean;
  isHaveExportCsv?: boolean;
  isHaveExportExcel?: boolean;
  isHavePrint?: boolean;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  onBlacklist?: (row: T) => void;
  isHaveVisitor?: boolean;
  isButtonRegisteredSite?: boolean;
  isButtonGiveAccess?: boolean;
  stickyVisitorCount?: number;
  isHaveSearch?: boolean;
  isHaveSettingOperator?: boolean;
  isCopyLink?: boolean;
  isDetailLink?: boolean;
  hasFetched?: boolean;
  isSiteSpaceName?: boolean;
  isHaveFilter?: boolean;
  isHaveExportPdf?: boolean;
  isAccessControlType?: boolean;
  isHaveView?: boolean;
  isHaveExportXlf?: boolean;
  isButtonSiteAccess?: boolean;
  isHaveImportExcel?: boolean;
  isTreeSiteType?: boolean;
  isHaveFilterDuration?: boolean;
  isActionVisitor?: boolean;
  setCurrentId?: any;
  onAccept?: (row: T) => void;
  onDenied?: (row: T) => void;
  isHaveAddData?: boolean;
  height?: number | string;
  isHaveHeader?: boolean;
  isHaveEmployee?: boolean;
  isBlacklistAction?: boolean;
  isHaveVerified?: boolean;
  isButtonEnabled?: boolean;
  isButtonDisabled?: boolean;
  isHaveImage?: boolean;
  isHavePermission?: boolean;
  isHaveObjectData?: boolean;
  isHaveVip?: boolean;
  isNoActionTableHead?: boolean;
  isHaveBooleanSwitch?: boolean;
  isHavePdf?: boolean;
  isHaveCard?: boolean;
  isDataVerified?: boolean;
  headerContent?: HeaderContent;
  isHaveHeaderTitle?: boolean;
  titleHeader?: string;
  isHavePassword?: boolean;
  isSiteSpaceType?: boolean;
  isHaveViewAndAction?: boolean;
  isHavePeriod?: boolean;
  defaultSelectedHeaderItem?: string;
  isActionListVisitor?: boolean;
  breadcrumbItems?: any[];
  isHavePagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  isHaveApproval?: boolean;
  isHaveIntegration?: boolean;
  isSelectedType?: boolean;
  htmlFields?: string[];
  htmlClampLines?: number;
  loading?: boolean;
  htmlMaxWidth?: number | string;
  onChooseCard?: (row?: T) => void;
  onNameClick?: (row: T) => void;
  isVip?: (row: T) => boolean;
  isHaveArrival?: boolean;
  isActionEmployee?: boolean;
  totalCount?: number;
  isHaveFilterMore?: boolean;
  filterMoreContent?: React.ReactNode;
  sortColumns?: string[];
  isOperatorSetting?: boolean;
  isBlacklistPage?: boolean;
  onNavigatePage?: any;
  onCopyLink?: (row: T) => void;
  onDetailLink?: (row: T) => void;
  onSettingOperator?: (row: T) => void;
  onAccessAction?: (row: any, action: 'grant' | 'revoke' | 'block' | 'unblock') => void;
  onFileClick?: (row: T) => void;
  onView?: (row: T) => void;
  onEmployeeClick?: (row: T) => void;
  onImportExcel?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderItemClick?: (item: HeaderItem) => void;
  onCheckedChange?: (selected: T[]) => void;
  onIsButtonEnabled?: (row: T) => void;
  onIsButtonDisabled?: (row: T) => void;
  onEdit?: (row: T) => void;
  onPermission?: (row: T) => void;
  onBatchEdit?: (row: T[]) => void;
  onDelete?: (row: T) => void;
  onBatchDelete?: (row: T[]) => void;
  onSearchKeywordChange?: (keyword: string) => void;
  onFilterByColumn?: (column: { column: string }) => void;
  onFilterCalenderChange?: (ranges: any) => void;
  onSiteAccess?: (row: T) => void;
  onRegisteredSite?: (row: T) => void;
  onGiveAccess?: (row: T) => void;
  onAddData?: (add: boolean) => void;
  onPaginationChange?: (page: number, rowsPerPage: number) => void;
  onBooleanSwitchChange?: (row: any, field: string, value: boolean) => void;
};

export function DynamicTable<
  T extends { id: string | number; status?: any; early_access?: any; visitor_give_access?: any },
>({
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
  isHaveExportCsv = false,
  isHaveExportExcel = false,
  isHavePrint = false,
  isHaveExportPdf = false,
  isHaveExportXlf = false,
  isHaveImportExcel = false,
  isHaveFilterDuration = false,
  isActionEmployee = false,
  isButtonSiteAccess = false,
  height,
  isHaveGender = false,
  isButtonRegisteredSite = false,
  isButtonGiveAccess = false,
  isAccessControlType,
  isHaveVip = false,
  isHaveAddData = false,
  isHaveHeader = false,
  isHaveBooleanSwitch = false,
  isHavePermission = false,
  breadcrumbItems,
  isOperatorSetting = false,
  isBlacklistPage = false,
  isActionListVisitor = false,
  isHaveVerified = false,
  isHaveView = false,
  isHaveAccess = false,
  isCopyLink = false,
  isDetailLink = false,
  isButtonDisabled = false,
  isButtonEnabled = false,
  isHaveEmployee = false,
  isHaveViewAndAction = false,
  isHaveCard = false,
  isHaveImage,
  isHaveSettingOperator = false,
  isHaveObjectData,
  isHaveHeaderTitle = false,
  titleHeader,
  headerContent,
  hasFetched = false,
  onAccept,
  isSiteSpaceName,
  isNoActionTableHead = false,
  onDenied,
  onBlacklist,
  isHaveApproval = false,
  defaultSelectedHeaderItem,
  isHavePassword = false,
  isHavePagination,
  isHavePdf,
  isSiteSpaceType = false,
  isBlacklistAction,
  isHaveIntegration,
  onNameClick,
  isDataVerified = false,
  htmlFields = [],
  htmlClampLines,
  isHaveArrival = false,
  htmlMaxWidth,
  rowsPerPageOptions,
  defaultRowsPerPage,
  totalCount,
  isHavePeriod = false,
  loading = false,
  isVip,
  isHaveFilterMore = false,
  isTreeSiteType,
  filterMoreContent,
  sortColumns,
  onPrint,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onAccessAction,
  onNavigatePage,
  onFileClick,
  onChooseCard,
  onEmployeeClick,
  onImportExcel,
  onHeaderItemClick,
  onCheckedChange,
  onEdit,
  onRegisteredSite,
  onCopyLink,
  onDetailLink,
  onIsButtonEnabled,
  onIsButtonDisabled,
  onGiveAccess,
  onSettingOperator,
  onSiteAccess,
  onView,
  onBatchEdit,
  onPermission,
  setCurrentId,
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
  const [showDrawer, setShowDrawer] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const BASE_URL = axiosInstance2.defaults.baseURL + '/cdn';

  const [showDrawerFilterMore, setShowDrawerFilterMore] = useState(false);

  // Paginaton state.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage || 10);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const hiddenColumns = [
    'id',
    'can_grant',
    'can_revoke',
    'can_block',
    'visitor_give_access',
    'access_control_id',
    'registered_site',
    'is_email_verified',
  ];

  const fallbackColumns = React.useMemo(() => {
    if (data.length > 0) {
      return Object.keys(data[0]).filter((k) => !hiddenColumns.includes(k));
    }

    // kolom dummy untuk skeleton
    const expectedColCount = 5;
    return Array.from({ length: expectedColCount }, (_, i) => ``);
  }, [data, hiddenColumns]);

  // gunakan fallback kalau data kosong / sedang loading
  const columns =
    loading || data.length === 0
      ? fallbackColumns
      : (Object.keys(data[0]).filter((k) => !hiddenColumns.includes(k)) as Extract<
          keyof T,
          string
        >[]);

  // const columns =
  //   data.length > 0
  //     ? (Object.keys(data[0]).filter((k) => !hiddenColumns.includes(k)) as Extract<
  //         keyof T,
  //         string
  //       >[])
  //     : [];

  const columnss =
    sortColumns && sortColumns.length > 0
      ? columns.filter((col) => sortColumns.includes(col))
      : columns;

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

  const onApplyFilterCalender = (ranges: { startDate: Date; endDate: Date }) => {
    onFilterCalenderChange?.(ranges);
    setShowDrawer(false);
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
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  };

  const imageFields = ['faceimage', 'photo', 'avatar', 'image'];
  const objectFields = ['multiple_option_fields'];

  const GENDER_MAP: Record<string, string> = {
    '0': 'Female',
    '1': 'Male',
    '2': 'Prefer not to say',
  };

  const SITE_MAP: Record<number, string> = {
    0: 'Site',
    1: 'Building',
    2: 'Floor',
    3: 'Room',
  };

  const CARD_STATUS: Record<number, string> = {
    0: 'Not Found',
    1: 'Active',
    2: 'Lost',
    3: 'Broken',
    4: 'Not Return',
  };

  const DOCUMENT_TYPE: Record<number, string> = {
    0: 'Card',
    1: 'Document',
    2: 'Face',
  };
  const [openRow, setOpenRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setOpenRow((prev) => (prev === id ? null : id));
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
    card_access: 'Card Access',
    access_cctv: 'Access CCTV',
    districts: 'District',
    members: 'Member',
    card: 'Card',
    visitor: 'Visitor',
    trx_visitor: 'Trx Visitor',
    visitor_blacklist: 'Visitor Blacklist',
    brand: 'Brand',
    floor: 'Floor',
    floor_plan_masked_area: 'Floor Plan Masked Area',
    visitor_type: 'Visitor Type',
    building: 'Building',
    ble_reader: 'Ble Reader',
    alarm_record: 'Alarm Record',
    alarm_warning: 'Alarm Warning',
    tracking_transaction: 'Tracking Transaction',
  };

  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string | number, boolean>>({});

  const togglePassword = (id: string | number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d', // hijau
    Checkout: '#F44336', // merah
    Block: '#000000', // hitam
    Deny: '#8B0000', // merah tua
    Approve: '#21c45d', // hijau
    Pracheckin: '#21c45d', // hijau
  };

  const defaultBg = '#9E9E9E'; // abu-abu

  const tooltipLabels: Record<string, { true: string; false: string }> = {
    is_primary: {
      true: 'Primary',
      false: 'Not Primary',
    },
    can_signed: {
      true: 'Can Signed',
      false: 'Can Not Signed',
    },
    can_upload: {
      true: 'Can Upload',
      false: 'Can Not Upload',
    },
    can_declined: {
      true: 'Can Declined',
      false: 'Can Not Declined',
    },
    secure: {
      true: 'Secure Verified',
      false: 'Secure Not Verified',
    },
    early_access: {
      true: 'Early Access',
      false: 'Not Early Access',
    },
    is_employee_used: {
      true: 'Employee Used',
      false: 'Employee Not Used',
    },
    is_multi_site: {
      true: 'Multi Site Enabled',
      false: 'Multi Site Disabled',
    },
    is_used: {
      true: 'Active',
      false: 'Inactive',
    },
    status_link: {
      true: 'Active',
      false: 'Inactive',
    },
  };

  const formatDate = (date?: string) => {
    if (!date) return '-'; // fallback kalau kosong
    return moment.utc(date).local().format('DD-MM-YYYY, HH:mm');
  };

  const getAccessActions = (row: any) => {
    const { visitor_give_access, can_grant, can_revoke, can_block, early_access } = row;

    const allDisabled = !can_grant && !can_revoke && !can_block;

    // 🟠 1️⃣ Jika early_access true → hanya bisa Revoke & Block
    // 🟠 1️⃣ Kondisi khusus: early_access === true
    if (early_access === true) {
      switch (visitor_give_access) {
        case 0:
          return (
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={!can_revoke || allDisabled}
                onClick={() => onAccessAction?.(row, 'revoke')}
              >
                Revoke
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#000' }}
                size="small"
                disabled={!can_block || allDisabled}
                onClick={() => onAccessAction?.(row, 'block')}
              >
                Block
              </Button>
            </Box>
          );

        case 1: // Grant → boleh Revoke & Block
          return (
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={!can_revoke || allDisabled}
                onClick={() => onAccessAction?.(row, 'revoke')}
              >
                Revoke
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#000' }}
                size="small"
                disabled={!can_block || allDisabled}
                onClick={() => onAccessAction?.(row, 'block')}
              >
                Block
              </Button>
            </Box>
          );

        case 2:
        case 3:
          return <></>;

        default:
          return <></>;
      }
    }

    switch (visitor_give_access) {
      case 1: // Grant
        return (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={!can_revoke || allDisabled}
              onClick={() => onAccessAction?.(row, 'revoke')}
            >
              Revoke
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#000' }}
              size="small"
              disabled={!can_block || allDisabled}
              onClick={() => onAccessAction?.(row, 'block')}
            >
              Block
            </Button>
          </Box>
        );

      case 2: // Revoke
        return <></>;

      case 3: // Block
        return <></>;

      case 4: // Unblock (opsional)
        return (
          <Button
            variant="contained"
            sx={{ backgroundColor: '#000' }}
            size="small"
            disabled={allDisabled}
            onClick={() => onAccessAction?.(row, 'block')}
          >
            Block
          </Button>
        );

      default: // No Action
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={!can_grant || allDisabled}
            onClick={() => onAccessAction?.(row, 'grant')}
          >
            Grant
          </Button>
        );
    }
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
                        marginTop: '0 !important',
                        '& .MuiTabs-scroller': {
                          overflowX: 'auto !important',
                          WebkitOverflowScrolling: 'touch',
                        },
                        '& .MuiTabs-flexContainer': {
                          gap: 0.5,
                        },
                        '& .MuiTab-root': {
                          minWidth: 'auto',
                          whiteSpace: 'nowrap',
                          minHeight: 20,
                          textTransform: 'none',
                          fontSize: '0.6rem',
                          px: 1.5,
                          // mt: { xs: 1, sm: 2 },
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
      <BlankCard sx={{ height: { height } }}>
        <CardContent sx={{ height: { height } }}>
          <Grid2 container sx={{ marginBottom: 0.1 }}>
            {isSiteSpaceName && (
              <Grid2
                size={{ xs: 12 }}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap={'wrap'}
                sx={{
                  mb: 2,
                  gap: { xs: 1.5, md: 0 },
                }}
              >
                <Breadcrumbs aria-label="breadcrumb">
                  {breadcrumbItems?.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;
                    return isLast ? (
                      <Typography key={item.id} sx={{ color: 'text.primary', fontSize: '16px' }}>
                        {item.name}
                      </Typography>
                    ) : (
                      <Link
                        key={item.id}
                        to={`/admin/manage/site-space/${item.id}`}
                        onClick={() => setCurrentId(item.id)}
                      >
                        <Typography sx={{ color: 'primary.main', fontSize: '16px' }}>
                          {item.name}
                        </Typography>
                      </Link>
                    );
                  })}
                </Breadcrumbs>
              </Grid2>
            )}
            <Grid2
              size={{ xs: 12 }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap={'wrap'}
              sx={{
                mb: 2,
                gap: { xs: 1.5, md: 0 },
              }}
            >
              {/* SEARCH MENU */}
              <Stack direction="row" spacing={2}>
                {isHaveSearch && (
                  <Box
                    // container
                    // spacing={0.5}

                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={0.5}
                    flexWrap={'wrap'}
                  >
                    {/* <Grid2 size={{ xs: 12, lg: 10 }}> */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      sx={{
                        height: 36,
                        width: isSmallScreen ? '100%' : '300px',
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
                    {/* </Grid2>
                    <Grid2 size={{ xs: 6, lg: 3 }}> */}
                    <Box display="flex" gap={0.5}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSearch}
                        sx={{
                          height: 36,
                          width: '100%',
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography fontSize={'0.7rem'} variant="caption" my={0.2}>
                          {t('search')}
                        </Typography>
                      </Button>
                      {isOperatorSetting && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={onNavigatePage}
                          startIcon={<IconArrowAutofitLeft width={18} />}
                          sx={{
                            height: 36,
                            width: '100%',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                          }}
                          size="medium"
                        >
                          Operator
                        </Button>
                      )}
                      {isBlacklistPage && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={onNavigatePage}
                          startIcon={<IconArrowAutofitLeft width={18} />}
                          sx={{
                            height: 36,
                            width: '100%',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                          }}
                          size="medium"
                        >
                          Blacklist
                        </Button>
                      )}
                    </Box>
                    {/* </Grid2> */}
                  </Box>
                )}
                {isHaveHeaderTitle && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '',
                      textTransform: 'capitalize',
                    }}
                  >
                    {titleHeader}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap={'wrap'} gap={0}>
                {/* {isHaveExportPdf && (
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
                )} */}

                {/* PRINT */}
                {isHavePrint && onPrint && (
                  <Button
                    size="medium"
                    variant="contained"
                    startIcon={<IconPrinter size={16} />}
                    color="primary"
                    sx={{ height: 36 }}
                    onClick={onPrint}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Print
                    </Typography>
                  </Button>
                )}

                {/* EXPORT PDF */}
                {isHaveExportPdf && onExportPdf && (
                  <Button
                    size="medium"
                    variant="contained"
                    startIcon={<IconFileTypePdf size={16} />}
                    color="error"
                    sx={{ height: 36 }}
                    onClick={onExportPdf}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Export PDF
                    </Typography>
                  </Button>
                )}

                {/* EXPORT CSV */}
                {isHaveExportCsv && onExportCsv && (
                  <Button
                    size="medium"
                    variant="contained"
                    startIcon={<IconFileSpreadsheet size={16} />}
                    color="success"
                    sx={{ height: 36 }}
                    onClick={onExportCsv}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Export CSV
                    </Typography>
                  </Button>
                )}

                {/* EXPORT EXCEL */}
                {isHaveExportExcel && onExportExcel && (
                  <Button
                    size="medium"
                    variant="contained"
                    startIcon={<IconFileExport size={16} />}
                    color="secondary"
                    sx={{ height: 36 }}
                    onClick={onExportExcel}
                  >
                    <Typography variant="caption" fontSize={'0.7rem'}>
                      Export Excel
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
                        startIcon={<InsertDriveFile sx={{ color: 'white' }} />}
                        color="success"
                        sx={{ height: 36 }}
                      >
                        <Typography variant="caption" fontSize={'0.7rem'}>
                          Import XLS
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

                {isHaveFilter && columnss.length > 0 && (
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
                          sx: { fontSize: '0.7rem' },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <Typography fontSize={'0.7rem'} variant="caption">
                          Sort by column
                        </Typography>
                      </MenuItem>
                      {columnss.map((col) => (
                        <MenuItem key={col} value={col}>
                          <Typography fontSize={'0.7rem'} variant="caption">
                            {toTitleCase(col)}
                          </Typography>
                        </MenuItem>
                      ))}
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

                {!isNoActionTableHead ? (
                  <Box display="flex" alignItems="center" gap={3} pr={2.5}>
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
                        if (confirmed) {
                          setCheckedIds([]);
                          if (setSelectedRows) {
                            setSelectedRows([]);
                          }
                        }
                      }}
                    />
                  </Box>
                ) : null}
              </Grid2>
            )}
          </Grid2>
          <TableContainer
            sx={{
              overflowX: paginatedData.length === 0 ? 'hidden' : 'auto',
              overflowY: paginatedData.length === 0 ? 'hidden' : 'auto',
              width: '100%',
            }}
          >
            {paginatedData.length === 0 && !loading ? (
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 300,
                    }}
                  >
                    <TableCell
                      colSpan={
                        columns.length + (isHaveChecked ? 1 : 0) + 1 + (isHaveAction ? 1 : 0)
                      }
                      sx={{ padding: 0 }}
                    >
                      <Box
                        height={150}
                        width="100%"
                        display="flex"
                        justifyContent="space-around"
                        alignItems="center"
                        flexDirection="column"
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.secondary',
                        }}
                      >
                        <img src={backgroundnodata} alt="No Data" height="100" width="100%" />
                        <Typography variant="body1">No Data available</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            ) : (
              <Table
                aria-label="simple table"
                sx={{
                  width: '100%',
                  // overflowX: 'auto',
                }}
                stickyHeader={stickyHeader}
                // sx={{
                // width: '100%',
                // tableLayout: 'fixed',
                // whiteSpace: 'normal', // biar teks bisa wrap
                // }}
              >
                <TableHead>
                  <TableRow>
                    {/* ✅ Checkbox */}
                    {isHaveChecked && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          background: 'white',
                          width: 40,
                          padding: 0,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton
                            variant="rectangular"
                            width={20}
                            height={20}
                            animation="wave"
                            sx={{ marginLeft: '16px' }}
                          />
                        ) : (
                          paginatedData.length > 0 && (
                            <Checkbox
                              checked={
                                paginatedData.length > 0 &&
                                paginatedData.every((r) => checkedIds.includes(r.id))
                              }
                              indeterminate={
                                paginatedData.some((r) => checkedIds.includes(r.id)) &&
                                !paginatedData.every((r) => checkedIds.includes(r.id))
                              }
                              onChange={handleCheckAll}
                            />
                          )
                        )}
                      </TableCell>
                    )}

                    {isTreeSiteType && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          background: 'white',
                          width: 40,
                          padding: 0,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton
                            variant="rectangular"
                            width={20}
                            height={20}
                            animation="wave"
                            sx={{ marginLeft: '16px' }}
                          />
                        ) : (
                          // paginatedData.length > 0 && (
                          //   <Checkbox
                          //     checked={
                          //       paginatedData.length > 0 &&
                          //       paginatedData.every((r) => checkedIds.includes(r.id))
                          //     }
                          //     indeterminate={
                          //       paginatedData.some((r) => checkedIds.includes(r.id)) &&
                          //       !paginatedData.every((r) => checkedIds.includes(r.id))
                          //     }
                          //     onChange={handleCheckAll}
                          //   />
                          // )
                          <></>
                        )}
                      </TableCell>
                    )}

                    {/* ✅ Action left (Visitor mode) */}
                    {isHaveAction && isActionVisitor && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
                          zIndex: 4,
                          background: 'white',
                          minWidth: ACTION_COL_WIDTH,
                          maxWidth: ACTION_COL_WIDTH,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton variant="text" width="50%" height={18} animation="wave" />
                        ) : (
                          paginatedData.length > 0 && 'Action'
                        )}
                      </TableCell>
                    )}

                    {/* {paginatedData.length > 0 && ( */}
                    <TableCell
                      sx={{
                        position: { xs: 'static', lg: 'sticky' },
                        left:
                          (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
                          (isActionVisitor ? ACTION_COL_WIDTH : 0),
                        zIndex: 4,
                        background: 'white',
                        minWidth: INDEX_COL_WIDTH,
                        maxWidth: INDEX_COL_WIDTH,
                      }}
                    >
                      {loading ? (
                        <Skeleton variant="text" width="40%" height={18} animation="wave" />
                      ) : paginatedData.length > 0 ? (
                        '#'
                      ) : (
                        ''
                      )}
                    </TableCell>
                    {/* )} */}

                    {/* ✅ Dynamic columns */}
                    {columns.map((colName, idx) => {
                      const makeSticky = isStickyVisitorCol(idx);
                      const isEarlyAccess = colName === 'early_access';
                      let label: string = colName;
                      if (label.startsWith('is_')) {
                        label = label.replace(/^is_/, '');
                      }

                      const pretty = label
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <TableCell
                          key={`col-${idx}`}
                          sx={{
                            ...(makeSticky && {
                              position: { xs: 'static', lg: 'sticky' },
                              left: { xs: 'auto', lg: getStickyLeft(idx) },
                              zIndex: { xs: 'auto', lg: 4 },
                            }),
                            background: 'white',
                            minWidth: DATA_COL_WIDTH,
                            maxWidth: DATA_COL_WIDTH,
                            // ...(isEarlyAccess && { textAlign: 'center' }),
                          }}
                        >
                          {loading ? (
                            <Skeleton
                              variant="text"
                              width={`${40 + Math.random() * 40}%`}
                              height={18}
                              animation="wave"
                            />
                          ) : (
                            // colName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                            pretty
                          )}
                        </TableCell>
                      );
                    })}

                    {/* ✅ Action right */}
                    {isHaveAction && !isActionVisitor && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          bgcolor: 'background.paper',
                          zIndex: 4,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton
                            variant="text"
                            width="50"
                            height={18}
                            animation="wave"
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          />
                        ) : (
                          paginatedData.length > 0 && 'Action'
                        )}
                      </TableCell>
                    )}

                    {/* ✅ Action-only edit */}
                    {isHaveActionOnlyEdit && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          background: 'white',
                          zIndex: 2,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton variant="text" width="40%" height={18} animation="wave" />
                        ) : (
                          'Action'
                        )}
                      </TableCell>
                    )}

                    {isCopyLink && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          background: 'white',
                          zIndex: 2,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton variant="text" width="40%" height={18} animation="wave" />
                        ) : (
                          'Action'
                        )}
                      </TableCell>
                    )}

                    {isButtonRegisteredSite && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          background: 'white',
                          zIndex: 2,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton variant="text" width="40%" height={18} animation="wave" />
                        ) : (
                          'Action'
                        )}
                      </TableCell>
                    )}

                    {isButtonEnabled && (
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          background: 'white',
                          zIndex: 2,
                          textAlign: 'center',
                        }}
                      >
                        {loading ? (
                          <Skeleton variant="text" width="40%" height={18} animation="wave" />
                        ) : (
                          'Action'
                        )}
                      </TableCell>
                    )}

                    {/* ✅ Arrival button */}
                    {isHaveArrival && (
                      <TableCell
                        sx={{ position: 'sticky', right: 0, background: 'white', zIndex: 2 }}
                      >
                        {loading ? (
                          <Skeleton variant="rectangular" width={80} height={30} animation="wave" />
                        ) : (
                          paginatedData.length > 0 && <Button variant="contained">Arrival</Button>
                        )}
                      </TableCell>
                    )}

                    {/* ✅ Choose Card button */}
                    {isHaveCard && (
                      <TableCell
                        sx={{ position: 'sticky', right: 0, background: 'white', zIndex: 2 }}
                      >
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          onClick={() => onChooseCard?.()}
                        >
                          Choose Card
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, idx) => (
                      <TableRow key={`skeleton-${idx}`}>
                        {isHaveChecked && (
                          <TableCell
                            padding="checkbox"
                            align="center"
                            sx={{
                              position: 'sticky',
                              background: 'white',
                              zIndex: 2,
                              padding: 2,
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              height: '100%',
                            }}
                          >
                            <Skeleton
                              variant="rectangular"
                              width={20}
                              height={20}
                              animation="wave"
                            />
                          </TableCell>
                        )}

                        {/* ✅ Action visitor left-side (mis. dashboard visitor) */}
                        {isHaveAction && isActionVisitor && (
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
                              background: 'white',
                              zIndex: 2,
                              width: ACTION_COL_WIDTH,
                            }}
                          >
                            <Box display="flex" gap={0.5} justifyContent="center">
                              {[...Array(3)].map((__, j) => (
                                <Skeleton
                                  key={j}
                                  variant="rectangular"
                                  width={28}
                                  height={28}
                                  animation="wave"
                                  sx={{ borderRadius: 1 }}
                                />
                              ))}
                            </Box>
                          </TableCell>
                        )}

                        {/* ✅ Index (No) */}
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left:
                              (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
                              (isActionVisitor ? ACTION_COL_WIDTH : 0),
                            background: 'white',
                            zIndex: 1,
                            width: INDEX_COL_WIDTH,
                          }}
                        >
                          <Skeleton variant="text" width="30%" height={18} animation="wave" />
                        </TableCell>

                        {/* ✅ Main data columns */}
                        {columns.map((col, i) => (
                          <TableCell key={i}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {/* Skeleton type by column name */}
                              {col.includes('image') || col.includes('avatar') ? (
                                <>
                                  <Skeleton
                                    variant="circular"
                                    width={32}
                                    height={32}
                                    animation="wave"
                                  />
                                </>
                              ) : col.includes('status') ? (
                                <Skeleton
                                  variant="rectangular"
                                  width={60}
                                  height={24}
                                  sx={{ borderRadius: 1 }}
                                  animation="wave"
                                />
                              ) : (
                                <Skeleton
                                  variant="text"
                                  width={`${40 + Math.random() * 40}%`}
                                  height={18}
                                  animation="wave"
                                />
                              )}
                            </Box>
                          </TableCell>
                        ))}

                        {/* ✅ Action right-side */}
                        {isHaveAction && !isActionVisitor && (
                          <TableCell
                            align="center"
                            sx={{ position: 'sticky', right: 0, background: 'white', zIndex: 2 }}
                          >
                            <Box display="flex" justifyContent="center" gap={0.5}>
                              {[...Array(3)].map((__, j) => (
                                <Skeleton
                                  key={j}
                                  variant="rectangular"
                                  width={28}
                                  height={28}
                                  animation="wave"
                                  sx={{ borderRadius: 1 }}
                                />
                              ))}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 && !loading ? (
                    <></>
                  ) : (
                    paginatedData.map((row: any, index) => (
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

                        {isTreeSiteType && (
                          <TableCell width={50}>
                            <IconButton size="small" onClick={() => toggleRow(row.id)}>
                              {openRow === row.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                        )}

                        {isHaveAction && isActionVisitor && (
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
                              zIndex: 3,
                              background: 'white',
                              minWidth: ACTION_COL_WIDTH,
                              maxWidth: ACTION_COL_WIDTH,
                            }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={0.3}
                              justifyContent={'center'}
                            >
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
                              {isActionEmployee == false && (
                                <>
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
                                        '&:hover': {
                                          backgroundColor: 'error.dark',
                                          color: 'white',
                                        },
                                      }}
                                    >
                                      <IconLogout2 width={18} height={18} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        )}

                        <TableCell
                          sx={{
                            position: { xs: 'static', lg: 'sticky' },
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
                                  position: { xs: 'static', lg: 'sticky' },
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
                              ) : col === 'type' && isAccessControlType ? (
                                <>{row.type === 0 ? 'Access' : 'Group'}</>
                              ) : col === 'card_status' ? (
                                (CARD_STATUS[Number(row[col])] ?? String(row[col] ?? '-'))
                              ) : col === 'is_employee' ? (
                                row[col] ? (
                                  <IconUserCheck size={20} color="green" />
                                ) : (
                                  <IconUserX size={20} color="red" />
                                )
                              ) : col === 'visitor_status' ? (
                                <Box
                                  sx={{
                                    backgroundColor: statusBgMap[row.visitor_status] || defaultBg,
                                    borderRadius: '999px',
                                    color: '#fff',
                                    px: 1.5,
                                    py: 0.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {row.visitor_status || '-'}
                                </Box>
                              ) : col === 'document_type' ? (
                                (DOCUMENT_TYPE[Number(row[col])] ?? String(row[col] ?? '-'))
                              ) : col === 'status' && isHaveApproval ? (
                                row[col] === 'Accept' ? (
                                  <Typography
                                    sx={{
                                      color: 'success.main',
                                      fontWeight: 400,
                                      backgroundColor: 'success.light',
                                      textAlign: 'center',
                                      padding: 0.5,
                                      borderRadius: '8px',
                                      width: '100px',
                                    }}
                                    variant="body2"
                                  >
                                    Accept
                                  </Typography>
                                ) : row[col] === 'Deny' ? (
                                  <Typography
                                    sx={{
                                      color: 'error.main',
                                      fontWeight: 400,
                                      backgroundColor: 'error.light',
                                      textAlign: 'center',
                                      padding: 0.5,
                                      borderRadius: '8px',
                                      width: '100px',
                                    }}
                                    variant="body2"
                                  >
                                    Deny
                                  </Typography>
                                ) : (
                                  <>
                                    <Typography
                                      sx={{
                                        color: '#fff',
                                        fontWeight: 400,
                                        backgroundColor: 'grey',
                                        textAlign: 'center',
                                        padding: 0.5,
                                        borderRadius: '8px',
                                        width: '100px',
                                      }}
                                      variant="body2"
                                    >
                                      Pending
                                    </Typography>
                                  </>
                                )
                              ) : isHavePeriod && col === 'visitor_period_start' ? (
                                <>
                                  {formatDate(row[col] as string)}
                                  <br />
                                </>
                              ) : isHaveEmployee && col === 'host' ? (
                                <Tooltip title="View Host">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEmployeeClick?.(row)}
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
                              ) : col === 'employee' ? (
                                <>
                                  {row.employee && (
                                    <Tooltip title="You are the host">
                                      <IconStarFilled
                                        color="gold"
                                        size={24}
                                        style={{ color: 'gold' }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              ) : isHaveGender && col === 'gender' ? (
                                (GENDER_MAP[String(row[col])] ?? String(row[col] ?? '-'))
                              ) : isSiteSpaceType && col === 'type' ? (
                                (SITE_MAP[Number(row[col])] ?? String(row[col] ?? '-'))
                              ) : isHaveImage &&
                                imageFields.includes(col) &&
                                typeof row[col] === 'string' &&
                                row[col].trim() !== '' ? (
                                <img
                                  loading="lazy"
                                  src={(() => {
                                    const value = row[col];
                                    if (value.startsWith('data:image')) return value;
                                    if (value.startsWith('http')) return value;
                                    return `${BASE_URL}${value}`;
                                  })()}
                                  style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : isHaveImage && imageFields.includes(col) ? (
                                <>-</>
                              ) : (isDataVerified && col === 'secure') ||
                                col === 'can_upload' ||
                                col === 'can_signed' ||
                                col === 'can_declined' ||
                                col === 'is_primary' ||
                                col === 'is_employee_used' ||
                                col === 'is_multi_site' ||
                                col === 'is_used' ||
                                col === 'status_link' ||
                                col === 'is_active' ||
                                col === 'early_access' ? (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="start"
                                  width="100%"
                                >
                                  <Tooltip
                                    title={
                                      row[col]
                                        ? (tooltipLabels[col]?.true ?? 'Verified')
                                        : (tooltipLabels[col]?.false ?? 'Not Verified')
                                    }
                                  >
                                    <Box
                                      sx={(theme) => ({
                                        backgroundColor: row[col]
                                          ? theme.palette.success.main
                                          : theme.palette.error.main,
                                        borderRadius: '50%',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: '2px',
                                      })}
                                    >
                                      {row[col] ? (
                                        <IconCheck color="white" size={16} />
                                      ) : (
                                        <IconX color="white" size={16} />
                                      )}
                                    </Box>
                                  </Tooltip>
                                </Box>
                              ) : isHavePdf && col === 'file' ? (
                                <Tooltip title="View File">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onFileClick?.(row)}
                                    sx={{
                                      borderRadius: '50%',
                                      width: 30,
                                      height: 30,
                                      backgroundColor: (theme) => theme.palette.grey[100],
                                    }}
                                  >
                                    <IconFileText />
                                  </IconButton>
                                </Tooltip>
                              ) : col === 'email' ? (
                                <Box
                                  display="inline-flex"
                                  alignItems="center"
                                  justifyContent="start"
                                  textAlign={'left'}
                                  gap={0.5}
                                  width="100%"
                                  sx={{
                                    wordBreak: 'break-word',
                                    whiteSpace: 'normal',
                                  }}
                                >
                                  <span>{(row[col] as React.ReactNode) ?? '-'}</span>

                                  {isHaveVerified &&
                                    (row.is_email_verified ? (
                                      <Tooltip title="Email Verified">
                                        <Box
                                          sx={{
                                            backgroundColor: '#13DEB9',
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '1px',
                                          }}
                                        >
                                          <IconCheck color="white" size={16} />
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Email Not Verified">
                                        <Box
                                          sx={{
                                            backgroundColor: 'red',
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '1px',
                                          }}
                                        >
                                          <IconX color="white" size={16} />
                                        </Box>
                                      </Tooltip>
                                    ))}
                                </Box>
                              ) : col === 'password' ? (
                                <Box
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={0.5}
                                  justifyContent={'start'}
                                  width="100%"
                                >
                                  {isHavePassword ? (
                                    visiblePasswords[row.id] ? (
                                      <>
                                        <span>{String(row[col] ?? '-')}</span>
                                        <Tooltip title="Hide Password">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              togglePassword(row.id);
                                            }}
                                          >
                                            <IconEyeOff size={18} />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <Tooltip title="Show Password">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            togglePassword(row.id);
                                          }}
                                          sx={{
                                            bgcolor: 'grey.200',
                                            '&:hover': {
                                              bgcolor: 'grey.300',
                                            },
                                            borderRadius: '50%',
                                            p: 0.5,
                                          }}
                                        >
                                          <IconEye size={18} />
                                        </IconButton>
                                      </Tooltip>
                                    )
                                  ) : (
                                    '••••••••'
                                  )}
                                </Box>
                              ) : isHaveCard && col === 'card' ? (
                                row[col] ? (
                                  <>{row[col]}</>
                                ) : (
                                  <>-</>
                                )
                              ) : col === 'is_blacklist' ? (
                                <>
                                  <Box
                                    sx={(theme) => ({
                                      backgroundColor: row[col]
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                      borderRadius: '50%',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      p: '2px',
                                    })}
                                  >
                                    {row[col] ? (
                                      <Tooltip title="Blacklist" arrow>
                                        <IconCheck color="white" size={18} />
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Not Blacklist" arrow>
                                        <IconX color="white" size={16} />
                                      </Tooltip>
                                    )}
                                  </Box>
                                </>
                              ) : isHaveBooleanSwitch && typeof row[col] === 'boolean' ? (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  width={'100%'}
                                  justifyContent={'center'}
                                >
                                  <Switch
                                    checked={row[col] as boolean}
                                    onChange={(_, checked) =>
                                      onBooleanSwitchChange?.(row.id, col, checked)
                                    }
                                    color="primary"
                                    size="small"
                                  />
                                </Box>
                              ) : isHaveObjectData &&
                                objectFields?.includes(col) &&
                                typeof row[col] === 'object' &&
                                row[col] !== null ? (
                                Array.isArray(row[col]) ? (
                                  row[col].map((item: any) => item.name).join(', ')
                                ) : (
                                  ((row[col] as { name?: string }).name ?? '-')
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

                                  {/* {isHaveVerified &&
                                    col === 'email' &&
                                    (col == 'is_email_verified' ? (
                                      <Tooltip title="Email Verified">
                                        <Box
                                          sx={{
                                            // mt: '25px',
                                            backgroundColor: 'green',
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: '5px',
                                            padding: '1px',
                                          }}
                                        >
                                          <IconCheck color="white" size={16} />
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Email Not Verified">
                                        <Box
                                          sx={{
                                            // mt: '25px',
                                            backgroundColor: 'red',
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: '5px',
                                            padding: '1px',
                                          }}
                                        >
                                          <IconX color="white" size={16} />
                                        </Box>
                                      </Tooltip>
                                    ))} */}
                                </>
                              )}
                            </TableCell>
                          );
                        })}
                        {isHaveCard && (
                          <TableCell>
                            <Typography variant="body2" color="text.secondary"></Typography>
                          </TableCell>
                        )}

                        {isHaveAction && !isActionVisitor && (
                          <TableCell
                            sx={{
                              position: 'sticky',
                              right: 0,
                              bgcolor: 'background.paper',
                              zIndex: 2,
                              p: 0,
                              verticalAlign: 'middle',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                px: 1.5,
                                py: 1.25,
                                height: '100%',
                              }}
                            >
                              {isHaveApproval ? (
                                (row as any)?.status == null ? (
                                  <>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        px: 1.5,
                                        py: 1.25,
                                        height: '100%',
                                        borderBottom: 'none',
                                      }}
                                    >
                                      {/* ✅ Accept / Denied */}
                                      <Tooltip title="Accept">
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          size="small"
                                          sx={{
                                            minWidth: 64,
                                            textTransform: 'none',
                                            borderBottom: 'none',
                                          }}
                                          onClick={() => onAccept?.(row)}
                                        >
                                          Accept
                                        </Button>
                                      </Tooltip>

                                      <Tooltip title="Deny">
                                        <Button
                                          variant="contained"
                                          color="error"
                                          size="small"
                                          sx={{ minWidth: 64, textTransform: 'none' }}
                                          onClick={() => onDenied?.(row)}
                                        >
                                          Denied
                                        </Button>
                                      </Tooltip>
                                    </Box>
                                  </>
                                ) : (
                                  <Box
                                    sx={{
                                      position: 'sticky',
                                      right: 0,
                                      bgcolor: 'background.paper',
                                      zIndex: 2,
                                      p: 0,
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    -
                                  </Box>
                                )
                              ) : isHaveAccess ? (
                                <TableCell
                                  sx={{
                                    position: 'sticky',
                                    right: 0,
                                    bgcolor: 'background.paper',
                                    zIndex: 2,
                                    p: 0,
                                    verticalAlign: '',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  {getAccessActions(row)}
                                </TableCell>
                              ) : isHaveView ? (
                                <>
                                  <Tooltip title="View Invitation">
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

                                  <Tooltip title="View Invitation">
                                    <IconButton
                                      onClick={() => onView?.(row)}
                                      disableRipple
                                      sx={{
                                        color: 'white',
                                        backgroundColor: '#FA896B',
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
                                      <IconPencil width={18} height={18} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : isHavePermission ? (
                                <>
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

                                  {/* 🗑 Delete */}
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
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                          color: 'white',
                                        },
                                      }}
                                    >
                                      <IconTrash width={14} height={14} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sync Visitor Type">
                                    <Button
                                      onClick={() => onPermission?.(row)}
                                      disableRipple
                                      sx={{
                                        color: 'white',
                                      }}
                                      variant="contained"
                                      color="primary"
                                    >
                                      {/* <IconRefresh width={18} height={18} /> */}
                                      Permission
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : isHaveViewAndAction ? (
                                <>
                                  <Tooltip title="View Detail Schedule">
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

                                  {/* 🗑 Delete */}
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
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                          color: 'white',
                                        },
                                      }}
                                    >
                                      <IconTrash width={14} height={14} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sync Visitor Type">
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
                                      <IconRefresh width={18} height={18} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : isBlacklistAction ? (
                                !row.is_blacklist ? (
                                  <Tooltip
                                    title="Blacklist Visitor"
                                    arrow
                                    placement="top"
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '0.8rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                    }}
                                  >
                                    <Button
                                      size="small"
                                      startIcon={<IconXboxX />}
                                      onClick={() => onBlacklist?.(row)}
                                      sx={{
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        fontWeight: 500,
                                        backgroundColor: '#000',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#000', opacity: 0.8 },
                                      }}
                                    >
                                      Blacklist
                                    </Button>
                                  </Tooltip>
                                ) : null
                              ) : isActionListVisitor ? (
                                <>
                                  <Tooltip
                                    title="Block Visitor"
                                    arrow
                                    placement="top"
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '0.8rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                    }}
                                  >
                                    <Button
                                      // variant="contained"
                                      // color="error"
                                      size="small"
                                      startIcon={<IconForbid2 />}
                                      // onClick={() => onBlock?.(row)} // optional trigger
                                      sx={{
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        fontWeight: 500,
                                        backgroundColor: '#000',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#000 ', opacity: 0.8 },
                                      }}
                                    >
                                      Block
                                    </Button>
                                  </Tooltip>
                                  <Tooltip
                                    title="Blacklist Visitor"
                                    arrow
                                    placement="top"
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '0.8rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                    }}
                                  >
                                    <Button
                                      // variant="contained"
                                      // color="error"
                                      size="small"
                                      startIcon={<IconXboxX />}
                                      // onClick={() => onBlock?.(row)} // optional trigger
                                      sx={{
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        fontWeight: 500,
                                        backgroundColor: '#6B0000',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#000 ', opacity: 0.8 },
                                      }}
                                    >
                                      Blacklist
                                    </Button>
                                  </Tooltip>
                                  <Tooltip
                                    title="Sign alert to visitor"
                                    arrow
                                    placement="top"
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '0.8rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                    }}
                                  >
                                    <Button
                                      // variant="contained"
                                      // color="error"
                                      size="small"
                                      startIcon={<IconAlertSquare />}
                                      // onClick={() => onBlock?.(row)} // optional trigger
                                      sx={{
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        fontWeight: 500,
                                        backgroundColor: '#FFC107',
                                        // width: '100%',
                                        px: 1,
                                        textWrap: 'nowrap',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#FFC107 ', opacity: 0.8 },
                                      }}
                                    >
                                      Sign Alert
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : (
                                <Box display="flex" gap={0.5}>
                                  {isHaveSettingOperator &&
                                    (row.group_id?.toUpperCase() === GroupRoleId.OperatorAdmin ||
                                      row.group_id?.toUpperCase() === GroupRoleId.OperatorVMS) && (
                                      <Tooltip title="Setting">
                                        <IconButton
                                          onClick={() => onSettingOperator?.(row)}
                                          disableRipple
                                          sx={{
                                            color: 'white',
                                            backgroundColor: '#000',
                                            width: 28,
                                            height: 28,
                                            p: 0.5,
                                            borderRadius: '50%',
                                            '&:hover': { backgroundColor: '#000', color: 'white' },
                                          }}
                                        >
                                          <IconSettings width={14} height={14} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
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

                                  {/* 🗑 Delete */}
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
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                          color: 'white',
                                        },
                                      }}
                                    >
                                      <IconTrash width={14} height={14} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
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
                              justifyContent: 'center',
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

                        {isButtonGiveAccess && isButtonRegisteredSite && isButtonSiteAccess && (
                          <TableCell
                            sx={{
                              position: 'sticky',
                              right: 0,
                              background: 'white',
                              zIndex: 2,
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Box display="flex" alignItems="end" gap={1}>
                              {/* Tombol Edit (Primary, Kecil) */}
                              <Tooltip title="Give Access" arrow>
                                <Button
                                  onClick={() => onGiveAccess?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="primary"
                                >
                                  Give Access
                                </Button>
                              </Tooltip>
                              <Tooltip title="Registered Site" arrow>
                                <Button
                                  onClick={() => onRegisteredSite?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="secondary"
                                >
                                  Registered Site
                                </Button>
                              </Tooltip>
                              <Tooltip title="Site Access" arrow>
                                <Button
                                  onClick={() => onSiteAccess?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="warning"
                                >
                                  Site Access
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}

                        {isCopyLink && (
                          <TableCell
                            sx={{
                              position: 'sticky',
                              right: 0,
                              background: 'white',
                              zIndex: 2,
                              display: 'flex',
                              gap: 1,
                              mt: 0.5,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Box display="flex" alignItems="end" gap={1}>
                              {/* Tombol Edit (Primary, Kecil) */}
                              <Tooltip title="Copy Link" arrow>
                                <IconButton
                                  onClick={() => onCopyLink?.(row)}
                                  disableRipple
                                  sx={{
                                    color: 'white',
                                    backgroundColor: '#FA896B',
                                    width: 28,
                                    height: 28,
                                    p: 0.5,
                                    borderRadius: '50%',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  <IconCopy width={14} height={14} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Detail Link" arrow>
                                <IconButton
                                  onClick={() => onDetailLink?.(row)}
                                  disableRipple
                                  sx={{
                                    color: 'white',
                                    backgroundColor: 'gray',
                                    width: 28,
                                    height: 28,
                                    p: 0.5,
                                    borderRadius: '50%',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  {/* <IconCopy width={14} height={14} /> */}
                                  <IconEye width={24} height={24} />
                                </IconButton>
                              </Tooltip>
                              {/* <Tooltip title="Registered Site" arrow>
                                <Button
                                  onClick={() => onRegisteredSite?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="secondary"
                                >
                                  Registered Site
                                </Button>
                              </Tooltip> */}
                              {/* <Tooltip title="Site Access" arrow>
                                <Button
                                  onClick={() => onSiteAccess?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="warning"
                                >
                                  Site Access
                                </Button>
                              </Tooltip> */}
                            </Box>
                          </TableCell>
                        )}

                        {isButtonEnabled && isButtonDisabled && (
                          <TableCell
                            sx={{
                              position: 'sticky',
                              right: 0,
                              background: 'white',
                              zIndex: 2,
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Box display="flex" alignItems="end" gap={1}>
                              {/* Tombol Edit (Primary, Kecil) */}
                              <Tooltip title="Enabled" arrow>
                                <Button
                                  onClick={() => onGiveAccess?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="primary"
                                >
                                  Enabled
                                </Button>
                              </Tooltip>
                              <Tooltip title="Disabled" arrow>
                                <Button
                                  onClick={() => onIsButtonDisabled?.(row)}
                                  // disableRipple
                                  variant="contained"
                                  color="error"
                                >
                                  Disabled
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
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
              sx={{ overflow: 'hidden' }}
            />
          )}
        </CardContent>
      </BlankCard>
      {/* DRAWER CALENDER RANGE FILTER */}
      <Drawer anchor="right" open={showDrawer} onClose={() => setShowDrawer(false)}>
        <Calendar onChange={onApplyFilterCalender} />
      </Drawer>

      <Drawer
        anchor="right"
        PaperProps={{
          sx: {
            width: { xs: '60vw', sm: '40vw' },
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
