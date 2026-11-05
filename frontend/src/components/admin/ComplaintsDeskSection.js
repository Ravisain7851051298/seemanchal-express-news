'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  FileText,
  User,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  Send,
  X,
  History,
  Shield,
  UserCheck,
} from 'lucide-react';
import api from '../../lib/api';

const COMPLAINT_CATEGORIES = [
  'all',
  'Incorrect News',
  'Content Removal Request',
  'Copyright Complaint',
  'Privacy Complaint',
  'Reporter Misconduct',
  'Membership Issue',
  'Technical Issue',
  'General Complaint',
  'Other',
];

export default function ComplaintsDeskSection() {
  const [complaints, setComplaints] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    resolved: 0,
    rejected: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Action Modal
  const [statusActionType, setStatusActionType] = useState(null); // 'under_review', 'resolved', 'rejected', 'closed'
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // New Internal Note
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/complaints/admin/all?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (complaintId) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/complaints/admin/${complaintId}`);
      if (res.data.success && res.data.complaint) {
        setSelectedComplaint(res.data.complaint);
      }
    } catch (err) {
      alert('Failed to load complaint details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusActionType) return;

    try {
      setActionSubmitting(true);
      const body = { status: statusActionType };
      if (statusActionType === 'resolved') body.resolutionRemarks = actionRemarks;
      if (statusActionType === 'rejected') body.rejectionReason = actionRemarks;
      body.remarks = actionRemarks || `Marked as ${statusActionType.replace('_', ' ')}`;

      const res = await api.put(`/complaints/admin/${selectedComplaint._id}/status`, body);
      if (res.data.success) {
        setStatusActionType(null);
        setActionRemarks('');
        handleOpenDetail(selectedComplaint._id);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setNoteSubmitting(true);
      const res = await api.post(`/complaints/admin/${selectedComplaint._id}/note`, {
        note: newNote.trim(),
      });
      if (res.data.success) {
        setNewNote('');
        handleOpenDetail(selectedComplaint._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add internal note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 justify-center">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 justify-center">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 justify-center">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 justify-center">
            Closed
          </span>
        );
      case 'submitted':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800 flex items-center gap-1 justify-center">
            <Clock className="w-3 h-3" /> Submitted (New)
          </span>
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="px-6 py-3 rounded-t-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Grievances, Complaints & Editorial Corrections
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review public complaints, fact-checking disputes, copyright notifications, and reporter misconduct reports in adherence to IT Rules 2021.
          </p>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'all'
              ? 'bg-slate-800 border-red-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Cases
          </span>
          <div className="text-xl font-black text-white mt-0.5">{counts.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('submitted')}
          className={`px-3 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'submitted'
              ? 'bg-blue-950/40 border-blue-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            New Submissions
          </span>
          <div className="text-xl font-black text-blue-300 mt-0.5">{counts.submitted}</div>
        </div>

        <div
          onClick={() => setStatusFilter('under_review')}
          className={`px-3 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'under_review'
              ? 'bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Under Review
          </span>
          <div className="text-xl font-black text-amber-300 mt-0.5">{counts.under_review}</div>
        </div>

        <div
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'resolved'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Resolved
          </span>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{counts.resolved}</div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'rejected'
              ? 'bg-red-950/40 border-red-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            Rejected
          </span>
          <div className="text-xl font-black text-red-300 mt-0.5">{counts.rejected}</div>
        </div>

        <div
          onClick={() => setStatusFilter('closed')}
          className={`px-3 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'closed'
              ? 'bg-slate-800 border-slate-600 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Closed
          </span>
          <div className="text-xl font-black text-slate-400 mt-0.5">{counts.closed}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-1 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Complaint Categories' : cat}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, name, email, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          onClick={fetchComplaints}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
        >
          Refresh Cases
        </button>
      </div>

      {/* Complaints Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading grievance records...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No complaints found matching this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Reference No.</th>
                  <th className="py-3 px-4">Complainant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Filed On</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Reference */}
                    <td className="py-3 px-4 font-mono font-bold text-red-400">
                      {c.referenceNumber}
                    </td>

                    {/* Complainant */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{c.fullName}</span>
                      <span className="text-[11px] text-slate-500 block">{c.email}</span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {c.category}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">
                      {c.subject}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">{getStatusBadge(c.status)}</td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(c._id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-[11px] transition-all"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPLAINT DETAILS & ACTIONS MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-red-400 text-base">
                    {selectedComplaint.referenceNumber}
                  </span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <h3 className="text-base font-bold text-white truncate max-w-md">
                  {selectedComplaint.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Complainant Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Complainant:</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {selectedComplaint.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <span className="font-semibold text-slate-300 mt-0.5 block truncate">
                    {selectedComplaint.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone:</span>
                  <span className="font-semibold text-slate-300 mt-0.5 block">
                    {selectedComplaint.phone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Detailed Complaint Description:
                </span>
                <p className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed text-xs">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Related News & Attachment Links */}
              {(selectedComplaint.relatedNewsUrl || selectedComplaint.attachmentUrl) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedComplaint.relatedNewsUrl && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Related News URL:</span>
                      <a
                        href={selectedComplaint.relatedNewsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 underline mt-0.5 inline-flex items-center gap-1 font-semibold truncate max-w-full"
                      >
                        {selectedComplaint.relatedNewsUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {selectedComplaint.attachmentUrl && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Attachment Evidence:</span>
                      <a
                        href={selectedComplaint.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline mt-0.5 inline-flex items-center gap-1 font-semibold truncate max-w-full"
                      >
                        {selectedComplaint.attachmentUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Resolution / Rejection Display if exists */}
              {(selectedComplaint.resolutionRemarks || selectedComplaint.rejectionReason) && (
                <div
                  className={`p-4 rounded-xl border space-y-1.5 ${selectedComplaint.resolutionRemarks
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/30 border-red-800 text-red-300'
                    }`}
                >
                  <span className="font-bold uppercase text-[10px] tracking-wider block">
                    {selectedComplaint.resolutionRemarks
                      ? 'Official Resolution Remarks:'
                      : 'Rejection Reason:'}
                  </span>
                  <p className="text-slate-200">
                    {selectedComplaint.resolutionRemarks || selectedComplaint.rejectionReason}
                  </p>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 block">Editorial Desk Action:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setStatusActionType('under_review');
                      setActionRemarks('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800 font-bold transition-all"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => {
                      setStatusActionType('resolved');
                      setActionRemarks('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 font-bold transition-all"
                  >
                    Resolve Grievance
                  </button>
                  <button
                    onClick={() => {
                      setStatusActionType('rejected');
                      setActionRemarks('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 font-bold transition-all"
                  >
                    Reject Complaint
                  </button>
                  <button
                    onClick={() => {
                      setStatusActionType('closed');
                      setActionRemarks('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition-all"
                  >
                    Close Case
                  </button>
                </div>

                {/* Sub-form for Action Remarks */}
                {statusActionType && (
                  <form
                    onSubmit={handleStatusUpdate}
                    className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in"
                  >
                    <label className="font-bold text-white block">
                      Provide Remarks for "{statusActionType.replace('_', ' ').toUpperCase()}":
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter formal findings, editorial decision, or rejection explanation..."
                      value={actionRemarks}
                      onChange={(e) => setActionRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={actionSubmitting}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow disabled:opacity-50"
                      >
                        {actionSubmitting ? 'Updating...' : 'Save Decision'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusActionType(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Internal Admin Notes Thread */}
              <div className="space-y-3">
                <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider block">
                  Internal Administrative Notes (Strictly Confidential — Never Exposed Publicly):
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(!selectedComplaint.internalNotes ||
                    selectedComplaint.internalNotes.length === 0) ? (
                    <p className="text-[11px] text-slate-500 italic">
                      No internal notes recorded yet.
                    </p>
                  ) : (
                    selectedComplaint.internalNotes.map((n, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400">
                            {n.addedByName || 'Admin'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.addedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddInternalNote} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Add an internal note or fact-checking observation..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={noteSubmitting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Note
                  </button>
                </form>
              </div>

              {/* Case History Timeline */}
              {selectedComplaint.statusHistory &&
                selectedComplaint.statusHistory.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                      Audit Timeline:
                    </span>
                    <div className="space-y-1.5">
                      {selectedComplaint.statusHistory.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px]"
                        >
                          <span className="font-semibold text-slate-300 capitalize">
                            {h.newStatus.replace('_', ' ')}: {h.remarks}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(h.changedAt).toLocaleString()} ({h.changedByName})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

