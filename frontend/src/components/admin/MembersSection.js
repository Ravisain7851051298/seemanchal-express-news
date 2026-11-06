'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  Search,
  Award,
  Printer,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  Edit,
  X,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';
import DigitalIdCard from '../documents/DigitalIdCard';
import AppointmentLetter from '../documents/AppointmentLetter';
import { setUsers, updateUserItem } from '../../store/slices/adminSlice';

export default function MembersSection() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.admin);

  const [memberRoleFilter, setMemberRoleFilter] = useState('all');
  const [memberTierFilter, setMemberTierFilter] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals & Actions
  const [editMemberModalUser, setEditMemberModalUser] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState({
    committeeLevel: 'National',
    assignedDesignation: '',
    assignedLocation: '',
    showOnTeamPage: true,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // ID & Letter Previews
  const [viewIdCardUser, setViewIdCardUser] = useState(null);
  const [viewLetterUser, setViewLetterUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data?.success) {
        dispatch(setUsers(res.data.users));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTeamPage = async (memberId, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${memberId}/team-page-visibility`, {
        showOnTeamPage: !currentStatus,
      });
      if (res.data?.success) {
        dispatch(updateUserItem(res.data.user));
      }
    } catch (err) {
      console.error('Failed to toggle team page visibility:', err);
    }
  };

  const openEditModal = (member) => {
    setEditMemberModalUser(member);
    setEditMemberForm({
      committeeLevel: member.committeeLevel || 'National',
      assignedDesignation: member.assignedDesignation || '',
      assignedLocation: member.assignedLocation || '',
      showOnTeamPage: !!member.showOnTeamPage,
    });
    setActionError('');
  };

  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    if (!editMemberModalUser) return;
    const memberId = editMemberModalUser._id || editMemberModalUser.id;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.put(`/admin/users/${memberId}/office-assignment`, editMemberForm);
      if (res.data?.success) {
        dispatch(updateUserItem(res.data.user));
        fetchUsers();
        setEditMemberModalUser(null);
      } else {
        setActionError(res.data?.message || 'Update failed.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error occurred while updating assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this user record permanently?')) return;
    try {
      const res = await api.delete(`/admin/users/${memberId}`);
      if (res.data?.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Filter approved members & reporters
  const approvedMembers = users.filter(
    (u) => u.status === 'approved' && u.role !== 'admin'
  );

  const filteredMembers = approvedMembers.filter((m) => {
    if (memberRoleFilter !== 'all' && m.role !== memberRoleFilter) return false;
    if (memberTierFilter !== 'all' && m.committeeLevel !== memberTierFilter) return false;
    if (memberSearch) {
      const query = memberSearch.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(query);
      const matchEmail = m.email?.toLowerCase().includes(query);
      const matchPhone = m.phone?.toLowerCase().includes(query);
      const matchDesig = m.assignedDesignation?.toLowerCase().includes(query);
      const matchCard = m.idCardNumber?.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchPhone && !matchDesig && !matchCard) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Member Management & Public Team Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage assigned office designations, jurisdictions, credential documents, and toggle public display on the website&apos;s Team page.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredMembers.length}</strong> leaders / reporters
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Role:</span>
              <select
                value={memberRoleFilter}
                onChange={(e) => setMemberRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
              >
                <option value="all">All Roles</option>
                <option value="member">Members</option>
                <option value="reporter">Reporters</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Committee Tier:</span>
              <select
                value={memberTierFilter}
                onChange={(e) => setMemberTierFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
              >
                <option value="all">All Tiers</option>
                <option value="National">National Executive</option>
                <option value="State">State Executive</option>
                <option value="District">District Executive</option>
                <option value="Block">Block / Taluka</option>
                <option value="Panchayat">Gram Panchayat</option>
                <option value="Ward">Ward Committee</option>
                <option value="Press">Press Corps</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search name, designation, ID..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 w-52 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="text-xs text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 align-middle"></span>
            Public on Team Page:{' '}
            <strong className="text-white">
              {filteredMembers.filter((m) => m.showOnTeamPage).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading members...</div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((m) => (
              <div
                key={m._id || m.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-slate-600">
                        <img
                          src={getMediaUrl(m.photo)}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{m.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Card: {m.idCardNumber || 'N/A'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              m.role === 'reporter'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-blue-950 text-blue-400 border border-blue-800'
                            }`}
                          >
                            {m.role}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {m.committeeLevel || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle show on Team Page */}
                    <button
                      onClick={() => handleToggleTeamPage(m._id || m.id, m.showOnTeamPage)}
                      title={m.showOnTeamPage ? 'Hide from Team Page' : 'Show on Team Page'}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        m.showOnTeamPage
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {m.showOnTeamPage ? '✓ On Team' : '+ Add Team'}
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 py-2 border-t border-slate-800/80">
                    <p>
                      <strong className="text-slate-400 font-semibold">Title:</strong>{' '}
                      {m.assignedDesignation || 'Member'}
                    </p>
                    <p>
                      <strong className="text-slate-400 font-semibold">Jurisdiction:</strong>{' '}
                      {m.assignedLocation || 'Seemanchal Region'}
                    </p>
                    <p>
                      <strong className="text-slate-400 font-semibold">Contact:</strong> {m.phone} |{' '}
                      <span className="text-slate-400 text-[11px]">{m.email}</span>
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewIdCardUser(m)}
                      title="View Digital ID Card"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                    >
                      <Award className="w-3.5 h-3.5 text-red-500" />
                    </button>
                    <button
                      onClick={() => setViewLetterUser(m)}
                      title="View Appointment Letter"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(m)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(m._id || m.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/40"
                      title="Delete User Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No members or leaders matching the selected filters.
          </div>
        )}
      </div>

      {/* Edit Member Assignment Modal */}
      {editMemberModalUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Assignment & Committee Details</h3>
                <p className="text-xs text-slate-400">
                  Leader: <strong className="text-white">{editMemberModalUser.name}</strong> ({editMemberModalUser.role})
                </p>
              </div>
              <button
                onClick={() => setEditMemberModalUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleEditMemberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Committee Tier *</label>
                <select
                  value={editMemberForm.committeeLevel}
                  onChange={(e) =>
                    setEditMemberForm({ ...editMemberForm, committeeLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-semibold text-white"
                >
                  <option value="National">A. National Executive Committee</option>
                  <option value="State">B. State Executive Committee (Bihar)</option>
                  <option value="District">C. District Executive Committee</option>
                  <option value="Block">D. Block / Taluka Committee</option>
                  <option value="Panchayat">E. Gram Panchayat Committee</option>
                  <option value="Ward">F. Ward Committee</option>
                  <option value="Press">Editorial & Field Reporting Team</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Designation / Title *</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.assignedDesignation}
                  onChange={(e) =>
                    setEditMemberForm({ ...editMemberForm, assignedDesignation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-semibold text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Assigned Jurisdiction / Location *</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.assignedLocation}
                  onChange={(e) =>
                    setEditMemberForm({ ...editMemberForm, assignedLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={editMemberForm.showOnTeamPage}
                    onChange={(e) =>
                      setEditMemberForm({
                        ...editMemberForm,
                        showOnTeamPage: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Show on Public Team Directory Page</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditMemberModalUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital ID Card Preview Modal */}
      {viewIdCardUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-800">
            <button
              onClick={() => setViewIdCardUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <DigitalIdCard cardData={viewIdCardUser} />
          </div>
        </div>
      )}

      {/* Appointment Letter Preview Modal */}
      {viewLetterUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto border border-slate-800">
            <button
              onClick={() => setViewLetterUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <AppointmentLetter appointmentData={viewLetterUser} />
          </div>
        </div>
      )}
    </div>
  );
}
