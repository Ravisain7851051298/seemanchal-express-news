'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export { useAuth };
