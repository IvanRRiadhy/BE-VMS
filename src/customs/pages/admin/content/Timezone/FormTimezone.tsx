import { Grid2 as Grid, Backdrop, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { TimeGridSelector } from 'src/customs/components/GridSelector/TimeGridSelector';
import { useSession } from 'src/customs/contexts/SessionContext';
import { createTimezone, updateTimezone } from 'src/customs/api/admin';
import { showErrorAlert, showSwal } from 'src/customs/components/alerts/alerts';

interface FormTimezoneProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onSuccess?: () => void;
}

const dayMapReverse: Record<string, string> = {
  Sun: 'sunday',
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
  Sat: 'saturday',
};

const dayOrder: { abbr: string; key: string }[] = [
  { abbr: 'Sun', key: 'sunday' },
  { abbr: 'Mon', key: 'monday' },
  { abbr: 'Tue', key: 'tuesday' },
  { abbr: 'Wed', key: 'wednesday' },
  { abbr: 'Thu', key: 'thursday' },
  { abbr: 'Fri', key: 'friday' },
  { abbr: 'Sat', key: 'saturday' },
];

const STORAGE_KEY = 'timezoneFormDraft';

const FormTimezone = ({ mode, initialData, onSuccess }: FormTimezoneProps) => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [days, setDays] = useState<any[]>([]);

  const apiToDays = (api: any): any[] => {
    if (!api) return [];
    // if api already has days array, assume it's the correct format
    if (Array.isArray(api.days) && api.days.length) return api.days;

    const res: any[] = [];
    for (const d of dayOrder) {
      const startRaw = api?.[d.key];
      const endRaw = api?.[`${d.key}_end`];

      // normalize "HH:MM:SS" -> "HH:MM"
      const normalize = (s?: string) => {
        if (!s) return null;
        const parts = s.split(':');
        if (parts.length >= 2) return parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
        return s;
      };

      if (startRaw && endRaw) {
        res.push({
          day: d.abbr,
          hours: [
            {
              startTime: normalize(startRaw) as string,
              endTime: normalize(endRaw) as string,
            },
          ],
        });
      } else {
        res.push({
          day: d.abbr,
          hours: [],
        });
      }
    }
    return res;
  };

  const daysToApi = (daysArr: any[]) => {
    const payload: any = { name, description };

    const mapByAbbr: Record<string, any> = {};
    (daysArr || []).forEach((d) => {
      mapByAbbr[d.day] = d;
    });

    for (const d of dayOrder) {
      const dayObj = mapByAbbr[d.abbr];
      if (!dayObj || !Array.isArray(dayObj.hours) || dayObj.hours.length === 0) {
        continue;
      }

      const start = dayObj.hours[0].startTime;
      const end = dayObj.hours[dayObj.hours.length - 1].endTime;

      // ensure seconds :00 suffix (to match example payload)
      const ensureSeconds = (t: string) => {
        if (!t) return '';
        if (t.split(':').length === 2) return `${t}:00`;
        return t;
      };

      payload[d.key] = ensureSeconds(start);
      payload[`${d.key}_end`] = ensureSeconds(end);
    }

    return payload;
  };

  const handleSelectionChange = (newDays: any[]) => {
    setDays(newDays);
  };

  const handleSubmit = async (newDaysFromGrid?: any) => {
    if (!token) return;
    setLoading(true);
    try {
      const payload = daysToApi(newDaysFromGrid || days);
      console.log('Payload:', payload);
      if (mode === 'create') {
        await createTimezone(token, payload);
        setName('');
        setDescription('');
        setDays([]);
        localStorage.removeItem(STORAGE_KEY);

        setTimeout(() => {
          showSwal('success', 'Time Access successfully created');
          onSuccess?.();
        }, 250);
      } else {
        // edit
        const id = initialData?.id;
        if (!id) throw new Error('Missing timezone id for update');
        await updateTimezone(token, id, payload);

        setTimeout(() => {
          showSwal('success', 'Time Access successfully updated');
          onSuccess?.();
        }, 250);
      }
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Error', 'Gagal menyimpan timezone');
    } finally {
      setTimeout(() => setLoading(false), 250);
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
      setDays(apiToDays(initialData));
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
            // initialData={days}
            // initialData={apiToDays(initialData)}
            initialData={days}
            onSubmit={(newDays: any) => handleSubmit(newDays)}
          />
        </Grid>
      </Grid>

      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: 99999,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </form>
  );
};

export default FormTimezone;
