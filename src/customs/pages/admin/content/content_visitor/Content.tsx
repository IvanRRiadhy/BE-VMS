import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Grid2 as Grid,
  IconButton,
  Button,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import iconScanQR from '../../../../../assets/images/svgs/scan-qr.svg';
import iconAdd from '../../../../../assets/images/svgs/add-btn.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormWizardAddInvitation from './FormWizardAddInvitation';
import FormWizardAddVisitor from './FormWizardAddVisitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateVisitorRequestSchema, Item } from 'src/customs/api/models/Visitor';
import Swal from 'sweetalert2';
import { getAllVisitorPagination, deleteVisitor } from 'src/customs/api/admin';
import { CreateVisitorRequest } from 'src/customs/api/models/Visitor';

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  // const tableRowVisitors = [
  //   {
  //     id: 1,
  //     Name: 'Abd Goffar',
  //     Type: 'Guest',
  //     'Check-in Time': '2025-06-13T08:00:00Z',
  //     'Check-in By': 'Receptionist A',
  //     'Check-out Time': '2025-06-13T12:30:00Z',
  //     'Check-out By': 'Receptionist A',
  //     'Blocked Time': '2025-06-13T13:00:00Z',
  //     'Blocked By': 'Security A',
  //     'Blocked Reason': 'Late checkout',
  //     'Denied Time': '2025-06-13T07:45:00Z',
  //     'Denied By': 'Receptionist A',
  //     'Denied Reason': 'No valid appointment',
  //     'Visit Time': '4h 30m',
  //     Purpose: 'Meeting',
  //     'Purpose Person': 'Ilham Maulana',
  //   },
  //   {
  //     id: 2,
  //     Name: 'Nadia Putri',
  //     Type: 'Vendor',
  //     'Check-in Time': '2025-06-13T09:15:00Z',
  //     'Check-in By': 'Receptionist B',
  //     'Check-out Time': '2025-06-13T10:30:00Z',
  //     'Check-out By': 'Receptionist B',
  //     'Blocked Time': '2025-06-13T11:00:00Z',
  //     'Blocked By': 'Supervisor',
  //     'Blocked Reason': 'Unregistered item',
  //     'Denied Time': '2025-06-13T08:55:00Z',
  //     'Denied By': 'Security B',
  //     'Denied Reason': 'Delivery outside schedule',
  //     'Visit Time': '1h 15m',
  //     Purpose: 'Delivery',
  //     'Purpose Person': 'Warehouse Staff',
  //   },
  //   {
  //     id: 3,
  //     Name: 'Danang Pratama',
  //     Type: 'Consultant',
  //     'Check-in Time': '2025-06-13T10:00:00Z',
  //     'Check-in By': 'Receptionist A',
  //     'Check-out Time': '2025-06-13T15:00:00Z',
  //     'Check-out By': 'Receptionist C',
  //     'Blocked Time': '2025-06-13T15:10:00Z',
  //     'Blocked By': 'Security C',
  //     'Blocked Reason': 'Overtime unauthorized',
  //     'Denied Time': '2025-06-13T09:50:00Z',
  //     'Denied By': 'Receptionist B',
  //     'Denied Reason': 'Wrong department',
  //     'Visit Time': '5h 0m',
  //     Purpose: 'Training',
  //     'Purpose Person': 'HR Department',
  //   },
  //   {
  //     id: 4,
  //     Name: 'Siti Aisyah',
  //     Type: 'Intern Candidate',
  //     'Check-in Time': '2025-06-13T11:30:00Z',
  //     'Check-in By': 'Receptionist C',
  //     'Check-out Time': '2025-06-13T12:00:00Z',
  //     'Check-out By': 'Receptionist C',
  //     'Blocked Time': '2025-06-13T12:10:00Z',
  //     'Blocked By': 'Security D',
  //     'Blocked Reason': 'Suspicious behavior',
  //     'Denied Time': '2025-06-13T11:20:00Z',
  //     'Denied By': 'Receptionist C',
  //     'Denied Reason': 'No ID provided',
  //     'Visit Time': '0h 30m',
  //     Purpose: 'Interview',
  //     'Purpose Person': 'Recruitment Team',
  //   },
  //   {
  //     id: 5,
  //     Name: 'Ilham Maulana',
  //     Type: 'Partner',
  //     'Check-in Time': '2025-06-13T11:00:00Z',
  //     'Check-in By': 'Receptionist C',
  //     'Check-out Time': '2025-06-13T13:15:00Z',
  //     'Check-out By': 'Receptionist A',
  //     'Blocked Time': '2025-06-13T13:30:00Z',
  //     'Blocked By': 'Admin',
  //     'Blocked Reason': 'Access violation',
  //     'Denied Time': '2025-06-13T10:45:00Z',
  //     'Denied By': 'Receptionist B',
  //     'Denied Reason': 'Late arrival',
  //     'Visit Time': '2h 15m',
  //     Purpose: 'Business Agreement',
  //     'Purpose Person': 'CEO',
  //   },
  //   {
  //     id: 6,
  //     Name: 'Yusuf Ramadhan',
  //     Type: 'Guest',
  //     'Check-in Time': '2025-06-13T13:20:00Z',
  //     'Check-in By': 'Receptionist A',
  //     'Check-out Time': '2025-06-13T15:50:00Z',
  //     'Check-out By': 'Receptionist A',
  //     'Blocked Time': '2025-06-13T16:00:00Z',
  //     'Blocked By': 'Security B',
  //     'Blocked Reason': 'Unregistered area access',
  //     'Denied Time': '2025-06-13T13:00:00Z',
  //     'Denied By': 'Security B',
  //     'Denied Reason': 'No badge',
  //     'Visit Time': '2h 30m',
  //     Purpose: 'Discussion',
  //     'Purpose Person': 'Abd Goffar',
  //   },
  //   {
  //     id: 7,
  //     Name: 'Rina Amelia',
  //     Type: 'Contractor',
  //     'Check-in Time': '2025-06-13T14:00:00Z',
  //     'Check-in By': 'Receptionist A',
  //     'Check-out Time': '2025-06-13T17:00:00Z',
  //     'Check-out By': 'Receptionist C',
  //     'Blocked Time': '2025-06-13T17:15:00Z',
  //     'Blocked By': 'Security C',
  //     'Blocked Reason': 'Overstayed',
  //     'Denied Time': '2025-06-13T13:55:00Z',
  //     'Denied By': 'Receptionist B',
  //     'Denied Reason': 'Improper documents',
  //     'Visit Time': '3h 0m',
  //     Purpose: 'Project Briefing',
  //     'Purpose Person': 'Project Manager',
  //   },
  //   {
  //     id: 8,
  //     Name: 'Fauzan Arif',
  //     Type: 'Freelancer',
  //     'Check-in Time': '2025-06-13T13:30:00Z',
  //     'Check-in By': 'Receptionist B',
  //     'Check-out Time': '2025-06-13T17:00:00Z',
  //     'Check-out By': 'Receptionist B',
  //     'Blocked Time': '2025-06-13T17:05:00Z',
  //     'Blocked By': 'Supervisor',
  //     'Blocked Reason': 'Camera equipment not declared',
  //     'Denied Time': '2025-06-13T13:10:00Z',
  //     'Denied By': 'Receptionist A',
  //     'Denied Reason': 'Unclear purpose',
  //     'Visit Time': '3h 30m',
  //     Purpose: 'Content Shooting',
  //     'Purpose Person': 'Marketing Team',
  //   },
  // ];

  const [tableRowVisitors, setTableRowVisitors] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<[]>([]);
  const [formDataAddVisitorType, setFormDataAddVisitorType] = useState<CreateVisitorRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorData');
    return saved ? JSON.parse(saved) : CreateVisitorRequestSchema.parse({});
  });

  const cards = [
    { title: 'Total Visitor', subTitle: '10', subTitleSetting: 10, color: 'none' },
    { title: 'Scan QR Visitor', subTitle: iconScanQR, subTitleSetting: 'image', color: 'none' },
    { title: 'Add New Visitor', subTitle: iconAdd, subTitleSetting: 'image', color: 'none' },
    { title: 'Add Pre Registration', subTitle: iconAdd, subTitleSetting: 'image', color: 'none' },
  ];

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogClose = () => {
    setOpenDialogIndex(null);
  };

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      const start = page * rowsPerPage;
      const response = await getAllVisitorPagination(
        token,
        start,
        rowsPerPage,
        sortColumn,
        searchKeyword,
      );
      setTableRowVisitors(response.collection);
      setTotalRecords(response.collection.length);
      setTotalFilteredRecords(response.RecordsFiltered);
      setIsDataReady(true);
      try {
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedVisitorData');
    // if (editing) {
    //   const parsed = JSON.parse(editing);
    //   if (parsed.id === id) {
    //     handleOpenDialog();
    //   } else {
    //     console.log('ID tidak cocok');
    //     setPendingEditId(id);
    //     setConfirmDialogOpen(true);
    //   }
    // } else {
    //   setFormDataAddVisitorType(
    //     CreateVisitorRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
    //   );
    //   handleOpenDialog();
    // }
  };

  const handleEditConfirm = () => {};

  const handleDelete = async (id: string) => {
    if (token !== null) {
      try {
        await deleteVisitor(token, id);
        setRefreshTrigger(refreshTrigger + 1);
      } catch (error) {
        console.error('Error deleting visitor:', error);
      }
    } else {
      console.error('Token is null');
    }
  };

  return (
    <>
      <PageContainer title="Visitor" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                cardMarginBottom={1}
                items={cards}
                onImageClick={(item, index) => {
                  setOpenDialogIndex(index);
                  console.log('Image clicked:', index);
                }}
              />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                minWidth={2400}
                stickyHeader={true}
                data={tableRowVisitors}
                selectedRows={selectedRows}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveImage={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={true}
                isHaveAddData={false}
                isHaveHeader={true}
                headerContent={{
                  title: "Visitor's",
                  subTitle: 'Monitoring Data Visitor',
                  items: [
                    { name: 'all' },
                    { name: 'pre registration' },
                    { name: 'district' },
                    { name: 'checkin' },
                    { name: 'checkout' },
                    { name: 'denied' },
                    { name: 'blocked' },
                  ],
                }}
                defaultSelectedHeaderItem="all"
                onHeaderItemClick={(item) => {
                  console.log('Item diklik:', item.name);
                }}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDelete={(row) => handleDelete(row.id)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog fullWidth maxWidth="md" open={openDialogIndex === 3} onClose={handleDialogClose}>
        <DialogTitle>
          Add New Invitation
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleDialogClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormWizardAddInvitation />
        </DialogContent>
      </Dialog>

      <Dialog fullWidth maxWidth="md" open={openDialogIndex === 2} onClose={handleDialogClose}>
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add New Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleDialogClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormWizardAddVisitor />
        </DialogContent>
      </Dialog>
      <Dialog fullWidth maxWidth="xs" open={openDialogIndex === 1} onClose={handleDialogClose}>
        <DialogTitle display="flex">
          Scan QR Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleDialogClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TextField fullWidth label="Masukkan Kode QR" variant="outlined" size="small" />
          {/* button submit */}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
