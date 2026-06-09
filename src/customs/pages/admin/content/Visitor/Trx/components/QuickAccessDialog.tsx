import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Grid2 as Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useVisitorProvider } from 'src/hooks/useVisitorProvider';
import { useSession } from 'src/customs/contexts/SessionContext';
import useDropPoint from 'src/hooks/useDropPoint';
import { showSwal } from 'src/customs/components/alerts/alerts';
import useInvitationVisitorEmployee from 'src/hooks/useInvitationVisitorEmployee';
import FormQuickAccess from './Dialog/FormQuickAccess';
import { getVisitorById } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import TemporaryAccessDialog from './Dialog/TemporaryAccessDialog';

interface QuickAccessDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: any;
  visitorTableData?: any[];
  handleEmployeeClick?: any;
  page?: any;
  setPage?: any;
  setRowsPerPage?: any;
  searchKeyword?: string;
  onSearch?: (keyword: string) => void;
  totalCount?: number;
}

export interface QuickAccessFormData {
  visitorProviderId: string;
  recipientType: 'self' | 'others' | '';
  // receiver
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  // courier
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  vehiclePlateNumber: string;
  siteId: string;
  hostId: string;
  duration: number | null;
}

export const QuickAccessDialog = ({
  open,
  onClose,
  onSubmit,
  visitorTableData,
  handleEmployeeClick,
  page,
  setPage,
  setRowsPerPage,
  searchKeyword,
  onSearch,
  totalCount,
}: QuickAccessDialogProps) => {
  const handleChange = (field: keyof QuickAccessFormData, value: string | number | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddData = () => {
    setOpenQuickAccess(true);
  };

  const { token } = useSession();

  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [openQrQuickAccess, setOpenQrQuickAccess] = useState(false);
  const { visitorProviders } = useVisitorProvider(token);
  const { dropPoint } = useDropPoint(token);
  const { allVisitorEmployee } = useInvitationVisitorEmployee(token);

  const initialFormState: QuickAccessFormData = {
    visitorProviderId: '',
    recipientType: 'self', // "self" is a valid value for recipientType
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    vehiclePlateNumber: '',
    siteId: '',
    hostId: '',
    duration: null,
  };
  const [form, setForm] = useState<QuickAccessFormData>(initialFormState);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = async () => {
    try {
      const selectedProvider = visitorProviders?.find((item) => item.id === form.visitorProviderId);

      const needPlateNumber =
        selectedProvider?.support_vehicle && selectedProvider?.need_plate_number;

      if (needPlateNumber && !form.vehiclePlateNumber.trim()) {
        showSwal('error', 'Please enter vehicle plate number.');
        return;
      }
      const payload = {
        visitor_provider_id: form.visitorProviderId,
        tz: tz,
        is_receiver_self: form.recipientType === 'self',
        ...(form.recipientType === 'others' && {
          receiver_name: form.receiverName,
          receiver_phone: form.receiverPhone,
          receiver_email: form.receiverEmail,
        }),
        duration: Number(form.duration),
        host_id: form.hostId,
        site_id: form.siteId,
        ...(needPlateNumber && {
          vehicle_plate_number: form.vehiclePlateNumber,
        }),
        visitor_name: form.visitorName,
        visitor_email: form.visitorEmail,
        visitor_phone: form.visitorPhone,
      };
      // console.log('payload', payload);
      await onSubmit?.(payload);
      setOpenQuickAccess(false);
    } catch (error) {}
  };

  const selectedProvider = visitorProviders?.find((item) => item.id === form.visitorProviderId);
  const showVehiclePlate = selectedProvider?.support_vehicle && selectedProvider?.need_plate_number;

  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector('svg');

    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });

    const url = URL.createObjectURL(svgBlob);

    const img = new Image();

    img.onload = () => {
      const size = 512;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // background putih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // kasih padding
      const padding = 32;

      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      const png = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = png;
      link.download = 'quick-access-qr.png';
      link.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const [visitorDetail, setVisitorDetail] = useState<any>(null);

  const handleDetailQuickAccess = async (id: string) => {
    try {
      const res = await getVisitorById(token as string, id);
      setVisitorDetail(res?.collection ?? res ?? null);
      setOpenQrQuickAccess(true);
    } catch (error) {
      showSwal('error', 'Failed to load quick access data.');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={false}
        PaperProps={{ sx: { width: '100vw' } }}
      >
        <DialogTitle>
          Quick Access
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <DynamicTable
            data={visitorTableData || []}
            isHaveSearch={true}
            searchKeyword={searchKeyword}
            onSearch={onSearch}
            isHaveAddData
            isHavePeriod={true}
            isHaveEmployee={true}
            totalCount={totalCount}
            currentPage={page}
            isActionEmployee={true}
            isHavePagination={true}
            rowsPerPageOptions={[10, 50, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            isHaveChecked={true}
            onAddData={handleAddData}
            isHaveDataQuickAccess={true}
            onDetailQuickAccess={handleDetailQuickAccess}
            onEmployeeClick={(row: any) => {
              handleEmployeeClick(row.host as string);
            }}
          />
        </DialogContent>
      </Dialog>
      <FormQuickAccess
        open={openQuickAccess}
        onClose={() => {
          setOpenQuickAccess(false);
          setForm(initialFormState);
        }}
        form={form}
        handleChange={handleChange}
        visitorProviders={visitorProviders}
        allVisitorEmployee={allVisitorEmployee}
        dropPoint={dropPoint}
        showVehiclePlate={showVehiclePlate}
        handleSubmit={handleSubmit}
      />
      {/* Dialog submit get qr */}
      <TemporaryAccessDialog
        open={openQrQuickAccess}
        onClose={() => setOpenQrQuickAccess(false)}
        visitorDetail={visitorDetail}
        qrRef={qrRef as any}
        handleDownloadQr={handleDownloadQr}
        formatDateTime={formatDateTime}
      />
    </>
  );
};
