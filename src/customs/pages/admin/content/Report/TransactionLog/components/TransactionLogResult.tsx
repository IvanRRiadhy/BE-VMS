
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  InputAdornment,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  IconDeviceFloppy,
  IconPencil,
  IconReport,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';

import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface Props {
  reports: any[];
  loadingReports: boolean;
  loading: boolean;
  hasMore: boolean;

  searchKeyword: string;
  setSearchKeyword: (value: string) => void;

  selectedReport: any;
  editingId: string | null;

  activeTab: number;
  setActiveTab: (value: number) => void;

  isHavePreview: boolean;
  isFilterCollapsed: boolean;

  summary: any[];
  reportData: any[];

  getHostNames: (ids: string[]) => string;
  getSiteNames: (ids: string[]) => string;

  onView: (report: any) => void;
  onGenerate: (id: string) => void;
  onEdit: (report: any) => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;

  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
}

const TransactionLogResult = ({
  reports,
  loadingReports,
  loading,
  hasMore,
  searchKeyword,
  setSearchKeyword,
  selectedReport,
  editingId,
  activeTab,
  setActiveTab,
  isHavePreview,
  isFilterCollapsed,
  summary,
  reportData,
  getHostNames,
  getSiteNames,
  onView,
  onGenerate,
  onEdit,
  onUpdate,
  onDelete,
  onLoadMore,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onPrint,
}: Props) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        p: { xs: 1.5, sm: 2, md: 3 },
        minWidth: 0,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ backgroundColor: 'white', p: 1 }}>
        <Typography variant="h5" gutterBottom mb={2}>
          Report Result
        </Typography>

        <Divider sx={{ mb: 1 }} />

        <Grid container spacing={2}>
          {/* SAVED REPORT LIST */}
          <Grid size={{ xs: 12, xl: 2.5 }}>
            <TextField
              fullWidth
              size="medium"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search Report Name"
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {loadingReports ? (
              [...Array(7)].map((_, i) => (
                <Card key={i} sx={{ p: 2, mb: 2 }}>
                  <Skeleton width="60%" height={30} />
                  <Skeleton height={20} />
                  <Skeleton height={20} width="80%" />
                </Card>
              ))
            ) : reports.length === 0 ? (
              <Typography
                variant="h6"
                color="text.secondary"
                align="center"
                mt={5}
              >
                Report not found.
              </Typography>
            ) : (
              <>
                {reports.map((rep) => (
                  <Card
                    key={rep.id}
                    onClick={() => onView(rep)}
                    sx={{
                      p: 2,
                      minHeight: 100,
                      mb: 2,
                      cursor: 'pointer',
                      border:
                        selectedReport?.id === rep.id
                          ? '2px solid #1976d2'
                          : '1px solid #ddd',
                      backgroundColor:
                        selectedReport?.id === rep.id
                          ? 'rgba(25, 118, 210, 0.08)'
                          : 'inherit',
                      '&:hover': {
                        border: '2px solid #1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        transition: 'all 0.3s ease-in-out',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6">
                        {rep.name}
                      </Typography>

                      <Typography variant="body1">
                        {getHostNames(rep.hosts)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        {rep.time_report === 'CustomDate' &&
                        rep.start_date &&
                        rep.end_date
                          ? `${rep.start_date} - ${rep.end_date}`
                          : ''}
                      </Typography>

                      <Typography variant="body1">
                        {getSiteNames(rep.sites)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="Generate Report" arrow>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2, me: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerate(rep.id);
                          }}
                        >
                          <IconReport size={20} />
                        </Button>
                      </Tooltip>

                      {/* <Tooltip title="Edit Report" arrow>
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={{
                            mt: 2,
                            backgroundColor: '#FA896B',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(rep);
                          }}
                        >
                          <IconPencil size={20} />
                        </Button>
                      </Tooltip> */}

                      {editingId === rep.id && (
                        <Tooltip title="Update Report" arrow>
                          <Button
                            variant="contained"
                            color="warning"
                            startIcon={<IconDeviceFloppy size={20} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdate();
                            }}
                            disabled={loading}
                            sx={{ mt: 2, me: 1 }}
                          >
                            Update
                          </Button>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete Report" arrow>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(rep.id);
                          }}
                        >
                          <IconTrash size={20} />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Card>
                ))}

                {hasMore && (
                  <Box textAlign="center" mt={2}>
                    <Button
                      onClick={onLoadMore}
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loadingReports}
                    >
                      {loadingReports ? (
                        <CircularProgress size={20} />
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* DIVIDER */}
          <Grid
            sx={{
              display: { xs: 'none', md: 'block' },
              borderRight: '1px solid #e0e0e0',
              height: 'auto',
              mx: 0.5,
              flexGrow: 0.5,
            }}
            size={{ xs: 12, xl: 0.1 }}
          />

          {/* REPORT PREVIEW */}
          <Grid
            size={{
              xs: 12,
              xl: isFilterCollapsed ? 9.3 : 9.1,
            }}
            flexGrow={1}
          >
            {isHavePreview ? (
              <>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 2,
                  }}
                >
                  <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                  >
                    <Tab label="Summary" />
                    <Tab label="Table Report" />
                  </Tabs>
                </Box>

                {/* SUMMARY */}
                {activeTab === 0 && (
                  <DynamicTable
                    loading={loading}
                    data={summary}
                    isHaveHeaderTitle
                    titleHeader="Summary"
                    isHaveExportCsv={false}
                    onExportCsv={onExportCsv}
                    isHaveExportExcel
                    onExportExcel={onExportExcel}
                    isHaveExportPdf
                    onExportPdf={onExportPdf}
                  />
                )}

                {/* TABLE REPORT */}
                {activeTab === 1 && (
                  <Box>
                    <div id="print-report-area">
                      <DynamicTable
                        loading={loading}
                        data={reportData}
                        isHaveSearch={false}
                        isHavePagination={false}
                        isHaveHeaderTitle
                        titleHeader="Report"
                        isHavePeriod
                        rowsPerPageOptions={[10, 50, 100]}
                        isHaveExportCsv={false}
                        isHaveExportExcel
                        isHaveVip
                        isHaveExportPdf
                        onExportCsv={onExportCsv}
                        onExportExcel={onExportExcel}
                        onExportPdf={onExportPdf}
                        onPrint={onPrint}
                      />
                    </div>
                  </Box>
                )}
              </>
            ) : (
              <Card
                sx={{
                  p: 3,
                  minHeight: '90vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none !important',
                }}
              >
                <Typography variant="h5" color="text.secondary">
                  Select a report from the left to preview details.
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TransactionLogResult;
