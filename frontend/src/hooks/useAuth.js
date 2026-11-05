'use client';

import { useSelector, useDispatch } from 'react-redux';
import {
  setCredentials,
  updateUserProfile,
  logout,
  setAuthError,
  setAuthLoading,
} from '../store/slices/authSlice';
import api from '../lib/api';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const loginUser = async (email, password) => {
    dispatch(setAuthLoading(true));
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('seemanchal_has_session', 'true');
          if (res.data.refreshToken) {
            localStorage.setItem('seemanchal_refresh_token', res.data.refreshToken);
          }
        }
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })
        );
        return res.data;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      dispatch(setAuthError(message));
      throw new Error(message);
    }
  };

  const registerMember = async (formData) => {
    dispatch(setAuthLoading(true));
    try {
      const res = await api.post('/auth/register-member', formData);
      if (res.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('seemanchal_has_session', 'true');
          if (res.data.refreshToken) {
            localStorage.setItem('seemanchal_refresh_token', res.data.refreshToken);
          }
        }
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })
        );
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      dispatch(setAuthError(message));
      throw new Error(message);
    }
  };

  const registerReporter = async (formData) => {
    dispatch(setAuthLoading(true));
    try {
      const res = await api.post('/auth/register-reporter', formData);
      if (res.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('seemanchal_has_session', 'true');
          if (res.data.refreshToken) {
            localStorage.setItem('seemanchal_refresh_token', res.data.refreshToken);
          }
        }
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })
        );
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      dispatch(setAuthError(message));
      throw new Error(message);
    }
  };

  const logoutUser = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('seemanchal_has_session');
        localStorage.removeItem('seemanchal_refresh_token');
      }
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('seemanchal_has_session');
        localStorage.removeItem('seemanchal_refresh_token');
      }
      dispatch(logout());
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        dispatch(updateUserProfile(res.data.user));
      }
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        dispatch(updateUserProfile(res.data.user));
        return res.data;
      }
      throw new Error(res.data.message || 'Profile update failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update failed';
      throw new Error(msg);
    }
  };

  return {
    ...auth,
    isAdmin: auth.role === 'admin',
    isReporter: auth.role === 'reporter',
    isMember: auth.role === 'member',
    login: loginUser,
    registerMember,
    registerReporter,
    logout: logoutUser,
    refreshUser,
    updateProfile,
  };
}

export default useAuth;

