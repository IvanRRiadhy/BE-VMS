import { Box, Grid2 as Grid, MenuItem, Button, Autocomplete } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/id';
import { IconRefresh } from '@tabler/icons-react';
import { useEmployeePagination } from 'src/hooks/Employee/useEmployeePagination';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'src/hooks/useDebounce';
import { useInvitationVisitor } from 'src/hooks/Invitation/useInvitationVisitor';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useInvitationAccessControl } from 'src/hooks/Invitation/useInvitationAccessControl';
import useInvitationSite from 'src/hooks/Invitation/useInvitationSite';

dayjs.extend(utc);

interface VisitorFilters {
  site: string;
  host: string;
  visitorName: string;
  access: string;
}

interface VisitorFilterProps {
  filters: VisitorFilters;
  setFilters: React.Dispatch<React.SetStateAction<VisitorFilters>>;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  handleResetFilter: () => void;
}

const MonitoringFilter = ({
  filters,
  setFilters,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleResetFilter,
}: VisitorFilterProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState<string>('');
  const debounceSearch = useDebounce(search, 500);
  const { data: visitor, isLoading, isFetching } = useInvitationVisitor({
    search: debounceSearch,
    page,
    rowsPerPage,
  });
  // const visitorOptions = visitor?.collection ?? [];
  const { sites = [] } = useInvitationSite();
  const [pageEmployee, setPageEmployee] = useState(0);
  const [rowsPerPageEmployee, setRowsPerPageEmployee] = useState(10);
  const [searchEmployee, setSearchEmployee] = useState('');
  const debouncedSearchEmployee = useDebounce(searchEmployee, 500);
  const [sortDir, setSortDir] = useState('desc');
  const { data: allVisitorEmployee = [], isFetching: isFetchingVisitor } = useEmployeePagination({
    page: pageEmployee,
    rowsPerPage: rowsPerPageEmployee,
    sortDir,
    sort_column: 'created_at',
    search: debouncedSearchEmployee,
  });
  const employeeOptions = allVisitorEmployee?.collection ?? [];
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);
  const [visitorInputValue, setVisitorInputValue] = useState('');
  const [selectedHost, setSelectedHost] = useState<any | null>(null);
  const [hostInputValue, setHostInputValue] = useState('');
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const visitorOptions = useMemo(() => {
    const options = visitor?.collection ?? [];

    if (
      selectedVisitor &&
      !options.some((item: any) => String(item.id) === String(selectedVisitor.id))
    ) {
      return [selectedVisitor, ...options];
    }

    return options;
  }, [visitor?.collection, selectedVisitor]);
  const hostOptions = useMemo(() => {
    const options = employeeOptions ?? [];

    if (
      selectedHost &&
      !options.some(
        (item: any) =>
          String(item.id ?? item.Id) ===
          String(selectedHost.id ?? selectedHost.Id)
      )
    ) {
      return [selectedHost, ...options];
    }

    return options;
  }, [employeeOptions, selectedHost]);
  // const {
  //   data: invitationAccessControl,
  //   isLoading: isLoadingAccess,
  //   refetch,
  // } = useInvitationAccessControl();

  // const accessControls = invitationAccessControl?.collection ?? [];
  useEffect(() => {
    if (!filters.visitorName) {
      setSelectedVisitor(null);
      setVisitorInputValue('');
      setSearch('');
      setPage(0);
    }

    if (!filters.host) {
      setSelectedHost(null);
      setHostInputValue('');
      setSearchEmployee('');
      setPageEmployee(0);
    }

    if (!filters.site) {
      setSelectedSite(null);
    }
  }, [filters.visitorName, filters.host, filters.site]);
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Site */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Site</CustomFormLabel>

          <Autocomplete
            fullWidth
            options={sites}
            value={selectedSite}
            getOptionLabel={(option: any) =>
              option?.name ?? option?.Name ?? ''
            }
            isOptionEqualToValue={(option: any, value: any) =>
              String(option.id ?? option.Id) ===
              String(value.id ?? value.Id)
            }
            onChange={(_, newValue) => {
              setSelectedSite(newValue);

              setFilters((prev) => ({
                ...prev,
                site: newValue?.name ?? newValue?.Name ?? '',
              }));
            }}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Search site..."
                size="small"
              />
            )}
          />
        </Grid>
        {/* Host */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Host</CustomFormLabel>

          <Autocomplete
            fullWidth
            options={hostOptions}
            loading={isFetchingVisitor}
            value={selectedHost}
            inputValue={hostInputValue}
            getOptionLabel={(option: any) =>
              option?.name ?? option?.Name ?? ''
            }
            isOptionEqualToValue={(option: any, value: any) =>
              String(option.id ?? option.Id) ===
              String(value.id ?? value.Id)
            }
            onInputChange={(_, newInputValue, reason) => {
              setHostInputValue(newInputValue);

              if (reason === 'input') {
                setSearchEmployee(newInputValue);
                setPageEmployee(0);
              }

              if (reason === 'clear') {
                setSearchEmployee('');
                setPageEmployee(0);
              }
            }}
            onChange={(_, newValue) => {
              setSelectedHost(newValue);

              const hostName = newValue?.name ?? newValue?.Name ?? '';

              setHostInputValue(hostName);
              setSearchEmployee('');

              setFilters((prev) => ({
                ...prev,
                host: hostName,
              }));
            }}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Search host..."
                size="small"
              />
            )}
          />
        </Grid>

        {/* Visitor Name */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Visitor Name</CustomFormLabel>
          <Autocomplete
            fullWidth
            options={visitorOptions}
            loading={isLoading || isFetching}
            value={selectedVisitor}
            inputValue={visitorInputValue}
            getOptionLabel={(option: any) => option?.name ?? ''}
            isOptionEqualToValue={(option: any, value: any) =>
              String(option.id) === String(value.id)
            }
            onInputChange={(_, newInputValue, reason) => {
              setVisitorInputValue(newInputValue);

              if (reason === 'input') {
                setSearch(newInputValue);
                setPage(0);
              }

              if (reason === 'clear') {
                setSearch('');
                setPage(0);
              }
            }}
            onChange={(_, newValue) => {
              setSelectedVisitor(newValue);

              setVisitorInputValue(newValue?.name ?? '');
              setSearch('');

              setFilters((prev) => ({
                ...prev,
                visitorName: newValue?.name ?? '',
              }));
            }}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Search visitor..."
                size="small"
              />
            )}
          />
        </Grid>

        {/* Access */}
        {/* <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Access</CustomFormLabel>

          <Autocomplete
            fullWidth
            options={accessControls}
            value={
              accessControls.find(
                (item: any) => (item.name ?? item.Name) === filters.access
              ) ?? null
            }
            getOptionLabel={(option: any) => option.name ?? option.Name ?? ''}
            isOptionEqualToValue={(option: any, value: any) =>
              (option.id ?? option.Id) === (value.id ?? value.Id)
            }
            onChange={(_, newValue) =>
              setFilters((prev) => ({
                ...prev,
                access: newValue?.name ?? newValue?.Name ?? '',
              }))
            }
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Search access..."
                size="small"
              />
            )}
          />
        </Grid> */}

        {/* Start Date */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Start Date</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
            <DatePicker
              format="DD/MM/YYYY"
              value={startDate ? dayjs(startDate) : null}
              onChange={(value) => {
                const date = value?.isValid() ? value.format('YYYY-MM-DD') : '';

                setStartDate(date);

                if (date && endDate && dayjs.utc(date).isAfter(dayjs.utc(endDate), 'day')) {
                  setEndDate(date);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  placeholder: 'DD/MM/YYYY',
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <CustomFormLabel sx={{ mt: 0 }}>End Date</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
            <DatePicker
              format="DD/MM/YYYY"
              value={endDate ? dayjs(endDate) : null}
              minDate={startDate ? dayjs(startDate) : undefined}
              onChange={(value) => {
                setEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '');
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  placeholder: 'DD/MM/YYYY',
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Reset */}
        <Grid size={{ xs: 12, sm: 12, xl: 1 }}>
          <CustomFormLabel sx={{ mt: 0 }}>Action</CustomFormLabel>
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="primary"
            startIcon={<IconRefresh />}
            onClick={handleResetFilter}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonitoringFilter;
