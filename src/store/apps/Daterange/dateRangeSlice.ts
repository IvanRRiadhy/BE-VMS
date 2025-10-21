// src/store/dateRangeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { subDays } from 'date-fns';

export interface DateRangeState {
  startDate: Date;
  endDate: Date;
  isManual: boolean;
}

const initialState: DateRangeState = {
  startDate: subDays(new Date(), 7),
  endDate: new Date(),
  isManual: false,
};

const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: Date; endDate: Date; isManual?: boolean }>,
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.isManual = action.payload.isManual ?? true;
    },
    resetToDefault: (state) => {
      state.startDate = subDays(new Date(), 7);
      state.endDate = new Date();
      state.isManual = false;
    },
  },
});

export const { setDateRange, resetToDefault } = dateRangeSlice.actions;
export default dateRangeSlice.reducer;
