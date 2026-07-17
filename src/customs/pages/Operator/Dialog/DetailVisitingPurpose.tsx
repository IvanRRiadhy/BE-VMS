import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const DetailVisitingPurpose = ({ open, onClose, data, purposeName, page, setPage, rowsPerPage, setRowsPerPage, searchKeyword, setSearchKeyword }: any) => {
  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={false}
        PaperProps={{
          sx: {
            width: '100vw',
          },
        }}>
        <DialogTitle>{purposeName?.name}</DialogTitle>

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
        <DialogContent dividers>
          <DynamicTable data={data}
            isHaveChecked={false}
            isNoActionTableHead
            isHaveSearch isHavePagination={false}
            // selectedRows={selectedRows}
            defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 50, 100]}
            currentPage={page}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            searchKeyword={searchKeyword}
            onSearch={setSearchKeyword}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailVisitingPurpose;
