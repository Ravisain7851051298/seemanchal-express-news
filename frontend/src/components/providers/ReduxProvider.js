'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../../store';
import { setCredentials, setAuthLoading } from '../../store/slices/authSlice';
import api from '../../lib/api';

function AuthHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    const hydrateAuth = async () => {
      // Avoid making an unneeded network call or prompting cross-origin storage permissions
      // on device startup for normal readers/visitors who have never logged in
      const hasStoredSession =
        typeof window !== 'undefined' &&
        (localStorage.getItem('seemanchal_has_session') === 'true' ||
          Boolean(localStorage.getItem('seemanchal_refresh_token')));

      if (!hasStoredSession) {
        if (isMounted) dispatch(setAuthLoading(false));
        return;
      }

      // 5-second safety fallback timeout to ensure auth loading never hangs indefinitely
      const fallbackTimeout = setTimeout(() => {
        if (isMounted) {
          dispatch(setAuthLoading(false));
        }
      }, 5000);

      try {
        const storedRefreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('seemanchal_refresh_token')
            : null;

        // Attempt silent refresh with cookie + body fallback for cross-domain stability with a strict timeout
        const res = await api.post(
          '/auth/refresh-token',
          { refreshToken: storedRefreshToken },
          { timeout: 4500 }
        );

        clearTimeout(fallbackTimeout);

        if (res.data.success && res.data.accessToken) {
          if (res.data.refreshToken && typeof window !== 'undefined') {
            localStorage.setItem('seemanchal_refresh_token', res.data.refreshToken);
          }
          if (isMounted) {
            dispatch(
              setCredentials({
                accessToken: res.data.accessToken,
                user: res.data.user,
              })
            );
          }
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('seemanchal_has_session');
            localStorage.removeItem('seemanchal_refresh_token');
          }
          if (isMounted) dispatch(setAuthLoading(false));
        }
      } catch (err) {
        clearTimeout(fallbackTimeout);
        // No active refresh session or expired
        if (typeof window !== 'undefined') {
          localStorage.removeItem('seemanchal_has_session');
          localStorage.removeItem('seemanchal_refresh_token');
        }
        if (isMounted) dispatch(setAuthLoading(false));
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}

