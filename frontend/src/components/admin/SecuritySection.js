'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function SecuritySection() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data?.success) {
        setMessage({ text: 'Master password successfully updated!', type: 'success' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ text: res.data?.message || 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Error occurred while updating password.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Update Admin Master Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure institutional administrative access by modifying your master credentials.
            </p>
          </div>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-xs font-bold mb-4 flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Current Master Password *</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPasswords ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">New Master Password *</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPasswords ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Confirm New Password *</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                }
                className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPasswords ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow transition-colors"
            >
              {loading ? 'Updating Master Password...' : 'Save New Master Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
