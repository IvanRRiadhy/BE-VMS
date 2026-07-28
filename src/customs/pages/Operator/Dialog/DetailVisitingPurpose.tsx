import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const DetailVisitingPurpose = ({ open, onClose, totalCount, data, purposeName, page, setPage, rowsPerPage, setRowsPerPage, searchKeyword, setSearchKeyword }: any) => {

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
            isHaveSearch
            // selectedRows={selectedRows}
            isHavePagination={true}
            defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[8, 10, 50, 100]}
            totalCount={totalCount}
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
