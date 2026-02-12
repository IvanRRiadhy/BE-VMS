import { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { addDays } from 'date-fns';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Button } from '@mui/material';
import { Box } from '@mui/system';

interface CalendarProps {
  // onChange: (selection: any) => void;
  value?: {
    startDate: Date;
    endDate: Date;
  };
  onChange: (selection: { startDate: Date; endDate: Date }) => void;
}

const Calendar: FC<CalendarProps> = ({ onChange, value }) => {
  // 🗓 Default: hari ini - 7 hari ke depan
  // const defaultStart = value?.startDate ?? new Date();
  // const defaultEnd = value?.endDate ?? addDays(new Date(), 7);

  // const [state, setState] = useState([
  //   {
  //     startDate: defaultStart,
  //     endDate: defaultEnd,
  //     key: 'selection',
  //   },
  // ]);

    const [state, setState] = useState([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
      },
    ]);

  // useEffect(() => {
  //   if (value) {
  //     setState([
  //       {
  //         startDate: value.startDate,
  //         endDate: value.endDate,
  //         key: 'selection',
  //       },
  //     ]);
  //   }
  // }, [value]);

  const handleOnChange = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (!selection.startDate || !selection.endDate) return;

    // if (selection.startDate && selection.endDate) {
      setState([
        {
          startDate: selection.startDate,
          endDate: selection.endDate,
          key: 'selection',
        },
      ]);
      // onChange(selection);
    // }
  };

  return (
    <>
      <DateRangePicker months={2} direction="vertical" ranges={state} onChange={handleOnChange} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, px: 2 }}>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() =>
            onChange({
              startDate: state[0].startDate,
              endDate: state[0].endDate,
            })
          }
        >
          Apply
        </Button>
      </Box>
    </>
  );
};

Calendar.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object,
};

export default Calendar;
