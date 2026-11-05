import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalMembers: 0,
    totalReporters: 0,
    activeReporters: 0,
    suspendedReporters: 0,
    pendingMembers: 0,
    pendingReporters: 0,
    totalPendingApplications: 0,
    activeMembers: 0,
    expiredMemberships: 0,
    suspendedMembers: 0,
    pendingComplaints: 0,
    complaintsUnderReview: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
    totalComplaints: 0,
    publishedLegalDocs: 0,
    draftLegalDocs: 0,
    totalLegalDocs: 0,
    totalNewsPublished: 0,
    pendingNewsReview: 0,
    totalViews: 0,
  },
  applications: [],
  users: [],
  positions: [],
  categories: [],
  newsList: [],
  inquiries: [],
  legalDocs: [],
  reportersList: [],
  membersList: [],
  complaintsList: [],
  activityLogs: [],
  activeAdminTab: 'overview',
  loading: false,
  actionLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.loading = false;
    },
    updateApplicationStatus: (state, action) => {
      const { id, updatedUser } = action.payload;
      state.applications = state.applications.filter((app) => (app._id || app.id) !== id);
      const existingUserIdx = state.users.findIndex((u) => (u._id || u.id) === id);
      if (existingUserIdx !== -1) {
        state.users[existingUserIdx] = updatedUser;
      } else {
        state.users.unshift(updatedUser);
      }
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
    },
    setPositions: (state, action) => {
      state.positions = action.payload;
      state.loading = false;
    },
    setAdminCategories: (state, action) => {
      state.categories = action.payload;
    },
    setAdminNewsList: (state, action) => {
      state.newsList = action.payload;
      state.loading = false;
    },
    updateNewsItem: (state, action) => {
      const idx = state.newsList.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1) {
        state.newsList[idx] = action.payload;
      }
    },
    removeNewsItem: (state, action) => {
      state.newsList = state.newsList.filter((n) => n._id !== action.payload);
    },
    updateUserItem: (state, action) => {
      const idx = state.users.findIndex((u) => u._id === action.payload._id);
      if (idx !== -1) {
        state.users[idx] = action.payload;
      }
    },
    removeInquiryItem: (state, action) => {
      state.inquiries = state.inquiries.filter((inq) => inq._id !== action.payload);
    },
    setInquiries: (state, action) => {
      state.inquiries = action.payload;
      state.loading = false;
    },
    setLegalDocs: (state, action) => {
      state.legalDocs = action.payload;
      state.loading = false;
    },
    setReportersList: (state, action) => {
      state.reportersList = action.payload;
      state.loading = false;
    },
    setMembersList: (state, action) => {
      state.membersList = action.payload;
      state.loading = false;
    },
    setComplaintsList: (state, action) => {
      state.complaintsList = action.payload;
      state.loading = false;
    },
    setActivityLogs: (state, action) => {
      state.activityLogs = action.payload;
      state.loading = false;
    },
    setActiveAdminTab: (state, action) => {
      state.activeAdminTab = action.payload;
    },
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActionLoading: (state, action) => {
      state.actionLoading = action.payload;
    },
    setAdminError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.actionLoading = false;
    },
  },
});

export const {
  setStats,
  setApplications,
  updateApplicationStatus,
  setUsers,
  updateUserItem,
  setPositions,
  setAdminCategories,
  setAdminNewsList,
  updateNewsItem,
  removeNewsItem,
  setInquiries,
  removeInquiryItem,
  setLegalDocs,
  setReportersList,
  setMembersList,
  setComplaintsList,
  setActivityLogs,
  setActiveAdminTab,
  setAdminLoading,
  setActionLoading,
  setAdminError,
} = adminSlice.actions;

export default adminSlice.reducer;

