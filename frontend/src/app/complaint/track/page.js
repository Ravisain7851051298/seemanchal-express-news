'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  Calendar,
  FileText,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005').replace(/\/api\/?$/, '');

function ComplaintTrackingContent() {
  const searchParams = useSearchParams();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    const emailParam = searchParams.get('email');
    if (refParam) setReferenceNumber(refParam);
    if (emailParam) setEmail(emailParam);

    if (refParam && emailParam) {
      handleLookup(refParam, emailParam);
    }
  }, [searchParams]);

  const handleLookup = async (refNo, mail) => {
    const r = (refNo || referenceNumber).trim();
    const m = (mail || email).trim();

    if (!r || !m) {
      setError('Please provide both Reference Number and Email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setComplaint(null);

      const res = await fetch(`${API_BASE}/api/complaints/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: r,
          email: m,
        }),
      });

      const data = await res.json();
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
      } else {
        setError(data.message || 'No matching grievance record found.');
      }
    } catch (err) {
      setError('Network error while checking status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved & Concluded
          </span>
        );
      case 'under_review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Under Editorial Review
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Closed / Rejected
          </span>
        );
      case 'closed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            Case Closed
          </span>
        );
      case 'submitted':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Registered / Queued
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/complaint"
            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            Submit a New Complaint &rarr;
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Status Check
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Track Grievance Redressal Status
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Enter your unique Grievance Reference Number and the registered email address to check live investigation updates and official decisions.
          </p>
        </div>

        {/* Lookup Box */}
        <form
          onSubmit={onSubmit}
          className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Grievance Reference Number
              </label>
              <input
                type="text"
                name="referenceNumber"
                id="referenceNumber"
                autoComplete="off"
                required
                placeholder="e.g., GRV-2026-XXXXX"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Registered Complainant Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Reference numbers are case-insensitive.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Checking...' : <><Search className="w-4 h-4" /> Verify & Track</>}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Complaint Status Results Card */}
        {complaint && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tracking Reference
                </span>
                <h3 className="text-xl sm:text-2xl font-mono font-black text-red-400">
                  {complaint.referenceNumber}
                </h3>
              </div>
              <div>{getStatusBadge(complaint.status)}</div>
            </div>

            {/* Step Progress Tracker */}
            <div className="py-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Step 1 */}
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs mx-auto flex items-center justify-center shadow">
                    1
                  </div>
                  <div className="text-xs font-bold text-white">Registered</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-xs mx-auto flex items-center justify-center shadow transition-colors ${
                      complaint.status === 'under_review' ||
                      complaint.status === 'resolved' ||
                      complaint.status === 'rejected' ||
                      complaint.status === 'closed'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      complaint.status === 'under_review' ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    Under Review
                  </div>
                  <div className="text-[11px] text-slate-400">Legal Cell</div>
                </div>

                {/* Step 3 */}
                <div className="space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-xs mx-auto flex items-center justify-center shadow transition-colors ${
                      complaint.status === 'resolved'
                        ? 'bg-emerald-600 text-white'
                        : complaint.status === 'rejected'
                        ? 'bg-red-600 text-white'
                        : complaint.status === 'closed'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    3
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      complaint.status === 'resolved'
                        ? 'text-emerald-400'
                        : complaint.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {complaint.status === 'rejected' ? 'Rejected' : 'Resolution'}
                  </div>
                  <div className="text-[11px] text-slate-400">Final Order</div>
                </div>
              </div>
            </div>

            {/* Complaint Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Category:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{complaint.category}</p>
              </div>
              <div>
                <span className="text-slate-400">Complainant:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{complaint.fullName}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Subject:</span>
                <p className="font-bold text-white mt-0.5">{complaint.subject}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Description:</span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {complaint.description}
                </p>
              </div>
              {complaint.relatedNewsUrl && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Related News URL:</span>
                  <p className="mt-0.5">
                    <a
                      href={complaint.relatedNewsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 underline inline-flex items-center gap-1"
                    >
                      {complaint.relatedNewsUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Official Resolution / Rejection Remarks Box */}
            {(complaint.resolutionRemarks || complaint.rejectionReason) && (
              <div
                className={`p-5 rounded-xl border space-y-2 ${
                  complaint.resolutionRemarks
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/30 border-red-800/60 text-red-300'
                }`}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {complaint.resolutionRemarks ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official Resolution Remarks
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" /> Administrative Decision & Reason
                    </>
                  )}
                </h4>
                <p className="text-xs leading-relaxed text-slate-200">
                  {complaint.resolutionRemarks || complaint.rejectionReason}
                </p>
              </div>
            )}

            {/* Public Action Timeline */}
            {complaint.history && complaint.history.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-400" /> Case Progression History
                </h4>
                <div className="space-y-2">
                  {complaint.history.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white capitalize">
                          {step.status.replace('_', ' ')}
                        </span>
                        {step.remarks && (
                          <p className="text-slate-400 text-[11px] mt-0.5">{step.remarks}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(step.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComplaintTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading tracking console...
        </div>
      }
    >
      <ComplaintTrackingContent />
    </Suspense>
  );
}

