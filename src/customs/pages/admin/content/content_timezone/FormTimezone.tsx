import { Grid2 as Grid, Button, Box, Backdrop, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { TimeGridSelector } from 'src/customs/components/GridSelector/TimeGridSelector';
import { useSession } from 'src/customs/contexts/SessionContext';
import { createTimezone, updateTimezone } from 'src/customs/api/admin';
import { showSuccessAlert, showErrorAlert } from 'src/customs/components/alerts/alerts';

// tipe untuk props form
interface FormTimezoneProps {
  mode: 'create' | 'edit';
  initialData?: any; // data dari API untuk edit
  onSuccess?: () => void;
}

const FormTimezone = ({ mode, initialData, onSuccess }: FormTimezoneProps) => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);

  const dayMap: Record<string, string> = {
    Sun: 'sunday',
    Mon: 'monday',
    Tue: 'tuesday',
    Wed: 'wednesday',
    Thu: 'thursday',
    Fri: 'friday',
    Sat: 'saturday',
  };

  const STORAGE_KEY = 'timezoneFormDraft';

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [days, setDays] = useState<any[]>(initialData?.days ?? []);

  // callback dari TimeGridSelector
  const handleSelectionChange = (newDays: any[]) => {
    setDays(newDays);
  };

  // konversi DaySchedule[] ke payload API
  const buildPayload = () => {
    const payload: any = { name, description };

    days.forEach((day) => {
      const key = dayMap[day.day];
      if (!key) return;

      if (day.hours.length > 0) {
        // ambil blok terawal & terakhir (inklusif)
        const start = day.hours[0].startTime;
        const end = day.hours[day.hours.length - 1].endTime;

        payload[key] = `${start}:00`;
        payload[key + '_end'] = `${end}:00`;
      } else {
        payload[key] = null;
        payload[key + '_end'] = null;
      }
    });

    return payload;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      const payload = buildPayload();
      if (mode === 'create') {
        await createTimezone(token, payload);
        setTimeout(() => {
          showSuccessAlert('Created!', 'Timezone berhasil dibuat.');
          onSuccess?.();
        }, 600); // jeda 0.6 detik
      } else {
        await updateTimezone(token, initialData.id, payload);
        setTimeout(() => {
          showSuccessAlert('Updated!', 'Time Access berhasil diupdate.');
          onSuccess?.();
        }, 600);
      }
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Error', 'Gagal menyimpan timezone');
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    if (mode === 'create') {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setName(parsed.name ?? '');
          setDescription(parsed.description ?? '');
          if (parsed.days && Array.isArray(parsed.days)) {
            setDays(parsed.days);
          }
        } catch (err) {
          console.error('Failed to parse draft:', err);
        }
      }
    }
  }, [mode]);

  // ⬇️ Simpan draft ke localStorage setiap kali name/description/days berubah
  useEffect(() => {
    if (mode === 'create') {
      const draft = { name, description, days };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [name, description, days, mode]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name ?? '');
      setDescription(initialData.description ?? '');
      setDays(initialData.days ?? []);
    }
  }, [initialData, mode]);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} overflow={'hidden'}>
        <Grid size={{ xs: 12, lg: 2 }}>
          <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name">
            Name
          </CustomFormLabel>
          <CustomTextField
            type="text"
            id="name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <CustomFormLabel sx={{ marginY: 1 }} htmlFor="description">
            Description
          </CustomFormLabel>
          <CustomTextField
            type="text"
            id="description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 10 }}>
          <TimeGridSelector
            onSelectionChange={handleSelectionChange}
            initialData={days}
            onSubmit={handleSubmit}
          />
        </Grid>
      </Grid>

      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1, // di atas drawer & dialog
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </form>
  );
};

export default FormTimezone;
