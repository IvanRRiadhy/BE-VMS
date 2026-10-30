import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSites } from 'src/hooks/Sites/useSites';

import { getAssemblyPointById } from 'src/customs/api/Admin/Evacuate/index';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { Box } from '@mui/system';
import GlobalBackdropLoading from '../../../components/GlobalBackdrop';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useAssemblyPointPagination } from 'src/hooks/AssemblyPoint/useAssemblyPointPagination';
import useAssemblyPointMutation from 'src/hooks/AssemblyPoint/useAssemblyPointMutation';
import { useHistoryEvacuate } from 'src/hooks/Monitor/useHistoryEvacuate';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface AssemblyPointDialogProps {
  open: boolean;
  onClose: () => void;
}

interface AssemblyPointForm {
  site_id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  latitude: number;
  longitude: number;
}

const initialForm: AssemblyPointForm = {
  site_id: '',
  name: '',
  code: '',
  description: '',
  capacity: 0,
  latitude: 0,
  longitude: 0,
};

const HistoryEvacuateDialog = ({ open, onClose }: AssemblyPointDialogProps) => {
  const { data: sites = [] } = useSites();

  const [loading, setLoading] = useState(false);

  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssemblyPointForm>(initialForm);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data, isLoading, isFetching, error, refetch } = useHistoryEvacuate({
    draw: 0,
    sortColumn: 'started_at',
    sortDir: 'desc',
    // start: page * rowsPerPage,
    // length: rowsPerPage,
    searchValue: search || undefined,
  });

  const historyEvacuate = (data?.collection ?? []).map((item: any) => ({
    site_name: item.site_name ?? '-',
    emergency_type: item.emergency_type ?? '-',
    emergency_status: item.emergency_status ?? '-',
    source: item.source ?? '-',
    triggered_by_name: item.triggered_by_name ?? '-',
    started_at: item.started_at ? formatDateTime(item.started_at) : '-',
    resolved_by_name: item.resolved_by_name ?? '-',
    resolved_at: item.resolved_at ? formatDateTime(item.resolved_at) : '-',
    duration_minutes: item.duration_minutes ?? 0,
    total_required: item.total_required ?? 0,
    total_evacuated: item.total_evacuated ?? 0,
    total_remaining: item.total_remaining ?? 0,
  }));
  const totalRecords = data?.data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.data?.RecordsFiltered ?? 0;

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
        <DialogTitle>
          History
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <DynamicTable
            loading={isLoading || isFetching}
            data={historyEvacuate}
            // isHaveAddData
            // onAddData={handleAdd}
            isHaveSearch
            isHavePagination={false}
            defaultRowsPerPage={rowsPerPage}
            totalCount={totalRecords}
            rowsPerPageOptions={[10, 50, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            currentPage={page}
            searchKeyword={search}
            onSearch={handleSearch}
            // onEdit={(row) => {
            //   handleEdit(row.id);
            // }}
            // onDelete={(row) => handleDelete(row.id)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistoryEvacuateDialog;
