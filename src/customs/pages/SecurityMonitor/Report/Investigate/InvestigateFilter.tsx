import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Search, Refresh } from '@mui/icons-material';
import { IconDownload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import FilterField from './components/FilterField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import FilterSelect from './components/FilterSelect';

dayjs.extend(utc);

interface InvestigateFilterProps {
  filter: any;
  setFilter: React.Dispatch<React.SetStateAction<any>>;

  startDate: string;
  setStartDate: (value: string) => void;

  endDate: string;
  setEndDate: (value: string) => void;

  visitor: any[];
  visitorEmployee?: any[];

  selectedVisitorOption: any;
  visitorSearch: string;
  setVisitorSearch: (value: string) => void;

  isLoading: boolean;
  isLoadingEmployee?: boolean;
  hasSearched: boolean;

  handleFilterChange: (key: string, value: any) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handleExportFiltered: () => void;

  t: (key: string) => string;
}

const InvestigateFilter = ({
  filter,
  setFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  visitor,
  visitorEmployee,
  selectedVisitorOption,
  visitorSearch,
  setVisitorSearch,
  isLoading,
  isLoadingEmployee,
  hasSearched,
  handleFilterChange,
  handleSearch,
  handleReset,
  handleExportFiltered,
  t,
}: InvestigateFilterProps) => {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e7ebf0',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: '1.1fr 1.4fr 1.2fr 1fr',
          },
          gap: 1.5,
        }}
      >
        <FilterField
          label="Keyword"
          placeholder="Search Name"
          value={filter.keyword}
          onChange={(value) => handleFilterChange('keyword', value)}
        />

        <Box>
          <CustomFormLabel sx={{ mt: 0 }} required>
            Start Date
          </CustomFormLabel>

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
        </Box>

        <Box>
          <CustomFormLabel sx={{ mt: 0 }} required>
            End Date
          </CustomFormLabel>

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
        </Box>

        <FilterSelect
          label="Alarm"
          value={filter.isAlarm === '' ? 'All' : filter.isAlarm ? 'Yes' : 'No'}
          options={['All', 'Yes', 'No']}
          onChange={(value) =>
            handleFilterChange('isAlarm', value === 'Yes' ? true : value === 'No' ? false : '')
          }
        />

        <FilterSelect
          label="Source Type"
          value={filter.sourceType}
          options={['All Types', 'AccessControl', 'CameraCCTV', 'Event']}
          onChange={(value) =>
            setFilter((prev: any) => ({
              ...prev,
              sourceType: value,
            }))
          }
        />

        <FilterSelect
          label="Event Type"
          value={filter.eventType}
          options={[
            'All Event Types',
            'TapReader',
            'CameraCapture',
            'Alarm',
            'AlarmAck',
            'EvacuateTrigger',
            'Status',
          ]}
          onChange={(value) =>
            setFilter((prev: any) => ({
              ...prev,
              eventType: value,
            }))
          }
        />

        <Box>
          <Typography sx={{ mb: 0.5, fontSize: 14, fontWeight: 500 }}>Visitor</Typography>

          <Autocomplete
            fullWidth
            size="small"
            options={visitor}
            loading={isLoading}
            filterOptions={(options) => options}
            getOptionLabel={(option) => option.full_name || option.name || ''}
            value={selectedVisitorOption}
            inputValue={visitorSearch}
            onInputChange={(_, value, reason) => {
              if (reason === 'input' || reason === 'clear') {
                setVisitorSearch(value);
              }
            }}
            onChange={(_, value) => {
              setFilter((prev: any) => ({
                ...prev,
                visitor_id: value?.id ?? '',
              }));

              setVisitorSearch(value?.full_name || value?.name || '');
            }}
            isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
            noOptionsText={
              visitorSearch.length < 3 ? 'Type at least 3 characters' : 'No visitor found'
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search visitor..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* <Box>
          <Typography sx={{ mb: 0.5, fontSize: 14, fontWeight: 500 }}>Employee</Typography>

          <Autocomplete
            fullWidth
            loading={isLoadingEmployee}
            size="small"
            options={visitorEmployee}
            getOptionLabel={(option) => option.full_name || option.name || ''}
            value={visitorEmployee.find((item: any) => item.id === filter.hostId) ?? null}
            onChange={(_, value) => {
              setFilter((prev: any) => ({
                ...prev,
                hostId: value?.id ?? '',
              }));
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search employee..."
                size="small"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: 12,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: 12,
                    opacity: 0.6,
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box> */}
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1.5}>
        <Button
          variant="contained"
          startIcon={<IconDownload />}
          onClick={handleExportFiltered}
          disabled={!hasSearched}
          sx={{
            textTransform: 'none',
            borderColor: '#d8e0eb',
            backgroundColor: '#16a765',
          }}
        >
          Export Excel
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleReset}
          sx={{
            textTransform: 'none',
            borderColor: '#d8e0eb',
            color: '#536174',
          }}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          startIcon={<Search />}
          sx={{
            textTransform: 'none',
            boxShadow: 'none',
          }}
          onClick={handleSearch}
        >
          {t('search')}
        </Button>
      </Stack>
    </Box>
  );
};

export default InvestigateFilter;
