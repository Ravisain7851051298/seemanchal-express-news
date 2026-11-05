import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null, // Short-lived token stored only in Redux memory
  isAuthenticated: false,
  role: null, // 'admin' | 'reporter' | 'member'
  status: null, // 'approved' | 'pending' | 'rejected'
  loading: true, // Initial app hydration
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = !!accessToken && !!user;
      state.role = user ? user.role : null;
      state.status = user ? user.status : null;
      state.loading = false;
      state.error = null;
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.role = null;
      state.status = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  updateAccessToken,
  updateUserProfile,
  setAuthLoading,
  setAuthError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

