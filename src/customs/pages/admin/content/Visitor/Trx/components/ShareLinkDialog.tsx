import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getShareLinkByDt } from 'src/customs/api/ShareLink';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { showSwal } from 'src/customs/components/alerts/alerts';

type Props = {
  refreshKey: any;
  open: boolean;
  onClose: () => void;
  token: string;
  onCopyLink: (row: any) => void;
  onDetailLink: (row: any) => void;
  onDelete: (id: string) => void;
  onAddData: () => void;
};

const ShareLinkDialog: React.FC<Props> = ({
  refreshKey,
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

  const [shareLinkList, setShareLinkList] = useState([]);
  const [totalFilterRecords, setTotalFilterRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getShareLinkByDt(token, startPage, rowsPerPage, searchKeyword, sortDir);
      const mapped =
        res?.collection?.map((item: any) => ({
          id: item.id,
          agenda: item.agenda,
          url: item.url,
          current_usage: item.current_usage,
          shorten_url: item.shorten_url,
          max_usage: item.max_usage,
          visitor_period_start: formatDateTime(item.visitor_period_start),
          visitor_period_end: formatDateTime(item.visitor_period_end),
          expired_at: (() => {
            const date = new Date(item.expired_at + 'Z');

            const formattedDate = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            const formattedTime = date
              .toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
              .replace(':', '.');

            return `${formattedDate}, ${formattedTime}`;
          })(),

          link_status: item.link_status,
        })) || [];

      setShareLinkList(mapped);
      setTotalFilterRecords(res?.RecordsFiltered || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, startPage, rowsPerPage, searchKeyword, sortDir]);

  useEffect(() => {
    if (open && token) {
      fetchData();
    }
  }, [fetchData, open, token, refreshKey]);

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
          loading={loading}
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
