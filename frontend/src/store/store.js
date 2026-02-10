import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';
import contestsReducer from '../features/contests/contestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contests: contestsReducer,
  }
});

