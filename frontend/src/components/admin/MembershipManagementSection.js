'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  History,
  Calendar,
  X,
  Award,
  UserX,
  ChevronDown,
  Check,
} from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

const COMMITTEE_LEVELS = [
  'all',
  'National',
  'State',
  'District',
  'Block',
  'Panchayat',
  'Ward',
  'General',
];

export default function MembershipManagementSection() {
  const [members, setMembers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, expired: 0, suspended: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Renew Modal
  const [renewingMember, setRenewingMember] = useState(null);
  const [renewStartDate, setRenewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewYears, setRenewYears] = useState(2);
  const [renewRemarks, setRenewRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Suspend Modal
  const [suspendingMember, setSuspendingMember] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendRemarks, setSuspendRemarks] = useState('');

  // History Modal
  const [viewingHistoryMember, setViewingHistoryMember] = useState(null);

  // Unified Action Menu & Designation Control States
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [changingDesignationMember, setChangingDesignationMember] = useState(null);
  const [designationForm, setDesignationForm] = useState({
    assignedDesignation: '',
    committeeLevel: 'District',
    assignedLocation: '',
  });
  const [positionsList, setPositionsList] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, levelFilter]);

  useEffect(() => {
    api.get('/positions')
      .then((res) => {
        if (res.data.success) {
          setPositionsList(res.data.positions || []);
        }
      })
      .catch(() => { });
  }, []);

  const handleOpenChangeDesignation = (member) => {
    setChangingDesignationMember(member);
    setDesignationForm({
      assignedDesignation: member.assignedDesignation || '',
      committeeLevel: member.committeeLevel || 'District',
      assignedLocation: member.assignedLocation || '',
    });
  };

  const handleConfirmChangeDesignation = async (e) => {
    e.preventDefault();
    if (!designationForm.assignedDesignation.trim()) {
      alert('Please enter or select a designation title.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/users/${changingDesignationMember._id}`, {
        assignedDesignation: designationForm.assignedDesignation.trim(),
        committeeLevel: designationForm.committeeLevel,
        assignedLocation: designationForm.assignedLocation.trim(),
      });
      if (res.data.success) {
        setChangingDesignationMember(null);
        fetchMembers();
        alert('Designation successfully updated.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update designation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveDesignation = async (member) => {
    if (!confirm(`Are you sure you want to remove the designation "${member.assignedDesignation || 'Assigned Title'}" from ${member.name}?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/users/${member._id}`, {
        assignedDesignation: '',
      });
      if (res.data.success) {
        fetchMembers();
        alert(`Designation removed successfully for ${member.name}.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove designation');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/admin/members?${params.toString()}`);
      if (res.data.success) {
        setMembers(res.data.members || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRenew = (member) => {
    setRenewingMember(member);
    setRenewStartDate(new Date().toISOString().split('T')[0]);
    setRenewYears(2);
    setRenewRemarks('');
  };

  const handleConfirmRenew = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/members/${renewingMember._id}/status`, {
        action: 'renew',
        startDate: renewStartDate,
        yearsToExtend: Number(renewYears),
        remarks: renewRemarks.trim() || `Renewed for ${renewYears} years.`,
      });
      if (res.data.success) {
        setRenewingMember(null);
        fetchMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew membership');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenSuspend = (member) => {
    setSuspendingMember(member);
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
      const res = await api.put(`/admin/members/${suspendingMember._id}/status`, {
        action: 'suspend',
        reason: suspendReason.trim(),
        remarks: suspendRemarks.trim(),
      });
      if (res.data.success) {
        setSuspendingMember(null);
        fetchMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend membership');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (member, action) => {
    if (!confirm(`Are you sure you want to mark member ${member.name} as ${action}?`)) return;
    try {
      const res = await api.put(`/admin/members/${member._id}/status`, {
        action,
        remarks: `Updated to ${action} by administrator`,
      });
      if (res.data.success) {
        fetchMembers();
      }
    } catch (err) {
      alert('Failed to update member status');
    }
  };

  const getMembershipBadge = (member) => {
    const isSuspended =
      member.membershipStatus === 'suspended' || member.status === 'suspended';
    if (isSuspended) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 justify-center">
          Suspended
        </span>
      );
    }

    const isExpired =
      member.membershipStatus === 'expired' ||
      (member.membershipExpiryDate && new Date(member.membershipExpiryDate) < new Date());
    if (isExpired) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 justify-center">
          <Clock className="w-3 h-3" /> Expired
        </span>
      );
    }

    const isActive =
      member.membershipStatus === 'active' ||
      (member.status === 'approved' && member.membershipStatus !== 'expired');
    if (isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 justify-center">
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 justify-center">
        {member.status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="px-6 py-3 rounded-t-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Membership Management & Expiry Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage executive designations across tiers (A to F), administer automatic expiration dates, issue term renewals, and suspend memberships with cause.
          </p>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'all'
            ? 'bg-slate-800 border-blue-500 shadow-md'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Members
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
            Active Members
          </span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{counts.active}</div>
        </div>

        <div
          onClick={() => setStatusFilter('expired')}
          className={`px-4 py-2 flex items-center flex-col rounded-b-xl border cursor-pointer transition-all ${statusFilter === 'expired'
            ? 'bg-amber-950/40 border-amber-500 shadow-md'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
            }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Expired Memberships
          </span>
          <div className="text-2xl font-black text-amber-300 mt-1">{counts.expired}</div>
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
      </div>

      {/* Filter & Search Bar */}
      <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {COMMITTEE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl === 'all' ? 'All Committee Tiers' : `${lvl} Level`}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, designation, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={fetchMembers}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
        >
          Refresh Members
        </button>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading membership records...
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No member accounts found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[420px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member Name & Contact</th>
                  <th className="py-3 px-4">Committee & Designation</th>
                  <th className="py-3 px-4">ID Card No.</th>
                  <th className="py-3 px-4">Validity End Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((mem, idx) => {
                  const isSuspended =
                    mem.membershipStatus === 'suspended' || mem.status === 'suspended';
                  const isExpired =
                    mem.membershipStatus === 'expired' ||
                    (mem.membershipExpiryDate && new Date(mem.membershipExpiryDate) < new Date());
                  // Open dropdown upwards if row is near bottom of table (to prevent clipping by table container)
                  const isNearBottom = members.length >= 3 && idx >= Math.max(1, members.length - 3);

                  return (
                    <tr key={mem._id} className={`hover:bg-slate-800/40 transition-colors ${activeActionMenu === mem._id ? 'relative z-30' : ''}`}>
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getMediaUrl(mem.photo)}
                            alt={mem.name}
                            className="w-9 h-9 rounded-full object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{mem.name}</span>
                            <span className="text-[11px] text-slate-400 block">{mem.email}</span>
                            <span className="text-[10px] text-slate-500 block">{mem.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Committee & Designation */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700/60 block w-max mb-1">
                          {mem.committeeLevel || 'District'} Committee
                        </span>
                        <span className="font-semibold text-white block">
                          {mem.assignedDesignation || 'Executive Member'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          📍 {mem.assignedLocation || 'Seemanchal Region'}
                        </span>
                      </td>

                      {/* ID Card */}
                      <td className="py-3 px-4 font-mono">
                        {mem.idCardNumber ? (
                          <span className="text-blue-400 font-bold">{mem.idCardNumber}</span>
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-4">
                        {mem.membershipExpiryDate ? (
                          <div>
                            <span
                              className={`font-semibold block ${isExpired ? 'text-amber-400' : 'text-slate-300'
                                }`}
                            >
                              {new Date(mem.membershipExpiryDate).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {isExpired ? 'Validity Ended' : 'Current Term Active'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Not Assigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">{getMembershipBadge(mem)}</td>

                      {/* Actions Unified Box */}
                      <td className={`py-3 px-4 text-right ${activeActionMenu === mem._id ? 'relative z-30' : ''}`}>
                        <div className="inline-block text-left relative">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenu(activeActionMenu === mem._id ? null : mem._id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                          >
                            <span>Action</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeActionMenu === mem._id ? 'rotate-180' : ''}`} />
                          </button>

                          {activeActionMenu === mem._id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveActionMenu(null)}
                              />
                              <div
                                className={`absolute right-0 ${isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  } w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-40 p-1.5 space-y-1 text-left text-xs animate-in fade-in zoom-in-95 duration-100`}
                              >
                                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                  Action: {mem.name}
                                </div>

                                {/* Change Designation */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenu(null);
                                    handleOpenChangeDesignation(mem);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-blue-950/70 hover:text-blue-300 font-semibold transition-colors text-left"
                                >
                                  <Award className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <span>Change Designation</span>
                                </button>

                                {/* Remove Designation */}
                                {mem.assignedDesignation && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenu(null);
                                      handleRemoveDesignation(mem);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/70 font-semibold transition-colors text-left"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                    <span>Remove Designation</span>
                                  </button>
                                )}

                                {/* Renew Validity */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenu(null);
                                    handleOpenRenew(mem);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-emerald-950/70 hover:text-emerald-300 font-semibold transition-colors text-left"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>Renew Membership Term</span>
                                </button>

                                {/* Suspend or Activate */}
                                {isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenu(null);
                                      handleAction(mem, 'activate');
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-300 hover:bg-emerald-950/70 font-semibold transition-colors text-left"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Activate / Restore Member</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenu(null);
                                      handleOpenSuspend(mem);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-300 hover:bg-amber-950/70 font-semibold transition-colors text-left"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>Suspend Member</span>
                                  </button>
                                )}

                                {/* View History */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenu(null);
                                    setViewingHistoryMember(mem);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors border-t border-slate-800/80 pt-1.5 text-left"
                                >
                                  <History className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                  <span>Membership History</span>
                                </button>
                              </div>
                            </>
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

      {/* RENEW MEMBERSHIP MODAL */}
      {renewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Membership Extension
                </span>
                <h3 className="text-lg font-bold text-white">
                  Renew Term: {renewingMember.name}
                </h3>
              </div>
              <button
                onClick={() => setRenewingMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenew} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Renewal Term Start Date</label>
                <input
                  type="date"
                  required
                  value={renewStartDate}
                  onChange={(e) => setRenewStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Extend By (Years)</label>
                <select
                  value={renewYears}
                  onChange={(e) => setRenewYears(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>1 Year Term</option>
                  <option value={2}>2 Years Term (Standard)</option>
                  <option value={3}>3 Years Term</option>
                  <option value={5}>5 Years Term</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Administrative Remarks</label>
                <input
                  type="text"
                  placeholder="e.g., Annual general meeting authorization, subscription received..."
                  value={renewRemarks}
                  onChange={(e) => setRenewRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/50 text-slate-400 text-[11px]">
                Upon renewal, the member's Digital ID Card validity and system access will be automatically extended to match the new expiry date.
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenewingMember(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Extending...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND MEMBER MODAL */}
      {suspendingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-red-400 tracking-wider">
                  Disciplinary Action
                </span>
                <h3 className="text-lg font-bold text-white">
                  Suspend Member: {suspendingMember.name}
                </h3>
              </div>
              <button
                onClick={() => setSuspendingMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">
                  Suspension Reason <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Code of Conduct violation, unauthorized press conference..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Internal Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Optional committee resolution notes..."
                  value={suspendRemarks}
                  onChange={(e) => setSuspendRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSuspendingMember(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBERSHIP HISTORY MODAL */}
      {viewingHistoryMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                Membership History: {viewingHistoryMember.name}
              </h3>
              <button
                onClick={() => setViewingHistoryMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto text-xs">
              {(!viewingHistoryMember.statusHistory ||
                viewingHistoryMember.statusHistory.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Initial Enrollment &rarr;{' '}
                      <strong className="text-emerald-400 capitalize">
                        {viewingHistoryMember.status || 'Active'}
                      </strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(viewingHistoryMember.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <strong>Remarks:</strong> Registered Member enrolled with ID: {viewingHistoryMember.idCardNumber || 'Pending'} ({viewingHistoryMember.committeeLevel || 'General'} Committee)
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Recorded by: Institutional Membership Administration
                  </span>
                </div>
              ) : (
                viewingHistoryMember.statusHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white capitalize">
                        {hist.oldStatus || 'Initial'} &rarr;{' '}
                        <strong className="text-blue-400">{hist.newStatus}</strong>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(hist.changedAt).toLocaleString()}
                      </span>
                    </div>
                    {hist.remarks && (
                      <p className="text-slate-300 text-[11px]">{hist.remarks}</p>
                    )}
                    {hist.reason && (
                      <p className="text-red-300 text-[11px]">Reason: {hist.reason}</p>
                    )}
                    <span className="text-[10px] text-slate-500 block">
                      Recorded by: {hist.changedByName || 'Administrator'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* CHANGE DESIGNATION MODAL */}
      {changingDesignationMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Administrative Designation
                </span>
                <h3 className="text-lg font-bold text-white">
                  Change Designation: {changingDesignationMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChangingDesignationMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmChangeDesignation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Committee Level / Tier</label>
                <select
                  value={designationForm.committeeLevel}
                  onChange={(e) => {
                    const newLevel = e.target.value;
                    setDesignationForm((prev) => ({ ...prev, committeeLevel: newLevel }));
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="National">National Executive Committee</option>
                  <option value="State">State Executive Committee</option>
                  <option value="District">District Executive Committee</option>
                  <option value="Block">Block / Taluka Committee</option>
                  <option value="Panchayat">Gram Panchayat Committee</option>
                  <option value="Ward">Ward Committee</option>
                  <option value="General">General / Non-Executive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">
                  Select Predefined Designation or Enter Custom
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setDesignationForm((prev) => ({ ...prev, assignedDesignation: e.target.value }));
                    }
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 mb-2"
                >
                  <option value="">-- Choose from Sanctioned Positions --</option>
                  {positionsList
                    .filter((p) => !designationForm.committeeLevel || p.committeeLevel === designationForm.committeeLevel)
                    .map((p) => (
                      <option key={p._id} value={p.title}>
                        {p.title} ({p.committeeLevel})
                      </option>
                    ))}
                </select>

                <input
                  type="text"
                  required
                  placeholder="Designation Title (e.g. State Secretary, District Coordinator...)"
                  value={designationForm.assignedDesignation}
                  onChange={(e) =>
                    setDesignationForm((prev) => ({ ...prev, assignedDesignation: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Assigned Area / Jurisdiction</label>
                <input
                  type="text"
                  placeholder="e.g. Purnea, Kishanganj, Araria, Katihar..."
                  value={designationForm.assignedLocation}
                  onChange={(e) =>
                    setDesignationForm((prev) => ({ ...prev, assignedLocation: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/50 text-slate-400 text-[11px]">
                Updating this designation will immediately reflect on the member&apos;s Digital ID Card, Appointment Letter, and public Team roster.
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setChangingDesignationMember(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {actionLoading ? 'Saving...' : 'Save Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

