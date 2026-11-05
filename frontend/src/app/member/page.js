'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  MapPin,
  LogOut,
  Edit,
  Save,
  Lock,
  ExternalLink,
  RotateCcw,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Camera,
  Copy,
  Check,
  Eye,
  EyeOff,
  Scale,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';
import MarkdownView from '../../components/common/MarkdownView';
import DigitalIdCard from '../../components/documents/DigitalIdCard';
import AppointmentLetter from '../../components/documents/AppointmentLetter';
import LegalAgreementAcceptanceModal from '../../components/legal/LegalAgreementAcceptanceModal';

export default function MemberDashboard() {
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'id-card', 'appointment-letter', 'committee', 'security'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [idCardData, setIdCardData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [previewBioMarkdown, setPreviewBioMarkdown] = useState(false);

  // Profile Edit State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    photo: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password Change State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showMemberPasswords, setShowMemberPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  // Legal Policies & Compliance State
  const [legalStatus, setLegalStatus] = useState({
    pendingCount: 0,
    acceptedCount: 0,
    pendingDocuments: [],
    acceptedDocuments: [],
    isCompliant: true,
  });
  const [loadingLegalStatus, setLoadingLegalStatus] = useState(false);
  const [reviewingPolicyDoc, setReviewingPolicyDoc] = useState(null);
  const [policyAcceptLoading, setPolicyAcceptLoading] = useState(false);

  const fetchLegalStatus = async () => {
    try {
      setLoadingLegalStatus(true);
      const res = await api.get('/legal/acceptance/my-status');
      if (res.data.success) {
        setLegalStatus({
          pendingCount: res.data.pendingCount || 0,
          acceptedCount: res.data.acceptedCount || 0,
          pendingDocuments: res.data.pendingDocuments || [],
          acceptedDocuments: res.data.acceptedDocuments || [],
          isCompliant: res.data.isCompliant,
        });
      }
    } catch (err) {
      console.error('Failed to load legal compliance status:', err);
    } finally {
      setLoadingLegalStatus(false);
    }
  };

  const handleOpenReviewPolicy = async (doc) => {
    setReviewingPolicyDoc({ ...doc, loadingContent: true });
    try {
      const res = await api.get(`/legal/view/${doc.slug}`);
      if (res.data.success && res.data.document) {
        setReviewingPolicyDoc(res.data.document);
      } else {
        setReviewingPolicyDoc(doc);
      }
    } catch (err) {
      setReviewingPolicyDoc(doc);
    }
  };

  const handleAcceptPolicy = async (docId) => {
    try {
      setPolicyAcceptLoading(true);
      const res = await api.post(`/legal/acceptance/${docId}`);
      if (res.data.success) {
        setReviewingPolicyDoc(null);
        await fetchLegalStatus();
        alert('नीति / अनुबंध सफलतापूर्वक स्वीकार कर लिया गया है। (Policy accepted successfully)');
      } else {
        alert(res.data.message || 'Failed to accept policy');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording acceptance');
    } finally {
      setPolicyAcceptLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchDocs = async () => {
    if (!user) return;
    setFetchingDocs(true);
    try {
      const [cardRes, apptRes] = await Promise.allSettled([
        api.get(`/documents/id-card/${user.id || user._id}`),
        api.get(`/documents/appointment-letter/${user.id || user._id}`),
      ]);

      if (cardRes.status === 'fulfilled' && cardRes.value.data.success) {
        setIdCardData(cardRes.value.data.cardData);
      }
      if (apptRes.status === 'fulfilled' && apptRes.value.data.success) {
        setAppointmentData(apptRes.value.data.appointmentData);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setFetchingDocs(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        photo: user.photo || '',
      });

      fetchLegalStatus();

      if (user.status === 'approved') {
        fetchDocs();
      }
    }
  }, [user]);

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', editForm);
      if (res.data.success) {
        alert('Profile details updated successfully');
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  // Upload & update profile photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const uploadRes = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (uploadRes.data.success) {
        const uploadedUrl = uploadRes.data.fileUrl;
        setEditForm((prev) => ({ ...prev, photo: uploadedUrl }));
        // Persist photo directly in database & update Redux auth state
        const profileRes = await api.put('/auth/profile', { photo: uploadedUrl });
        if (profileRes.data.success && refreshUser) {
          refreshUser();
        }
      }
    } catch (err) {
      console.error('Member photo upload error:', err);
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data.success) {
        setPasswordMsg({ text: 'Password successfully updated!', type: 'success' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password. Verify current password.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isApproved = user.status === 'approved';
  const isPending = user.status === 'pending';
  const isRejected = user.status === 'rejected';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* 1. Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center p-0 m-0">
          <img
            src="/logo.jpeg"
            alt="Seemanchal Express"
            className="h-10 sm:h-12 w-auto object-contain rounded bg-white p-0.5 block shadow-sm"
          />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5`}
      >
        <div>
          {/* Brand Logo - Big Logo, No Name */}
          <div className="pb-5 border-b border-slate-800 mb-6">
            <Link href="/" className="block p-0 m-0">
              <img
                src="/logo.jpeg"
                alt="Seemanchal Express"
                className="w-full h-auto max-h-20 object-contain rounded-lg bg-white p-1 block shadow-sm hover:opacity-95 transition-opacity"
              />
            </Link>
          </div>

          {/* Member Profile Badge */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-700 border-2 border-red-500 shrink-0">
                <img
                  src={getMediaUrl(user.photo)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-white truncate">{user.name}</h3>
                <span className="text-[11px] text-red-400 font-semibold block truncate">
                  {user.assignedDesignation || 'Executive Member'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {user.idCardNumber || 'Verification Pending'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/60 text-slate-400">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">{user.assignedLocation || 'Bihar'}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  isApproved
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : isPending
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('overview');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Membership Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('id-card');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'id-card'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Digital ID Card</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('appointment-letter');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'appointment-letter'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Appointment Letter</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('committee');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'committee'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Committee Hierarchy</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('compliance');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'compliance'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Scale className="w-4 h-4" />
                <span>Policies & Compliance</span>
              </span>
              {legalStatus.pendingCount > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-600 text-white animate-pulse">
                  {legalStatus.pendingCount} Pending
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400">
                  Verified
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('security');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Profile & Security</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Public News Portal</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Area */}
      <main className="flex-1 min-h-screen overflow-y-auto p-4 sm:p-8">
        {/* Mandatory Legal Agreement Acceptance Modal */}
        <LegalAgreementAcceptanceModal
          token={typeof window !== 'undefined' ? localStorage.getItem('token') : null}
          userRole="member"
          onAllAccepted={() => {}}
        />

        {/* Member Application Rejection Alert */}
        {isRejected && (
          <div className="mb-6 p-5 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-200 space-y-2 shadow-2xl">
            <div className="flex items-center gap-2 text-base font-black text-white">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Membership Application Rejected / Access Denied
            </div>
            <p className="text-xs leading-relaxed text-red-200">
              Your membership application was reviewed and not approved by the central administration. Reason:{' '}
              <strong className="text-white">{user?.rejectionReason || 'Application criteria not met'}</strong>.
              Access to verified digital ID cards, appointment letters, and committee functions has been denied.
            </p>
          </div>
        )}

        {/* Member Suspension Alert */}
        {(user?.membershipStatus === 'suspended' || user?.status === 'suspended') && (
          <div className="mb-6 p-5 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-200 space-y-2 shadow-2xl">
            <div className="flex items-center gap-2 text-base font-black text-white">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Membership Account Suspended
            </div>
            <p className="text-xs leading-relaxed text-red-200">
              Your organizational membership has been suspended by the administration. Reason:{' '}
              <strong className="text-white">{user?.suspensionReason || 'Under administrative review'}</strong>.
              Access to verified membership credentials is restricted.
            </p>
          </div>
        )}

        {/* Member Expiry Alert */}
        {(user?.membershipStatus === 'expired' ||
          (user?.membershipExpiryDate && new Date(user?.membershipExpiryDate) < new Date())) &&
          user?.membershipStatus !== 'suspended' && (
            <div className="mb-6 p-5 rounded-2xl bg-amber-950/80 border-2 border-amber-600 text-amber-200 space-y-2 shadow-2xl">
              <div className="flex items-center gap-2 text-base font-black text-white">
                <Clock className="w-5 h-5 text-amber-400" />
                Membership Validity Expired
              </div>
              <p className="text-xs leading-relaxed text-amber-200">
                Your organizational membership expired on{' '}
                <strong className="text-white">
                  {user?.membershipExpiryDate
                    ? new Date(user?.membershipExpiryDate).toLocaleDateString()
                    : 'Scheduled validity end'}
                </strong>
                . Please contact the Central Administration / National Committee to process your membership renewal.
              </p>
            </div>
          )}

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest block mb-1">
              Member Executive Portal
            </span>
            <h2 className="text-2xl font-black text-white">
              {activeTab === 'overview' && 'Membership Status & Credentials'}
              {activeTab === 'id-card' && 'Official Digital Identity Card'}
              {activeTab === 'appointment-letter' && 'Official Executive Appointment Letter'}
              {activeTab === 'committee' && 'Assigned Committee Structure'}
              {activeTab === 'compliance' && 'Policies & Member Compliance'}
              {activeTab === 'security' && 'Member Profile & Security Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                isApproved
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : isPending
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
              {isPending && <Clock className="w-3.5 h-3.5" />}
              {isRejected && <AlertCircle className="w-3.5 h-3.5" />}
              {user.status === 'approved' ? 'Verified Member' : user.status}
            </span>
            <button
              onClick={() => {
                fetchDocs();
                fetchLegalStatus();
              }}
              title="Refresh"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Urgent Legal & Membership Policy Compliance Alert */}
            {legalStatus.pendingCount > 0 && (
              <div className="bg-gradient-to-r from-rose-950 via-rose-900/90 to-amber-950/80 border-2 border-rose-600 rounded-2xl p-5 sm:p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md mt-0.5">
                      <AlertCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                          Pending Compliance
                        </span>
                        <span className="text-xs text-rose-200 font-bold">
                          {legalStatus.pendingCount} Mandatory Policy {legalStatus.pendingCount === 1 ? 'Agreement' : 'Agreements'} Pending
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white mt-1">
                        सदस्यता एवं विधिक नीतियों की स्वीकृति लंबित है
                      </h4>
                      <p className="text-xs text-rose-100/90 mt-1 max-w-2xl leading-relaxed">
                        नमस्कार {user?.name || 'सदस्य'} जी, संगठन दिशा-निर्देशों के तहत आपकी <strong>{legalStatus.pendingCount}</strong> विधिक व सदस्यता नीतियां लंबित हैं। कृपया नीचे दिए गए लिंक से इन्हें पढ़ें और स्वीकार करें।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('compliance')}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 shrink-0 flex items-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    <span>View All Policies ({legalStatus.pendingCount}) →</span>
                  </button>
                </div>

                {/* Quick Links to Pending Policies */}
                <div className="mt-4 pt-4 border-t border-rose-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {legalStatus.pendingDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-slate-950/70 border border-rose-800/60 rounded-xl p-3 flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{doc.title}</p>
                        <span className="text-[10px] text-rose-300 capitalize">
                          v{doc.version || 1}.0 • {doc.category || 'Member'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/legal/${doc.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-slate-700"
                          title="Open & Read Full Policy"
                        >
                          <span>पढ़ें</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenReviewPolicy(doc)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black rounded-lg transition-colors shadow-sm"
                        >
                          स्वीकारें
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Status Alert if not approved */}
            {isPending && (
              <div className="p-4 bg-amber-950/60 border border-amber-800 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Application Under Administrative Review
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-1">
                    Your membership application is being reviewed by the central leadership committee.
                    Once approved, your assigned committee level, designation, digital ID card, and appointment letter will be active.
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-300">
                    Membership Application Not Approved
                  </h4>
                  <p className="text-xs text-red-200/80 mt-1">
                    {user.rejectionReason || 'Your application could not be verified at this time.'}
                  </p>
                </div>
              </div>
            )}

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block mb-1">Committee Tier</span>
                <strong className="text-xl font-black text-white">
                  {user.committeeLevel ? `${user.committeeLevel} Level` : 'General Member'}
                </strong>
                <span className="text-[10px] text-red-400 block mt-1">
                  {user.assignedDesignation || 'Member'}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block mb-1">Assigned Area</span>
                <strong className="text-xl font-black text-white truncate block">
                  {user.assignedLocation || 'National HQ, New Delhi'}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-1">Jurisdiction Beat</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-400">ID Card Number</span>
                  {user.idCardNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(user.idCardNumber);
                        setCopiedId(true);
                        setTimeout(() => setCopiedId(false), 2000);
                      }}
                      className="text-[10px] text-amber-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                      title="Copy ID Card Number"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <strong className="text-xl font-black text-amber-400 font-mono">
                  {user.idCardNumber || 'Pending'}
                </strong>
                <span className="text-[10px] text-emerald-400 block mt-1">
                  {isApproved ? 'Verified & Active' : 'Awaiting Approval'}
                </span>
              </div>
            </div>

            {/* Member Profile Bio with Markdown */}
            {user.bio && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-red-500" /> Member Profile Statement / Bio
                </h3>
                <div className="text-slate-200 text-xs sm:text-sm">
                  <MarkdownView content={user.bio} isDark={true} />
                </div>
              </div>
            )}

            {/* Mandatory Legal & Governance Compliance Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Legal Documents & Policy Compliance (विधिक नीतियां एवं स्वीकृति)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      IT Act 2000 & organizational compliance tracking for active membership
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {legalStatus.pendingCount === 0 ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-950/80 border border-emerald-600 text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All Accepted
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-950/80 border border-rose-600 text-rose-400 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" /> {legalStatus.pendingCount} Action Required
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('compliance')}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline ml-2"
                  >
                    View All Policies →
                  </button>
                </div>
              </div>

              {/* Document Status Breakdown */}
              <div className="space-y-3">
                {/* Pending Documents */}
                {legalStatus.pendingDocuments && legalStatus.pendingDocuments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-rose-400 block uppercase tracking-wider">
                      Pending Acceptance ({legalStatus.pendingDocuments.length})
                    </span>
                    {legalStatus.pendingDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/50 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{doc.titleHindi || doc.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {doc.title} • Version {doc.version}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/legal/${doc.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1"
                          >
                            Read Policy <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenReviewPolicy(doc)}
                            className="text-[11px] font-bold text-slate-950 px-3 py-1 rounded bg-rose-500 hover:bg-rose-400 shadow-sm"
                          >
                            Review & Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Accepted Documents */}
                {legalStatus.acceptedDocuments && legalStatus.acceptedDocuments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
                      Accepted Policies ({legalStatus.acceptedDocuments.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {legalStatus.acceptedDocuments.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-emerald-900/30 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-semibold text-slate-200 block truncate">
                                {item.documentTitleHindi || item.documentTitle}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Accepted {new Date(item.acceptedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`/legal/${item.documentSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline shrink-0 flex items-center gap-0.5"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions to View ID and Letter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center mb-3">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Executive Digital ID Card</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your official digital ID card with scannable QR verification code, committee level, and organization seal.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('id-card')}
                  disabled={!isApproved}
                  className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl self-start transition-all"
                >
                  {isApproved ? 'Inspect & Print ID Card →' : 'Available After Approval'}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-500 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Formal Appointment Letter</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Official authorization document issued by the central administration appointing you to your office.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('appointment-letter')}
                  disabled={!isApproved}
                  className="mt-6 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs rounded-xl self-start transition-all"
                >
                  {isApproved ? 'Inspect & Print Letter →' : 'Available After Approval'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL ID CARD */}
        {activeTab === 'id-card' && (
          isRejected ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">ID Card Access Denied</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
                Your membership application was not approved ({user?.rejectionReason || 'Application rejected'}). Official digital membership credentials are reserved exclusively for approved members.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Return to Member Overview
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
              <div className="text-center mb-6 max-w-md">
                <h3 className="text-lg font-black text-white">Official Executive ID Card</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authorized identity credential for Seemanchal Express leadership. Scan QR to verify live online.
                </p>
              </div>

              {isApproved ? (
                <div className="w-full flex justify-center">
                  <DigitalIdCard cardData={idCardData || user} />
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Digital ID Card will be generated as soon as your application is approved by the admin.
                </div>
              )}
            </div>
          )
        )}

        {/* TAB 3: APPOINTMENT LETTER */}
        {activeTab === 'appointment-letter' && (
          isRejected ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Appointment Letter Denied</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
                Your membership application was not approved. Executive appointment decrees are not issued to unapproved or rejected applicants.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Return to Member Overview
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
              <div className="text-center mb-6 max-w-md">
                <h3 className="text-lg font-black text-white">Official Appointment Letter</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Executive appointment decree signed by the National Leadership Committee.
                </p>
              </div>

              {isApproved ? (
                <div className="w-full flex justify-center">
                  <AppointmentLetter appointmentData={appointmentData || user} />
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Official Appointment Letter will be issued upon approval.
                </div>
              )}
            </div>
          )
        )}

        {/* TAB 4: COMMITTEE STRUCTURE */}
        {activeTab === 'committee' && (
          isRejected ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Committee Access Denied</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
                Committee tier placements and operational deliberations are restricted to verified organization members.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Return to Member Overview
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm max-w-4xl mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">Organizational Hierarchy & Tier System</h3>
              <p className="text-xs text-slate-400 mt-1">
                Seemanchal Express operates across 6 decentralized executive committee tiers from the National capital down to Ward units.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                {
                  id: 'National',
                  title: 'A. National Executive Committee',
                  desc: 'Apex policy and strategic decision-making council headquartered in New Delhi. Oversees national representation and press governance.',
                },
                {
                  id: 'State',
                  title: 'B. State Executive Committee (Bihar)',
                  desc: 'State leadership council coordinating inter-district affairs, government liaisons, and regional welfare.',
                },
                {
                  id: 'District',
                  title: 'C. District Executive Committee',
                  desc: 'Active in Kishanganj, Purnea, Katihar, and Araria. Oversees block coordinators and ground public representation.',
                },
                {
                  id: 'Block',
                  title: 'D. Block / Taluka Committee',
                  desc: 'Connects village clusters and blocks with sub-divisional administrative desks and grievance redressing.',
                },
                {
                  id: 'Panchayat',
                  title: 'E. Gram Panchayat Committee',
                  desc: 'Village-level empowerment bodies advocating for rural welfare, flood defense, health, and primary education.',
                },
                {
                  id: 'Ward',
                  title: 'F. Ward Committee',
                  desc: 'Hyper-local grassroots mobilization engaging residents, volunteers, and citizen journalists directly.',
                },
              ].map((tier) => {
                const isMyTier = user.committeeLevel === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-xl border transition-all relative ${
                      isMyTier
                        ? 'bg-red-950/40 border-red-500 shadow-md ring-1 ring-red-500/50'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    {isMyTier && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider">
                        Your Assigned Tier
                      </span>
                    )}
                    <strong className="text-amber-400 block text-sm mb-1">{tier.title}</strong>
                    <p className="text-slate-300 leading-relaxed">{tier.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
          )
        )}

        {/* TAB: LEGAL & MEMBERSHIP POLICIES COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Compliance Status Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      legalStatus.pendingCount === 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-red-400">
                      Organizational Governance
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Policies & Member Compliance Console
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      सदस्यता आचार संहिता, संगठन नीतियां एवं विधिक नियम
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {legalStatus.pendingCount === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-black shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> All Mandatory Policies Accepted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-600 text-rose-400 text-xs font-black animate-pulse shadow-sm">
                      <AlertCircle className="w-4 h-4" /> {legalStatus.pendingCount} Action Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Status Summary Counter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    Lapsed / Pending Acceptance
                  </span>
                  <strong
                    className={`text-2xl font-black ${
                      legalStatus.pendingCount > 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    {legalStatus.pendingCount}
                  </strong>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Acceptance required immediately
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    Signed & Accepted Policies
                  </span>
                  <strong className="text-2xl font-black text-emerald-400">
                    {legalStatus.acceptedCount}
                  </strong>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Digitally archived with timestamp
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Membership Status</span>
                  <strong className="text-2xl font-black text-red-400">
                    {legalStatus.pendingCount === 0 ? 'Good Standing' : 'Pending Verification'}
                  </strong>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    IT Act Sec 10A Compliance
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Pending Policies Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    स्वीकृति हेतु लंबित नीतियां (Mandatory Pending Policies)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    संगठन के अधिकृत सदस्य के रूप में सक्रिय रहने हेतु निम्नलिखित नीतियों को पढ़ना व स्वीकार करना अनिवार्य है।
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  {legalStatus.pendingCount} Pending
                </span>
              </div>

              {legalStatus.pendingDocuments && legalStatus.pendingDocuments.length > 0 ? (
                <div className="space-y-4">
                  {legalStatus.pendingDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-5 rounded-2xl bg-slate-950/80 border border-rose-900/50 hover:border-rose-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            Action Pending
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Category: {doc.category || 'Member'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Version {doc.version || 1}.0
                          </span>
                        </div>
                        <h5 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                          {doc.title}
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                          {doc.summary || 'संगठन नियमावली, सदस्यता आचार संहिता और विधिक अनुपालन नियम।'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                        <Link
                          href={`/legal/${doc.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                          title="Open policy in new tab to read full details"
                        >
                          <span>नीति पढ़ें (Read Policy)</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenReviewPolicy(doc)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-red-950/40"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>समीक्षा करें व स्वीकारें</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">सभी अनिवार्य नीतियां स्वीकृत हैं!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    आपके खाते से संबंधित कोई भी कानूनी अथवा सदस्यता नीति लंबित नहीं है।
                  </p>
                </div>
              )}
            </div>

            {/* 2. Accepted Policies History Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    स्वीकृत नीतियां एवं ऑडिट लॉग (Signed & Accepted Policies)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    आपके द्वारा स्वीकार की गई सदस्यता नीतियां एवं उनके डिजिटल साक्ष्य।
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {legalStatus.acceptedCount} Signed
                </span>
              </div>

              {legalStatus.acceptedDocuments && legalStatus.acceptedDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {legalStatus.acceptedDocuments.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <h6 className="text-xs font-bold text-white">
                            {item.document?.title || item.acceptance?.documentTitle}
                          </h6>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Accepted on:{' '}
                          {item.acceptance?.acceptedAt
                            ? new Date(item.acceptance.acceptedAt).toLocaleDateString('hi-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Verified'}
                        </p>
                        <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 inline-block">
                          Version {item.document?.version || item.acceptance?.versionNumber || 1}.0 • Fully Compliant
                        </span>
                      </div>

                      <Link
                        href={`/legal/${item.document?.slug || item.acceptance?.documentSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  अभी तक कोई स्वीकृति दर्ज नहीं की गई है।
                </p>
              )}
            </div>

            {/* 3. General Public Policies Links */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                All Portal Public Policies (सार्वजनिक नीतियां एवं दिशानिर्देश)
              </h5>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  { name: 'Membership Policy', slug: 'membership-policy' },
                  { name: 'Member Code of Conduct', slug: 'member-code-of-conduct' },
                  { name: 'ID Card Usage Policy', slug: 'id-card-usage-policy' },
                  { name: 'Privacy Policy', slug: 'privacy-policy' },
                  { name: 'Terms & Conditions', slug: 'terms-and-conditions' },
                  { name: 'Grievance Redressal', slug: 'grievance-redressal' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href={`/legal/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & SECURITY */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left: Profile Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Member Profile Information
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                {/* Profile Picture Card with Upload */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70">
                  <label className="block font-bold text-slate-300 mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 shrink-0 bg-slate-900 shadow-sm">
                      <img
                        src={getMediaUrl(editForm.photo || user.photo)}
                        alt={editForm.name || user.name}
                        className="w-full h-full object-cover"
                      />
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Upload your recent photo. Max size 10MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300">
                      Bio / Statement <span className="text-[10px] text-amber-400 font-normal">(Markdown Supported)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreviewBioMarkdown(!previewBioMarkdown)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      {previewBioMarkdown ? 'Edit Bio' : 'Preview Bio'}
                    </button>
                  </div>

                  {previewBioMarkdown ? (
                    <div className="w-full min-h-[100px] p-3 bg-slate-950 border border-slate-700 rounded-lg text-white">
                      {editForm.bio ? (
                        <MarkdownView content={editForm.bio} isDark={true} />
                      ) : (
                        <span className="text-slate-500 italic text-xs">No bio entered yet.</span>
                      )}
                    </div>
                  ) : (
                    <textarea
                      rows={4}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Short bio regarding your community engagement (Markdown formatted with **bold**, - bullet points, etc.)..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  {profileLoading ? 'Saving...' : 'Update Details'}
                </button>
              </form>
            </div>

            {/* Right: Change Password */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Change Password
              </h3>

              {passwordMsg.text && (
                <div
                  className={`p-3 rounded-lg text-xs font-bold mb-4 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showMemberPasswords ? 'text' : 'password'}
                      name="currentPassword"
                      autoComplete="current-password"
                      required
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, currentPassword: e.target.value })
                      }
                      className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPasswords(!showMemberPasswords)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                      title={showMemberPasswords ? 'Hide passwords' : 'View passwords'}
                    >
                      {showMemberPasswords ? (
                        <EyeOff className="w-4 h-4 text-red-400" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showMemberPasswords ? 'text' : 'password'}
                      name="newPassword"
                      autoComplete="new-password"
                      required
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPasswords(!showMemberPasswords)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                      title={showMemberPasswords ? 'Hide passwords' : 'View passwords'}
                    >
                      {showMemberPasswords ? (
                        <EyeOff className="w-4 h-4 text-red-400" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showMemberPasswords ? 'text' : 'password'}
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                      className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPasswords(!showMemberPasswords)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                      title={showMemberPasswords ? 'Hide passwords' : 'View passwords'}
                    >
                      {showMemberPasswords ? (
                        <EyeOff className="w-4 h-4 text-red-400" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Review & Accept Legal Document */}
        {reviewingPolicyDoc && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border-2 border-red-600/80 rounded-2xl w-full max-w-3xl text-white max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-fade-in">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      Mandatory Policy Agreement
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Version {reviewingPolicyDoc.version || 1}.0
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {reviewingPolicyDoc.category || 'Member'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {reviewingPolicyDoc.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    सीमांचल एक्सप्रेस सदस्यता एवं विधिक नीति समीक्षा
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingPolicyDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-300 text-xs sm:text-sm">
                {/* External Read Link Bar */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      पूर्ण नीति दस्तावेज़ पढ़ें (Read Full Policy Document)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      आप इसे नए टैब में पूरा विस्तार से पढ़ सकते हैं:
                    </span>
                  </div>
                  <Link
                    href={`/legal/${reviewingPolicyDoc.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                  >
                    <span>/legal/{reviewingPolicyDoc.slug}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {reviewingPolicyDoc.summary && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-red-400 block mb-1">दस्तावेज़ सारांश (Summary):</strong>
                    {reviewingPolicyDoc.summary}
                  </div>
                )}

                {/* Markdown Content */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 max-h-72 overflow-y-auto text-xs leading-relaxed">
                  {reviewingPolicyDoc.content ? (
                    <MarkdownView content={reviewingPolicyDoc.content} isDark={true} />
                  ) : reviewingPolicyDoc.loadingContent ? (
                    <div className="py-8 text-center text-slate-500 animate-pulse">
                      Loading full policy text...
                    </div>
                  ) : (
                    <p className="text-slate-400">
                      विस्तृत नीति पढ़ने के लिए कृपया ऊपर दिए गए लिंक पर क्लिक करें।
                    </p>
                  )}
                </div>

                {/* Digital Acceptance Declaration */}
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/60 text-[11px] text-slate-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    मैं (<strong className="text-white">{user?.name || 'सदस्य'}</strong>) घोषणा करता हूँ कि मैंने <strong className="text-red-400">"{reviewingPolicyDoc.title}"</strong> को ध्यानपूर्वक पढ़ व समझ लिया है। मैं संगठन के अधिकृत सदस्य के रूप में इसके सभी नियमों, आचार संहिता और विधिक शर्तों का निष्ठापूर्वक पालन करने हेतु अपनी डिजिटल स्वीकृति देता हूँ।
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setReviewingPolicyDoc(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  बंद करें (Close)
                </button>
                <button
                  type="button"
                  disabled={policyAcceptLoading}
                  onClick={() => handleAcceptPolicy(reviewingPolicyDoc._id)}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-red-950/60 flex items-center gap-2 disabled:opacity-50"
                >
                  {policyAcceptLoading ? (
                    'स्वीकृति दर्ज हो रही है...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>मैं स्वीकार करता हूँ (I Agree & Accept Policy)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
