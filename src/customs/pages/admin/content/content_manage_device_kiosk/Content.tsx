import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormAddKiosk from './FormAddKiosk';
import FormAddTemplate from './FormAddTemplate';

const Content = () => {
  const tableRowKiosk = [
    {
      id: 1,
      Name: 'Kiosk A1',
      Status: 'Online',
      Platform: 'Android',
      Version: '11.0',
      Hardware: 'Samsung Galaxy Tab A8',
      Desc: 'Kiosk utama di lobi kantor',
    },
    {
      id: 2,
      Name: 'Kiosk B2',
      Status: 'Offline',
      Platform: 'Android',
      Version: '10.0',
      Hardware: 'Lenovo Tab M10',
      Desc: 'Tidak merespons sejak pagi',
    },
    {
      id: 3,
      Name: 'Kiosk C3',
      Status: 'Maintenance',
      Platform: 'Windows',
      Version: '10',
      Hardware: 'Intel NUC Mini PC',
      Desc: 'Sedang diperbaiki oleh teknisi',
    },
    {
      id: 4,
      Name: 'Kiosk D4',
      Status: 'Online',
      Platform: 'Android',
      Version: '12.0',
      Hardware: 'Xiaomi Pad 5',
      Desc: 'Digunakan untuk registrasi tamu',
    },
    {
      id: 5,
      Name: 'Kiosk E5',
      Status: 'Online',
      Platform: 'Linux',
      Version: 'Ubuntu 22.04',
      Hardware: 'Raspberry Pi 4',
      Desc: 'Kiosk demo untuk pengujian internal',
    },
    {
      id: 6,
      Name: 'Kiosk F6',
      Status: 'Offline',
      Platform: 'Windows',
      Version: '11',
      Hardware: 'Dell OptiPlex',
      Desc: 'Koneksi internet terputus',
    },
    {
      id: 7,
      Name: 'Kiosk G7',
      Status: 'Maintenance',
      Platform: 'Android',
      Version: '9.0',
      Hardware: 'Huawei MediaPad T5',
      Desc: 'Layar sentuh bermasalah',
    },
    {
      id: 8,
      Name: 'Kiosk H8',
      Status: 'Online',
      Platform: 'Android',
      Version: '13.0',
      Hardware: 'Samsung Galaxy Tab S8',
      Desc: 'Unit baru untuk ruang tamu eksekutif',
    },
  ];
  const tableRowTemplate = [
    {
      id: 1,
      Name: 'Welcome Template',
      Logo: 'logo_welcome.png',
      CreateAt: '2025-06-10T09:00:00Z',
      'Running Text': 'Selamat datang di kantor pusat kami',
    },
    {
      id: 2,
      Name: 'Safety Alert',
      Logo: 'logo_safety.png',
      CreateAt: '2025-06-11T10:15:00Z',
      'Running Text': 'Utamakan keselamatan kerja dan gunakan APD',
    },
    {
      id: 3,
      Name: 'Event Promo',
      Logo: 'logo_event.png',
      CreateAt: '2025-06-12T14:30:00Z',
      'Running Text': 'Kunjungi booth kami di Hall B, 12–14 Juni',
    },
    {
      id: 4,
      Name: 'Maintenance Notice',
      Logo: 'logo_maintenance.png',
      CreateAt: '2025-06-12T16:00:00Z',
      'Running Text': 'Sistem akan offline untuk pemeliharaan malam ini pukul 22.00',
    },
    {
      id: 5,
      Name: 'Ramadan Greeting',
      Logo: 'logo_ramadan.png',
      CreateAt: '2025-06-13T07:45:00Z',
      'Running Text': 'Marhaban ya Ramadan – Selamat menunaikan ibadah puasa',
    },
    {
      id: 6,
      Name: 'CSR Announcement',
      Logo: 'logo_csr.png',
      CreateAt: '2025-06-13T11:20:00Z',
      'Running Text': 'Donor darah akan diadakan pada 15 Juni di Aula Lt.1',
    },
    {
      id: 7,
      Name: 'Holiday Closure',
      Logo: 'logo_holiday.png',
      CreateAt: '2025-06-13T15:10:00Z',
      'Running Text': 'Kantor akan tutup tanggal 17–19 Juni untuk libur nasional',
    },
    {
      id: 8,
      Name: 'Recruitment Drive',
      Logo: 'logo_recruitment.png',
      CreateAt: '2025-06-14T09:30:00Z',
      'Running Text': 'Kami membuka lowongan untuk berbagai posisi – Apply sekarang!',
    },
  ];

  const cards = [
    { title: 'Total Kiosk', subTitle: '10', subTitleSetting: 10, color: 'none' },
    { title: 'Total Template', subTitle: '3', subTitleSetting: 3, color: 'none' },
  ];

  const [selectedType, setSelectedType] = useState('kiosk');
  const tableData: any[] = selectedType === 'kiosk' ? tableRowKiosk : tableRowTemplate;

  const [openFormType, setOpenFormType] = useState<'kiosk' | 'template' | null>(null);
  const handleCloseDialog = () => {
    setOpenFormType(null);
  };

  return (
    <>
      <PageContainer title="Device Kiosk" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                <DynamicTable
                  overflowX={'auto'}
                  data={tableData}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveSearch={true}
                  isHaveFilter={true}
                  isHaveExportPdf={true}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveAddData={true}
                  isHaveHeader={true}
                  headerContent={{
                    title: 'Kiosk & Template',
                    subTitle: 'Monitoring Kiosk & Template',
                    items: [{ name: 'kiosk' }, { name: 'template' }],
                  }}
                  defaultSelectedHeaderItem="kiosk"
                  onHeaderItemClick={(item) => {
                    console.log('Item diklik:', item.name);
                    setSelectedType(item.name);
                  }}
                  onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                  onEdit={(row) => console.log('Edit:', row)}
                  onDelete={(row) => console.log('Delete:', row)}
                  onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    if (selectedType === 'kiosk') {
                      setOpenFormType('kiosk');
                    } else if (selectedType === 'template') {
                      setOpenFormType('template');
                    }
                  }}
                />
              </Grid>{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      {/* Dialog Kios */}
      <Dialog open={openFormType === 'kiosk'} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          Add Kiosk data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormAddKiosk />
        </DialogContent>
      </Dialog>
      {/* Dialog Template */}
      <Dialog
        open={openFormType === 'template'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Template data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormAddTemplate />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Content;
