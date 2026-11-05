'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import api from '../../../lib/api';
import getMediaUrl from '../../../lib/imageHelper';

export default function VerificationResultPage() {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await api.get(`/documents/verify/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Record not found or credentials invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (id) checkVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500">Authenticating credentials...</p>
      </div>
    );
  }

  const isVerified = data?.verified && !data?.isExpired;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          {/* Header Status Bar */}
          <div
            className={`p-6 text-white text-center ${
              isVerified ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-red-600'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              {isVerified ? (
                <ShieldCheck className="w-10 h-10 text-white" />
              ) : (
                <ShieldAlert className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              {isVerified ? 'Officially Authenticated' : 'Verification Unsuccessful'}
            </h1>
            <p className="text-xs text-white/90 mt-1">
              {isVerified
                ? 'Official Verified Credentials - Seemanchal Express'
                : 'Invalid or Expired Credentials'}
            </p>
          </div>

          {/* Member Card Details */}
          {isVerified && data.member ? (
            <div className="p-6 sm:p-8">
              {/* Photo & Name */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200 text-center sm:text-left">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0">
                  <img
                    src={getMediaUrl(data.member.photo)}
                    alt={data.member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                    {data.member.role === 'reporter' ? 'Accredited Press Correspondent' : 'Executive Council Member'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {data.member.name}
                  </h2>
                  <p className="text-xs font-bold text-red-600 mt-0.5">
                    {data.member.assignedDesignation}
                  </p>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 text-xs border-b border-slate-200">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 font-medium">Card Identifier:</span>
                  <strong className="text-sm font-black text-slate-900 font-mono">
                    {data.member.idCardNumber}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 font-medium">Committee Tier:</span>
                  <strong className="text-slate-900 font-bold">
                    {data.member.committeeLevel} Committee
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 font-medium">Jurisdiction / Area:</span>
                  <strong className="text-slate-900 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {data.member.assignedLocation}
                  </strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 font-medium">Validity:</span>
                  <strong className="text-emerald-700 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {data.member.validUntil
                      ? new Date(data.member.validUntil).toLocaleDateString('en-US')
                      : 'Active'}
                  </strong>
                </div>
              </div>

              {/* Organization Seal Note */}
              <div className="pt-6 text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-800">Seemanchal Express</p>
                <p>Central Secretariat: F 65, Shaheen Bagh, Okhla, New Delhi-110025</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                  ✓ Officially Authenticated Central Record
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-600 mb-6">
                {error || 'No active or authorized member record matches this identifier.'}
              </p>
              <Link
                href="/verify"
                className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Try Another ID
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
