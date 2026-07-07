import { configureStore } from '@reduxjs/toolkit';
import CustomizerReducer from './customizer/CustomizerSlice';
import dateRangeReducer from './apps/Daterange/dateRangeSlice';
import userReducer from './apps/user/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import notificationReducer from './apps/notifications/NotificationSlice';

import { combineReducers } from 'redux';
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
  TypedUseSelectorHook,
} from 'react-redux';

// export const store = configureStore({
//   reducer: {
//     customizer: CustomizerReducer,
//     ecommerceReducer: EcommerceReducer,
//     chatReducer: ChatsReducer,
//     emailReducer: EmailReducer,
//     notesReducer: NotesReducer,
//     contactsReducer: ContactsReducer,
//     ticketReducer: TicketReducer,
//     userpostsReducer: UserProfileReducer,
//     blogReducer: BlogReducer,
//     dateRange: dateRangeReducer,
//     userReducer: userReducer,
//   },
// });

const rootReducer = combineReducers({
  customizer: CustomizerReducer,
  notifications: notificationReducer,
  dateRange: dateRangeReducer,
  userReducer: userReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userReducer'], 
};

// === Bungkus rootReducer dengan persistReducer ===
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // penting untuk redux-pe
    }),
});
// export const persistor = persistStore(store);

export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const { dispatch } = store;
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<AppState> = useAppSelector;

export default store;
