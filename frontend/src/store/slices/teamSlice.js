import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hierarchy: {},
  allMembers: [],
  activeTab: 'All',
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamData: (state, action) => {
      state.hierarchy = action.payload.hierarchy || {};
      state.allMembers = action.payload.allMembers || [];
      state.loading = false;
      state.error = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setTeamLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTeamError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setTeamData, setActiveTab, setTeamLoading, setTeamError } = teamSlice.actions;

export default teamSlice.reducer;

