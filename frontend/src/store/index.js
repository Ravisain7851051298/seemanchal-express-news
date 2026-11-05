import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import newsReducer from './slices/newsSlice';
import teamReducer from './slices/teamSlice';
import adminReducer from './slices/adminSlice';
import reporterReducer from './slices/reporterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    team: teamReducer,
    admin: adminReducer,
    reporter: reporterReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

