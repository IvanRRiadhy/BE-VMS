// import { FC, useState } from 'react';
// import PropTypes from 'prop-types';
// import { DateRangePicker, RangeKeyDict } from 'react-date-range';
// import { subDays, addDays } from 'date-fns';

// import 'react-date-range/dist/styles.css';
// import 'react-date-range/dist/theme/default.css';

// interface CalendarProps {
//   onChange: (selection: any) => void;
// }
// const today = new Date();

// const Calendar: FC<CalendarProps> = ({ onChange }) => {
//   const [state, setState] = useState<
//     Array<{
//       startDate: Date;
//       endDate: Date;
//       key: string;
//     }>
//   >([
//     {
//       startDate: new Date(),
//       endDate: new Date(),
//       key: 'selection', // key harus ada agar `ranges` dapat dimanipulasi
//     },
//   ]);

//   const handleOnChange = (ranges: RangeKeyDict) => {
//     const selection = ranges.selection;

//     if (selection.startDate && selection.endDate) {
//       setState([
//         {
//           startDate: selection.startDate,
//           endDate: selection.endDate,
//           key: 'selection',
//         },
//       ]);
//       onChange(selection);
//     }
//   };

//   return (
//     <DateRangePicker months={2} onChange={handleOnChange} ranges={state} direction="vertical" />
//   );
// };

// Calendar.propTypes = {
//   onChange: PropTypes.func.isRequired,
// };

// export default Calendar;


import { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { addDays } from 'date-fns';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface CalendarProps {
  onChange: (selection: any) => void;
  value?: {
    startDate: Date;
    endDate: Date;
  };
}

const Calendar: FC<CalendarProps> = ({ onChange, value }) => {
  // 🗓 Default: hari ini - 7 hari ke depan
  const defaultStart = value?.startDate ?? new Date();
  const defaultEnd = value?.endDate ?? addDays(new Date(), 7);

  const [state, setState] = useState([
    {
      startDate: defaultStart,
      endDate: defaultEnd,
      key: 'selection',
    },
  ]);

  // ✅ Sync jika parent mengubah dateRange
  useEffect(() => {
    if (value) {
      setState([
        {
          startDate: value.startDate,
          endDate: value.endDate,
          key: 'selection',
        },
      ]);
    }
  }, [value]);

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
    <DateRangePicker months={2} direction="vertical" ranges={state} onChange={handleOnChange} />
  );
};

Calendar.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object,
};

export default Calendar;

