'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileCheck,
  Search,
  Eye,
  Check,
  X,
  Award,
  Printer,
  Mail,
  Phone,
  MapPin,
  Shield,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';
import MarkdownView from '../common/MarkdownView';
import DigitalIdCard from '../documents/DigitalIdCard';
import AppointmentLetter from '../documents/AppointmentLetter';
import { setApplications, updateApplicationStatus } from '../../store/slices/adminSlice';

export default function ApplicationsSection() {
  const dispatch = useDispatch();
  const { applications, positions } = useSelector((state) => state.admin);

  const [appRoleFilter, setAppRoleFilter] = useState('all');
  const [appStatusFilter, setAppStatusFilter] = useState('pending');
  const [appSearch, setAppSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [inspectApplicantModal, setInspectApplicantModal] = useState(null);
  const [approvalModalUser, setApprovalModalUser] = useState(null);
  const [rejectionModalUser, setRejectionModalUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // ID & Letter Previews
  const [viewIdCardUser, setViewIdCardUser] = useState(null);
  const [viewLetterUser, setViewLetterUser] = useState(null);

  // Approval Form State
  const [approvalForm, setApprovalForm] = useState({
    committeeLevel: 'National',
    assignedDesignation: '',
    assignedLocation: '',
    validYears: 3,
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = `/admin/applications?status=${appStatusFilter}`;
      if (appRoleFilter !== 'all') url += `&role=${appRoleFilter}`;
      if (appSearch) url += `&search=${encodeURIComponent(appSearch)}`;
      const res = await api.get(url);
      if (res.data?.success) {
        dispatch(setApplications(res.data.applications));
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [appStatusFilter, appRoleFilter, appSearch]);

  const openApproveModal = (applicant) => {
    setApprovalModalUser(applicant);
    const defaultLevel = applicant.role === 'reporter' ? 'Press' : 'District';
    setApprovalForm({
      committeeLevel: defaultLevel,
      assignedDesignation:
        applicant.role === 'reporter' ? 'Press Reporter / District Correspondent' : '',
      assignedLocation:
        applicant.reportingAreaPreference ||
        applicant.assignedLocation ||
        applicant.address?.district ||
        'Seemanchal Region',
      validYears: 3,
    });
    setActionError('');
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approvalModalUser) return;
    const appId = approvalModalUser._id || approvalModalUser.id;
    if (!appId) {
      setActionError('Applicant ID missing.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/applications/${appId}/approve`, approvalForm);
      if (res.data?.success) {
        dispatch(
          updateApplicationStatus({
            id: appId,
            updatedUser: res.data.user,
          })
        );
        setApprovalModalUser(null);
        fetchApplications();
      } else {
        setActionError(res.data?.message || 'Approval failed.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error occurred while approving application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionModalUser) return;
    const appId = rejectionModalUser._id || rejectionModalUser.id;
    if (!appId) {
      setActionError('Applicant ID missing.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/applications/${appId}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data?.success) {
        dispatch(
          updateApplicationStatus({
            id: appId,
            updatedUser: res.data.user,
          })
        );
        setRejectionModalUser(null);
        setRejectionReason('');
        fetchApplications();
      } else {
        setActionError(res.data?.message || 'Rejection failed.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error occurred while rejecting application.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPositions = positions.filter(
    (p) => p.committeeLevel === approvalForm.committeeLevel
  );

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              Applicant Reviews & Credential Issuance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review incoming membership & reporter applications, verify ID proofs, and issue verified digital credentials.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Total In View: <strong className="text-white">{applications.length}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Applicant:</span>
              <select
                value={appRoleFilter}
                onChange={(e) => setAppRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
              >
                <option value="all">All Applicants</option>
                <option value="member">Members</option>
                <option value="reporter">Press Reporters</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Status:</span>
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Declined</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search applicant name, phone, email..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white w-56 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading applications...</div>
        ) : applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-white uppercase font-bold text-[11px] border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Role / Title</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location / Area</th>
                  <th className="py-3 px-4">Date Filed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {applications.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-slate-600">
                        <img
                          src={getMediaUrl(app.photo)}
                          alt={app.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <strong className="text-white block font-bold">{app.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {app.idProofNumber || 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.role === 'reporter'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {app.role === 'reporter' ? 'Reporter' : 'Member'}
                      </span>
                      {app.assignedDesignation && (
                        <span className="block text-[11px] font-semibold text-slate-200 mt-0.5">
                          {app.assignedDesignation} ({app.committeeLevel})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{app.phone}</div>
                      <div className="text-[11px] text-slate-400">{app.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {app.reportingAreaPreference ||
                        app.assignedLocation ||
                        app.address?.district ||
                        'Seemanchal'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US') : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setInspectApplicantModal(app)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-bold transition-colors border border-slate-700 shadow-sm inline-flex items-center gap-1"
                        title="Inspect Complete Application Dossier"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Inspect</span>
                      </button>

                      {app.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => openApproveModal(app)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
                          >
                            Approve & Assign
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalUser(app);
                              setRejectionReason('');
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 rounded text-xs font-bold transition-colors border border-slate-700"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-2">
                          <span
                            className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize ${
                              app.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {app.status}
                          </span>
                          {app.status === 'approved' && (
                            <>
                              <button
                                onClick={() => setViewIdCardUser(app)}
                                title="View Digital ID Card"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                              >
                                <Award className="w-3.5 h-3.5 text-red-500" />
                              </button>
                              <button
                                onClick={() => setViewLetterUser(app)}
                                title="View Appointment Letter"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No applications matching selected criteria.
          </div>
        )}
      </div>

      {/* MODAL 1: Approval Modal */}
      {approvalModalUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Approve Application & Assign Office</h3>
                <p className="text-xs text-slate-400">
                  Applicant: <strong className="text-white">{approvalModalUser.name}</strong> ({approvalModalUser.role})
                </p>
              </div>
              <button
                onClick={() => setApprovalModalUser(null)}
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

            <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Committee Tier *</label>
                <select
                  value={approvalForm.committeeLevel}
                  onChange={(e) =>
                    setApprovalForm({
                      ...approvalForm,
                      committeeLevel: e.target.value,
                      assignedDesignation: '',
                    })
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
                <label className="block font-bold text-slate-300 mb-1">
                  Assigned Designation / Title *
                </label>
                <select
                  required
                  value={approvalForm.assignedDesignation}
                  onChange={(e) =>
                    setApprovalForm({ ...approvalForm, assignedDesignation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-semibold text-white"
                >
                  <option value="">Select Position / Office</option>
                  {filteredPositions.map((p) => (
                    <option key={p._id || p.id} value={p.title}>
                      {p.title} (Seats: {p.maxSeats})
                    </option>
                  ))}
                  <option value="Special Representative">Special Representative (Custom)</option>
                  <option value="Press Reporter / District Correspondent">
                    Press Reporter / District Correspondent
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Assigned Jurisdiction / Location *
                </label>
                <input
                  type="text"
                  required
                  value={approvalForm.assignedLocation}
                  onChange={(e) =>
                    setApprovalForm({ ...approvalForm, assignedLocation: e.target.value })
                  }
                  placeholder="e.g. Kishanganj District, Purnea Division, National HQ"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Validity Period</label>
                  <select
                    value={approvalForm.validYears}
                    onChange={(e) =>
                      setApprovalForm({ ...approvalForm, validYears: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                  >
                    <option value={1}>1 Year Term</option>
                    <option value={2}>2 Years Term</option>
                    <option value={3}>3 Years Term</option>
                    <option value={5}>5 Years Term</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setApprovalModalUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
                >
                  {actionLoading ? 'Issuing Credentials...' : 'Approve & Issue ID Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Rejection Modal */}
      {rejectionModalUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-2">Decline Application</h3>
            <p className="text-xs text-slate-400 mb-4">
              State the editorial or administrative reason for rejecting{' '}
              <strong className="text-white">{rejectionModalUser.name}</strong>.
            </p>
            {actionError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold">
                {actionError}
              </div>
            )}
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Unverified identity proof, outside editorial coverage zone..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                >
                  {actionLoading ? 'Declining...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Inspect Applicant Dossier */}
      {inspectApplicantModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 shrink-0">
                  <img
                    src={getMediaUrl(inspectApplicantModal.photo)}
                    alt={inspectApplicantModal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-white">{inspectApplicantModal.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inspectApplicantModal.role === 'reporter'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {inspectApplicantModal.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inspectApplicantModal.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : inspectApplicantModal.status === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {inspectApplicantModal.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      {inspectApplicantModal.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {inspectApplicantModal.phone}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectApplicantModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Permanent / Residence Address
                </h4>
                <div className="space-y-1 text-slate-300">
                  <p>
                    <strong>Street:</strong> {inspectApplicantModal.address?.street || 'N/A'}
                  </p>
                  <p>
                    <strong>Village / Ward:</strong>{' '}
                    {inspectApplicantModal.address?.villageOrWard || 'N/A'}
                  </p>
                  <p>
                    <strong>Panchayat / Block:</strong>{' '}
                    {inspectApplicantModal.address?.panchayatOrBlock || 'N/A'}
                  </p>
                  <p>
                    <strong>District & State:</strong>{' '}
                    {inspectApplicantModal.address?.district || 'Seemanchal'},{' '}
                    {inspectApplicantModal.address?.state || 'Bihar'} -{' '}
                    {inspectApplicantModal.address?.pincode || ''}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Professional Credentials
                </h4>
                {inspectApplicantModal.role === 'reporter' ? (
                  <div className="space-y-1 text-slate-300">
                    <p>
                      <strong>Press Experience:</strong>{' '}
                      {inspectApplicantModal.pressExperienceYears || 0} Years
                    </p>
                    <p>
                      <strong>Reporting Area Preference:</strong>{' '}
                      {inspectApplicantModal.reportingAreaPreference || 'General Seemanchal'}
                    </p>
                    <p>
                      <strong>Reporting Beats:</strong>{' '}
                      {inspectApplicantModal.reportingBeats?.length > 0
                        ? inspectApplicantModal.reportingBeats.join(', ')
                        : 'General News'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-300">
                    <p>
                      <strong>Educational Qualifications:</strong>{' '}
                      {inspectApplicantModal.qualifications || 'N/A'}
                    </p>
                    <p>
                      <strong>Blood Group:</strong>{' '}
                      {inspectApplicantModal.bloodGroup || 'Unspecified'}
                    </p>
                  </div>
                )}

                {inspectApplicantModal.idProofNumber && (
                  <p className="mt-2 text-slate-300">
                    <strong>ID Proof No:</strong> {inspectApplicantModal.idProofNumber}
                  </p>
                )}
                {inspectApplicantModal.idProof && (
                  <div className="mt-2">
                    <a
                      href={getMediaUrl(inspectApplicantModal.idProof)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View Submitted ID Proof Document
                    </a>
                  </div>
                )}
              </div>
            </div>

            {inspectApplicantModal.bio && (
              <div className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Applicant Statement / Bio
                </h4>
                <div className="text-slate-200 text-xs">
                  <MarkdownView content={inspectApplicantModal.bio} isDark={true} />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
              <span className="text-xs text-slate-500">
                Application Filed: {new Date(inspectApplicantModal.createdAt).toLocaleString()}
              </span>

              <div className="flex items-center gap-2">
                {inspectApplicantModal.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const app = inspectApplicantModal;
                        setInspectApplicantModal(null);
                        openApproveModal(app);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Assign Office
                    </button>
                    <button
                      onClick={() => {
                        const app = inspectApplicantModal;
                        setInspectApplicantModal(null);
                        setRejectionModalUser(app);
                        setRejectionReason('');
                      }}
                      className="px-3 py-2 bg-red-950 text-red-400 hover:bg-red-900 font-bold text-xs rounded-lg border border-red-800"
                    >
                      Decline
                    </button>
                  </>
                )}

                <button
                  onClick={() => setInspectApplicantModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Digital ID Card Preview Modal */}
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

      {/* MODAL 5: Appointment Letter Preview Modal */}
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
