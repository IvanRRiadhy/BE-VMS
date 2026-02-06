import moment from 'moment-timezone';

export const formatDateTime = (dateStr?: string, extendMinutes = 0) => {
  if (!dateStr) return '-';

  const base = moment.utc(dateStr);

  if (extendMinutes !== 0) {
    base.add(extendMinutes, 'minutes');
  }

  return base
    .local()
    .utcOffset(7 * 60)
    .format('DD-MM-Y, HH:mm');
};
