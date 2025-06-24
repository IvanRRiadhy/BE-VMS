import { FC, useState } from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { subDays, addDays } from 'date-fns';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface CalendarProps {
  onChange: (selection: any) => void;
}
const today = new Date();

const Calendar: FC<CalendarProps> = ({ onChange }) => {
  const [state, setState] = useState<
    Array<{
      startDate: Date;
      endDate: Date;
      key: string;
    }>
  >([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection', // key harus ada agar `ranges` dapat dimanipulasi
    },
  ]);

  const handleOnChange = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;

    if (selection.startDate && selection.endDate) {
      setState([
        {
          startDate: selection.startDate,
          endDate: selection.endDate,
          key: 'selection',
        },
      ]);
      onChange(selection);
    }
  };

  return (
    <DateRangePicker months={2} onChange={handleOnChange} ranges={state} direction="vertical" />
  );
};

Calendar.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default Calendar;
