import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useShareLinkPagination } from 'src/hooks/Visitor/useShareLinkPagination';

type Props = {
  open: boolean;
  onClose: () => void;
  onCopyLink: (row: any) => void;
  onDetailLink: (row: any) => void;
  onDelete: (id: string) => void;
  onAddData: () => void;
};

const ShareLinkDialog: React.FC<Props> = ({
  open,
  onClose,
  onCopyLink,
  onDetailLink,
  onDelete,
  onAddData,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  const {
    data,
    isLoading,
  } = useShareLinkPagination({
    page,
    rowsPerPage,
    search: searchKeyword,
    sortDir,
  });

  const shareLinkList = data?.collection ?? [];

  const totalFilterRecords =
    data?.RecordsFiltered ?? 0;

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearchKeyword(keyword);
    },
    [setPage, setSearchKeyword],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        List Share Link
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <DynamicTable
          data={shareLinkList}
          loading={isLoading}
          isHaveHeaderTitle={false}
          isHaveSearch={true}
          onSearch={handleSearch}
          isHaveChecked={true}
          isNoActionTableHead={true}
          currentPage={page}
          // titleHeader="Share Link"
          isCopyLink={true}
          isHavePagination={true}
          defaultRowsPerPage={rowsPerPage}
          totalCount={totalFilterRecords}
          rowsPerPageOptions={[10, 50, 100]}
          onPaginationChange={(newPage: any, newRowsPerPage: any) => {
            setPage(newPage);
            setRowsPerPage(newRowsPerPage);
          }}
          onCopyLink={onCopyLink}
          onDetailLink={onDetailLink}
          onDelete={(row: any) => onDelete(row.id)}
          isHaveAddData={true}
          onAddData={onAddData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShareLinkDialog;
