import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';

import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface TransactionLogDialogProps {
  open: boolean;
  onClose: () => void;

  summary: any;
  reportData: any;

  activeTab: number;
  onTabChange: (value: number) => void;

  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;

  onSearchKeywordChange: (keyword: string) => void;
}

const TransactionLogDialog = ({
  open,
  onClose,
  summary,
  reportData,
  activeTab,
  onTabChange,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onPrint,
  onSearchKeywordChange,
}: TransactionLogDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: '90vw',
          maxWidth: 'none',
        },
      }}
    >
      <DialogTitle sx={{ position: 'relative', p: 3 }}>Transaction Log Report</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 15,
          right: 15,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, value) => onTabChange(value)}>
            <Tab label="Summary" />
            <Tab label="Table Report" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            {summary ? (
              <DynamicTable
                data={summary}
                isHaveHeaderTitle
                titleHeader="Summary"
                isHaveExportCsv
                onExportCsv={onExportCsv}
                isHaveExportExcel
                onExportExcel={onExportExcel}
                isHaveExportPdf
                onExportPdf={onExportPdf}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No summary data available.
              </Typography>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <div id="print-report-area">
              <DynamicTable
                data={reportData}
                isHaveSearch
                isHavePagination={false}
                isHavePeriod
                onSearchKeywordChange={onSearchKeywordChange}
                isHaveExportCsv
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
      </DialogContent>
    </Dialog>
  );
};

export default TransactionLogDialog;
