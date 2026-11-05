import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mySubmissions: [],
  loading: false,
  submitting: false,
  error: null,
};

const reporterSlice = createSlice({
  name: 'reporter',
  initialState,
  reducers: {
    setMySubmissions: (state, action) => {
      state.mySubmissions = action.payload;
      state.loading = false;
      state.error = null;
    },
    addSubmission: (state, action) => {
      state.mySubmissions.unshift(action.payload);
      state.submitting = false;
    },
    updateSubmission: (state, action) => {
      const index = state.mySubmissions.findIndex((s) => s._id === action.payload._id);
      if (index !== -1) {
        state.mySubmissions[index] = action.payload;
      }
    },
    removeSubmission: (state, action) => {
      state.mySubmissions = state.mySubmissions.filter((s) => s._id !== action.payload);
    },
    setReporterLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSubmitting: (state, action) => {
      state.submitting = action.payload;
    },
    setReporterError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.submitting = false;
    },
  },
});

export const {
  setMySubmissions,
  addSubmission,
  updateSubmission,
  removeSubmission,
  setReporterLoading,
  setSubmitting,
  setReporterError,
} = reporterSlice.actions;

export default reporterSlice.reducer;

