import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  breakingNews: [],
  featuredNews: [],
  latestNews: [],
  seemanchalNews: [],
  categories: [],
  currentArticle: null,
  relatedNews: [],
  searchResults: [],
  loading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setBreakingNews: (state, action) => {
      state.breakingNews = action.payload;
    },
    setFeaturedNews: (state, action) => {
      state.featuredNews = action.payload;
    },
    setLatestNews: (state, action) => {
      state.latestNews = action.payload;
    },
    setSeemanchalNews: (state, action) => {
      state.seemanchalNews = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setCurrentArticle: (state, action) => {
      state.currentArticle = action.payload.news;
      state.relatedNews = action.payload.relatedNews || [];
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setNewsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setNewsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setBreakingNews,
  setFeaturedNews,
  setLatestNews,
  setSeemanchalNews,
  setCategories,
  setCurrentArticle,
  setSearchResults,
  setNewsLoading,
  setNewsError,
} = newsSlice.actions;

export default newsSlice.reducer;

