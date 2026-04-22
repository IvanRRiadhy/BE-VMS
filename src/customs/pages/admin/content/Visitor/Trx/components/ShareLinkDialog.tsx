import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getShareLinkByDt } from 'src/customs/api/ShareLink';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';


type Props = {
  open: boolean;
  onClose: () => void;
  token: string;
  onCopyLink: (row: any) => void;
  onDetailLink: (row: any) => void;
  onDelete: (id: string) => void;
  onAddData: () => void;
};

const ShareLinkDialog: React.FC<Props> = ({
  open,
  onClose,
  token,
  onCopyLink,
  onDetailLink,
  onDelete,
  onAddData,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  const startPage = page * rowsPerPage;

  const { data, isLoading } = useQuery({
    queryKey: ['share-links', startPage, rowsPerPage, searchKeyword, sortDir],
    queryFn: async () => {
      const res = await getShareLinkByDt(token, startPage, rowsPerPage, searchKeyword, sortDir);
      return res;
    },
    enabled: !!token && open,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const shareLinkList =
    data?.collection?.map((item: any) => ({
      id: item.id,
      agenda: item.agenda,
      url: item.url,
      current_usage: item.current_usage,
      max_usage: item.max_usage,
      visitor_period_start: formatDateTime(item.visitor_period_start),
      visitor_period_end: formatDateTime(item.visitor_period_end),
      expired_at: (() => {
        const date = new Date(item.expired_at + 'Z');

        const formattedDate = date
          .toLocaleDateString('id-ID', {
            day: '2-digit',
            // month: '2-digit',
            month: 'long',
            year: 'numeric',
          })
          .replace(/\//g, '-');

        const formattedTime = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        return `${formattedDate}, ${formattedTime}`;
      })(),
      link_status: item.link_status,
    })) || [];

  const totalFilterRecords = data?.RecordsFiltered || 0;

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
          isHaveHeaderTitle
          isHaveChecked={true}
          isNoActionTableHead={true}
          titleHeader="Share Link"
          isCopyLink={true}
          isHavePagination={true}
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
