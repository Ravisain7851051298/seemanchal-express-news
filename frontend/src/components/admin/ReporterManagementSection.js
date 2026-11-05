'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  History,
  AlertTriangle,
  FileText,
  MapPin,
  Phone,
  Mail,
  X,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

export default function ReporterManagementSection() {
  const [reporters, setReporters] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, suspended: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Suspend Modal
  const [suspendingReporter, setSuspendingReporter] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendRemarks, setSuspendRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Status History Modal
  const [viewingHistoryReporter, setViewingHistoryReporter] = useState(null);

  // Profile Drawer Modal
  const [viewingProfileReporter, setViewingProfileReporter] = useState(null);

  useEffect(() => {
    fetchReporters();
  }, [statusFilter]);

  const fetchReporters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/admin/reporters?${params.toString()}`);
      if (res.data.success) {
        setReporters(res.data.reporters || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch reporters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSuspend = (reporter) => {
    setSuspendingReporter(reporter);
    setSuspendReason('');
    setSuspendRemarks('');
  };

  const handleConfirmSuspend = async (e) => {
    e.preventDefault();
    if (!suspendReason.trim()) {
      alert('Please provide a reason for suspension.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/admin/reporters/${suspendingReporter._id}/status`, {
        action: 'suspend',
        reason: suspendReason.trim(),
        remarks: suspendRemarks.trim(),
      });
      if (res.data.success) {
        setSuspendingReporter(null);
        fetchReporters();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend reporter');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreOrActivate = async (reporter, action = 'restore') => {
    const confirmMsg =
      action === 'restore'
        ? `Restore reporter privileges for ${reporter.name}?`
        : `Activate reporter privileges for ${reporter.name}?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await api.put(`/admin/reporters/${reporter._id}/status`, {
        action,
        remarks: `Restored by administrator on ${new Date().toLocaleDateString()}`,
      });
      if (res.data.success) {
        fetchReporters();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reporter status');
    }
  };

  const getReporterStatusBadge = (reporter) => {
    const isSuspended =
      reporter.reporterStatus === 'suspended' || reporter.status === 'suspended';
    if (isSuspended) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 justify-center">
          <ShieldAlert className="w-3 h-3" /> Suspended
        </span>
      );
    }

    const isActive =
      reporter.reporterStatus === 'active' ||
      (reporter.status === 'approved' && reporter.reporterStatus !== 'suspended');
    if (isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 justify-center">
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>
      );
    }

    if (reporter.status === 'pending') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 justify-center">
          <Clock className="w-3 h-3" /> Pending Review
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 justify-center">
        {reporter.status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {/* Header Card */}
      <div className="px-6 py-3 rounded-t-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Press Reporter Management System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage correspondent accreditations, audit reporting status, issue suspensions with recorded cause, and track full administrative history.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'all'
            ? 'bg-slate-800 border-amber-500 shadow-md'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Reporters
          </span>
          <div className="text-2xl font-black text-white mt-1">{counts.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'active'
            ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Active Reporters
          </span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{counts.active}</div>
        </div>

        <div
          onClick={() => setStatusFilter('suspended')}
          className={`px-4 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'suspended'
            ? 'bg-red-950/40 border-red-500 shadow-md'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
            Suspended
          </span>
          <div className="text-2xl font-black text-red-300 mt-1">{counts.suspended}</div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'pending'
            ? 'bg-amber-950/40 border-amber-500 shadow-md'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Pending Applications
          </span>
          <div className="text-2xl font-black text-amber-300 mt-1">{counts.pending}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-1 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, location, ID card..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReporters()}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={fetchReporters}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
        >
          Refresh List
        </button>
      </div>

      {/* Reporters Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading reporter records...
          </div>
        ) : reporters.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No reporters found matching this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Reporter Details</th>
                  <th className="py-3 px-4">Press ID Card</th>
                  <th className="py-3 px-4">Assigned Bureau</th>
                  <th className="py-3 px-4">Beats</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reporters.map((rep) => {
                  const isSuspended =
                    rep.reporterStatus === 'suspended' || rep.status === 'suspended';
                  return (
                    <tr key={rep._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getMediaUrl(rep.photo)}
                            alt={rep.name}
                            className="w-9 h-9 rounded-full object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{rep.name}</span>
                            <span className="text-[11px] text-slate-400 block">{rep.email}</span>
                            <span className="text-[10px] text-slate-500 block">{rep.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Press ID Card */}
                      <td className="py-3 px-4 font-mono">
                        {rep.idCardNumber ? (
                          <span className="text-amber-400 font-bold">{rep.idCardNumber}</span>
                        ) : (
                          <span className="text-slate-500">Not Generated</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <span className="text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          {rep.assignedLocation || 'Field Bureau'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {rep.assignedDesignation || 'Press Reporter'}
                        </span>
                      </td>

                      {/* Beats */}
                      <td className="py-3 px-4">
                        {rep.reportingBeats && rep.reportingBeats.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {rep.reportingBeats.slice(0, 2).map((beat, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {beat}
                              </span>
                            ))}
                            {rep.reportingBeats.length > 2 && (
                              <span className="text-[10px] text-slate-500">
                                +{rep.reportingBeats.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">General News</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">{getReporterStatusBadge(rep)}</td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingProfileReporter(rep)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Full Profile"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setViewingHistoryReporter(rep)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors"
                            title="View Status History Timeline"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {isSuspended ? (
                            <button
                              onClick={() => handleRestoreOrActivate(rep, 'restore')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                              title="Restore Reporter Privileges"
                            >
                              <RotateCcw className="w-3 h-3" /> Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSuspend(rep)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                              title="Suspend Reporter"
                            >
                              <ShieldAlert className="w-3 h-3" /> Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUSPEND REPORTER MODAL */}
      {suspendingReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-red-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-red-400 tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Bureau Administrative Action
                </span>
                <h3 className="text-lg font-bold text-white">
                  Suspend Reporter: {suspendingReporter.name}
                </h3>
              </div>
              <button
                onClick={() => setSuspendingReporter(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-200 leading-relaxed">
              <strong>Suspension Notice:</strong> When suspended, this reporter will be blocked from submitting new news stories or accessing reporter panel features. All previously submitted and published stories will remain intact.
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">
                  Suspension Reason <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Select Cause for Suspension --</option>
                  <option value="Violation of Reporter Code of Conduct">Violation of Reporter Code of Conduct</option>
                  <option value="Factual Fabrication / Unverified News Submission">Factual Fabrication / Unverified News Submission</option>
                  <option value="Misuse of Digital Press ID Card">Misuse of Digital Press ID Card</option>
                  <option value="Commercial Extortion / Paid News Allegation">Commercial Extortion / Paid News Allegation</option>
                  <option value="Pending Police FIR or Court Proceedings">Pending Police FIR or Court Proceedings</option>
                  <option value="Non-Compliance with Editorial Directives">Non-Compliance with Editorial Directives</option>
                  <option value="Other Administrative Ground">Other Administrative Ground</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">
                  Internal Administrative Remarks / Evidence Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Record specific case details, complaint reference number, or board decisions..."
                  value={suspendRemarks}
                  onChange={(e) => setSuspendRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSuspendingReporter(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS HISTORY TIMELINE MODAL */}
      {viewingHistoryReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                Status History: {viewingHistoryReporter.name}
              </h3>
              <button
                onClick={() => setViewingHistoryReporter(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(!viewingHistoryReporter.statusHistory ||
                viewingHistoryReporter.statusHistory.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Initial Onboarding &rarr;{' '}
                      <strong className="text-emerald-400 capitalize">
                        {viewingHistoryReporter.status || 'Active'}
                      </strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(viewingHistoryReporter.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <strong>Remarks:</strong> Accredited Journalist commissioned with ID: {viewingHistoryReporter.idCardNumber || 'Pending'} ({viewingHistoryReporter.assignedDesignation || 'Reporter'})
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Action performed by: Central Editorial Administration
                  </span>
                </div>
              ) : (
                viewingHistoryReporter.statusHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white capitalize">
                        {hist.oldStatus || 'Initial'} &rarr;{' '}
                        <strong
                          className={
                            hist.newStatus === 'suspended'
                              ? 'text-red-400'
                              : hist.newStatus === 'active'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                          }
                        >
                          {hist.newStatus}
                        </strong>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(hist.changedAt).toLocaleString()}
                      </span>
                    </div>

                    {hist.reason && (
                      <p className="text-red-300 text-[11px]">
                        <strong>Reason:</strong> {hist.reason}
                      </p>
                    )}
                    {hist.remarks && (
                      <p className="text-slate-300 text-[11px]">
                        <strong>Remarks:</strong> {hist.remarks}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 block">
                      Action performed by: {hist.changedByName || 'Administrator'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORTER PROFILE DETAILS MODAL */}
      {viewingProfileReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={getMediaUrl(viewingProfileReporter.photo)}
                  alt={viewingProfileReporter.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                />
                <div>
                  <h3 className="text-lg font-black text-white">
                    {viewingProfileReporter.name}
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold">
                    {viewingProfileReporter.assignedDesignation || 'Press Correspondent'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingProfileReporter(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Email:</span>
                <p className="font-semibold text-white mt-0.5">{viewingProfileReporter.email}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Phone:</span>
                <p className="font-semibold text-white mt-0.5">{viewingProfileReporter.phone}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">ID Card Number:</span>
                <p className="font-mono font-bold text-amber-400 mt-0.5">
                  {viewingProfileReporter.idCardNumber || 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Assigned Location:</span>
                <p className="font-semibold text-white mt-0.5">
                  {viewingProfileReporter.assignedLocation || 'Seemanchal Region'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
                <span className="text-slate-500">Reporting Beats:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {viewingProfileReporter.reportingBeats &&
                    viewingProfileReporter.reportingBeats.length > 0 ? (
                    viewingProfileReporter.reportingBeats.map((b, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-semibold"
                      >
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">All General Topics</span>
                  )}
                </div>
              </div>

              {viewingProfileReporter.suspensionReason && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 col-span-2 text-red-300">
                  <span className="font-bold uppercase text-[10px] tracking-wider block text-red-400">
                    Active Suspension Cause:
                  </span>
                  <p className="mt-1">{viewingProfileReporter.suspensionReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingProfileReporter(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

