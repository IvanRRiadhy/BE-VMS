import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface ParkingTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  templateName: string;
}

const dummyParkingResponse = {
  collection: [
    {
      group: 'AD',
      visitor_code: 'AD-123',
      truck: '-',
      //   car: '',
      truck_16: '-',
      truck_20: 1,
      truck_40: 1,
      site: 'SPU',
    },
    {
      group: 'AD',
      visitor_code: 'AD-124',
      truck: '-',
      //   car: '',
      truck_16: '-',
      truck_20: '-',
      truck_40: 1,
      site: 'SPU',
    },
    {
      group: 'AD',
      visitor_code: 'AD-125',
      truck: '-',
    //   car: 1,
      truck_16: 1,
      truck_20: '-',
      truck_40: 1,
      site: 'SPU',
    },
    {
      group: 'BC',
      visitor_code: 'BC-201',
      truck: 1,
      //   car: '',
      truck_16: '-',
      truck_20: 1,
      truck_40: 1,
      site: 'SPU',
    },
    {
      group: 'BC',
      visitor_code: 'BC-202',
      truck: '-',
      //   car: '',
      truck_16: 1,
      truck_20: '-',
      truck_40: '-',
      site: 'SPU',
    },
  ],
};

const ParkingTemplateDialog: React.FC<ParkingTemplateDialogProps> = ({
  open,
  onClose,
  templateName,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '100vw',
        },
      }}
    >
      <DialogTitle
        sx={{
          position: 'relative',
          fontWeight: 600,
          pr: 6,
        }}
      >
        {templateName || 'Parking Template'}

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ width: '100%' }}>
          <DynamicTable
            data={dummyParkingResponse.collection}
            overflowX="unset"
            loading={false}
            isHaveHeaderTitle={false}
            isHaveSearch={true}
            isHaveChecked={false}
            isNoActionTableHead={true}
            isHavePagination={true}
            defaultRowsPerPage={10}
            totalCount={dummyParkingResponse.collection.length}
            rowsPerPageOptions={[10, 50, 100]}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ParkingTemplateDialog;
