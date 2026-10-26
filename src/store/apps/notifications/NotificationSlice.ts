import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationItem } from './NotificationType';

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const NotificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      const exists = state.items.some(
        (x) =>
          x.trx_visitor_id === action.payload.trx_visitor_id &&
          x.created_at === action.payload.created_at,
      );

      if (exists) return;

      state.items.unshift(action.payload);

      state.unreadCount = state.items.filter((x) => !x.is_read).length;
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((x) => x.id === action.payload);

      if (item) {
        item.is_read = true;
      }

      state.unreadCount = state.items.filter((x) => !x.is_read).length;
    },

    markAllAsRead: (state) => {
      state.items.forEach((x) => {
        x.is_read = true;
      });

      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } =
  NotificationSlice.actions;

export default NotificationSlice.reducer;
