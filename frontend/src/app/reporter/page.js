'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Newspaper,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Eye,
  EyeOff,
  MapPin,
  LogOut,
  Send,
  Video,
  Image as ImageIcon,
  ExternalLink,
  User,
  Lock,
  RotateCcw,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  Search,
  Camera,
  Edit3,
  Trash2,
  Upload,
  AlertCircle,
  Scale,
  Heart,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import {
  setMySubmissions,
  addSubmission,
  updateSubmission,
  removeSubmission,
  setReporterLoading,
} from '../../store/slices/reporterSlice';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';
import MarkdownView from '../../components/common/MarkdownView';
import DigitalIdCard from '../../components/documents/DigitalIdCard';
import AppointmentLetter from '../../components/documents/AppointmentLetter';
import LegalAgreementAcceptanceModal from '../../components/legal/LegalAgreementAcceptanceModal';
import applyWatermarkToImage, { VideoWatermarkBadge } from '../../lib/watermarkHelper';

export default function ReporterDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth();
  const { mySubmissions, loading: submissionsLoading } = useSelector((state) => state.reporter);

  const isReporterRejected = user?.reporterStatus === 'rejected' || user?.status === 'rejected';
  const isReporterSuspended = user?.reporterStatus === 'suspended' || user?.status === 'suspended';
  const isReporterPending = (user?.status === 'pending' || user?.reporterStatus === 'pending') && !isReporterRejected && !isReporterSuspended;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'submit', 'my-reports', 'press-card', 'appointment-letter', 'account-security'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Documents state
  const [idCardData, setIdCardData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [fetchingDocs, setFetchingDocs] = useState(false);

  // New Story Form State
  const [newsForm, setNewsForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    categories: [],
    location: '',
    content: '',
    thumbnail: '',
    videoUrl: '',
    tags: '',
    watermarkPhoto: true,
    watermarkVideo: true,
    policyAccepted: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingEditVideo, setUploadingEditVideo] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);

  // Edit Report Modal State (for pending/rejected stories)
  const [editingReport, setEditingReport] = useState(null);
  const [editReportForm, setEditReportForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    categories: [],
    location: '',
    content: '',
    thumbnail: '',
    videoUrl: '',
    tags: '',
    watermarkPhoto: true,
    watermarkVideo: true,
    policyAccepted: true,
  });
  const [editReportSubmitting, setEditReportSubmitting] = useState(false);
  const [editPreviewMarkdown, setEditPreviewMarkdown] = useState(false);

  // Filter & Search on My Reports
  const [reportsFilter, setReportsFilter] = useState('all'); // 'all', 'published', 'pending', 'rejected'
  const [reportsSearch, setReportsSearch] = useState('');
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  // Password Change Form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showReporterPasswords, setShowReporterPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    photo: '',
    bio: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [watermarkLogo, setWatermarkLogo] = useState('');

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

  // Access control
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'reporter' && user?.role !== 'admin'))) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Load initial data
  const loadReporterData = async () => {
    if (!user) return;
    dispatch(setReporterLoading(true));

    try {
      const [subRes, catRes, settingsRes] = await Promise.allSettled([
        api.get('/news/reporter/my-submissions'),
        api.get('/categories'),
        api.get('/settings'),
      ]);

      if (subRes.status === 'fulfilled' && subRes.value.data?.success) {
        dispatch(setMySubmissions(subRes.value.data.news));
      }
      if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
        setCategories(catRes.value.data.categories);
        if (catRes.value.data.categories.length > 0) {
          setNewsForm((prev) => ({
            ...prev,
            category: prev.category || catRes.value.data.categories[0]._id,
          }));
        }
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.settings) {
        setWatermarkLogo(settingsRes.value.data.settings.credentials?.watermarkLogo || '');
      }
    } catch (err) {
      console.error('Reporter data load error:', err);
    } finally {
      dispatch(setReporterLoading(false));
    }
  };

  useEffect(() => {
    if (user && (user.role === 'reporter' || user.role === 'admin')) {
      loadReporterData();
      fetchLegalStatus();
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        photo: user.photo || '',
        bio: user.bio || '',
      });
      setNewsForm((prev) => ({
        ...prev,
        location: user.assignedLocation || 'Kishanganj, Bihar',
      }));
    }
  }, [user]);

  // Load credentials documents
  const fetchDocuments = async () => {
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
    } catch (e) {
      console.error('Doc load error:', e);
    } finally {
      setFetchingDocs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'press-card' || activeTab === 'appointment-letter') {
      if (!idCardData || !appointmentData) {
        fetchDocuments();
      }
    }
  }, [activeTab]);

  // Submit news story
  const handleSubmitNews = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitSuccess(false);

    if (!newsForm.title.trim()) {
      setFormError('Please enter a headline for the report.');
      return;
    }
    if (!newsForm.content.trim()) {
      setFormError('Please enter the report body content.');
      return;
    }
    const cats = Array.isArray(newsForm.categories) && newsForm.categories.length > 0
      ? newsForm.categories
      : (newsForm.category ? [newsForm.category] : (categories[0]?._id ? [categories[0]._id] : []));

    if (cats.length === 0) {
      setFormError('Please select at least one news category.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: newsForm.title.trim(),
        subtitle: newsForm.subtitle.trim(),
        category: cats[0],
        categories: cats,
        location: newsForm.location.trim() || user?.assignedLocation || 'Seemanchal',
        content: newsForm.content.trim(),
        thumbnail:
          newsForm.thumbnail.trim() ||
          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80',
        videoUrl: newsForm.videoUrl.trim(),
        tags: newsForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        watermarkPhoto: Boolean(newsForm.watermarkPhoto),
        watermarkVideo: Boolean(newsForm.watermarkVideo),
        hasWatermark: Boolean(newsForm.watermarkPhoto || newsForm.watermarkVideo),
        policyAccepted: Boolean(newsForm.policyAccepted),
      };

      const res = await api.post('/news', payload);
      if (res.data.success) {
        dispatch(addSubmission(res.data.news));
        setSubmitSuccess(true);
        // Refresh compliance status since submission may record content-submission-guidelines acceptance
        fetchLegalStatus();
        setNewsForm({
          title: '',
          subtitle: '',
          category: categories[0]?._id || '',
          categories: [],
          location: user?.assignedLocation || 'Kishanganj, Bihar',
          content: '',
          thumbnail: '',
          videoUrl: '',
          tags: '',
          watermarkPhoto: true,
          watermarkVideo: true,
          policyAccepted: true,
        });
        // Switch to my reports tab after 1.5s
        setTimeout(() => {
          setActiveTab('my-reports');
          setSubmitSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Upload image file for report thumbnail (creation or editing)
  const handleNewsImageUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      let finalFile = file;
      const shouldWatermark = isEdit ? editReportForm.watermarkPhoto : newsForm.watermarkPhoto;
      if (shouldWatermark) {
        finalFile = await applyWatermarkToImage(file, watermarkLogo);
      }
      const data = new FormData();
      data.append('file', finalFile);
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const fileUrl = res.data.fileUrl || res.data.url;
        if (isEdit) {
          setEditReportForm((prev) => ({ ...prev, thumbnail: fileUrl }));
        } else {
          setNewsForm((prev) => ({ ...prev, thumbnail: fileUrl }));
        }
      }
    } catch (err) {
      alert('Photo upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload video file for report (creation or editing)
  const handleNewsVideoUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      alert('Video file is too large. Maximum allowed size is 200MB.');
      return;
    }

    if (isEdit) {
      setUploadingEditVideo(true);
    } else {
      setUploadingVideo(true);
    }

    const data = new FormData();
    data.append('video', file);

    try {
      const res = await api.post('/upload/video', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        if (isEdit) {
          setEditReportForm((prev) => ({ ...prev, videoUrl: res.data.fileUrl }));
        } else {
          setNewsForm((prev) => ({ ...prev, videoUrl: res.data.fileUrl }));
        }
      } else {
        alert(res.data.message || 'Video upload failed');
      }
    } catch (err) {
      console.error('Reporter video upload error:', err);
      alert('Video upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      if (isEdit) {
        setUploadingEditVideo(false);
      } else {
        setUploadingVideo(false);
      }
    }
  };

  // Quick Markdown tag inserter
  const insertMarkdownTag = (tagType, isEdit = false) => {
    const setForm = isEdit ? setEditReportForm : setNewsForm;
    let snippet = '';
    if (tagType === 'h2') snippet = '\n\n## Main Section Heading\n';
    if (tagType === 'h3' || tagType === 'heading') snippet = '\n\n### Dateline Section Heading\n';
    if (tagType === 'bold') snippet = '**Bold Headline** ';
    if (tagType === 'italic') snippet = '*Italic Emphasis* ';
    if (tagType === 'quote') snippet = '\n> "Official quote or eyewitness testimony..."\n';
    if (tagType === 'bullet') snippet = '\n- Key development point 1\n- Key development point 2\n';
    if (tagType === 'link') snippet = ' [Link Title](https://example.com) ';

    setForm((prev) => ({
      ...prev,
      content: (prev.content || '') + snippet,
    }));
  };

  // Submit edit of pending or rejected report
  const handleEditReportSubmit = async (e) => {
    e.preventDefault();
    if (!editingReport) return;
    setEditReportSubmitting(true);
    try {
      const cats = Array.isArray(editReportForm.categories) && editReportForm.categories.length > 0
        ? editReportForm.categories
        : (editReportForm.category ? [editReportForm.category] : []);

      const payload = {
        title: editReportForm.title.trim(),
        subtitle: editReportForm.subtitle.trim(),
        category: cats[0] || editReportForm.category,
        categories: cats,
        location: editReportForm.location.trim() || user?.assignedLocation || 'Seemanchal',
        content: editReportForm.content.trim(),
        thumbnail: editReportForm.thumbnail.trim(),
        videoUrl: editReportForm.videoUrl.trim(),
        tags: editReportForm.tags
          ? editReportForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        watermarkPhoto: Boolean(editReportForm.watermarkPhoto),
        watermarkVideo: Boolean(editReportForm.watermarkVideo),
        hasWatermark: Boolean(editReportForm.watermarkPhoto || editReportForm.watermarkVideo),
      };
      const res = await api.put(`/news/${editingReport._id}`, payload);
      if (res.data.success) {
        dispatch(updateSubmission(res.data.news));
        alert('Report updated and resubmitted for editorial review!');
        setEditingReport(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setEditReportSubmitting(false);
    }
  };

  // Delete pending or rejected report
  const handleDeleteReport = async (storyId) => {
    if (!confirm('Are you sure you want to delete this draft / report?')) return;
    try {
      const res = await api.delete(`/news/${storyId}`);
      if (res.data.success) {
        dispatch(removeSubmission(storyId));
        alert('Report deleted successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report.');
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
      setPasswordMsg({ text: 'New password and confirmation do not match.', type: 'error' });
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
        text: err.response?.data?.message || 'Error updating password. Verify current password.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      if (res.data.success) {
        alert('Profile details updated successfully!');
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Upload & update reporter profile photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, photo: reader.result }));
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
        setProfileForm((prev) => ({ ...prev, photo: uploadedUrl }));
        const profileRes = await api.put('/auth/profile', { photo: uploadedUrl });
        if (profileRes.data.success && refreshUser) {
          refreshUser();
        }
      }
    } catch (err) {
      console.error('Reporter photo upload error:', err);
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Submissions stats
  const totalSubmissions = mySubmissions.length;
  const publishedCount = mySubmissions.filter((s) => s.status === 'published').length;
  const pendingCount = mySubmissions.filter((s) => s.status === 'pending').length;
  const totalViews = mySubmissions.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Filtered reports for My Reports tab
  const filteredReports = mySubmissions.filter((s) => {
    if (reportsFilter !== 'all' && s.status !== reportsFilter) return false;
    if (reportsSearch) {
      const q = reportsSearch.toLowerCase();
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchCat = s.categoryName?.toLowerCase().includes(q);
      const matchLoc = s.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchLoc) return false;
    }
    return true;
  });

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

      {/* 2. Reporter Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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

          {/* Reporter Profile Badge */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-700 border-2 border-amber-500 shrink-0">
                <img
                  src={getMediaUrl(user.photo)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-white truncate">{user.name}</h3>
                <span className="text-[11px] text-amber-400 font-medium block truncate">
                  {user.assignedDesignation || 'Accredited Reporter'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {user.idCardNumber || 'Press ID Pending'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/60 text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {user.assignedLocation || 'Bihar'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.status === 'approved'
                  ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/60'
                  : 'bg-amber-900/60 text-amber-400 border border-amber-700/60'
                  }`}
              >
                {user.status === 'approved' ? 'Accredited' : 'Pending'}
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
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('submit');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'submit'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Submit News Story</span>
              </span>
              {isReporterRejected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                  Denied
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('my-reports');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'my-reports'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4" />
                <span>My Reports & Stories</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'my-reports'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-800 text-slate-400'
                  }`}
              >
                {totalSubmissions}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('press-card');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'press-card'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>Digital Press ID Card</span>
              </span>
              {isReporterRejected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                  Denied
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('appointment-letter');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'appointment-letter'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Appointment Letter</span>
              </span>
              {isReporterRejected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">
                  Denied
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('compliance');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'compliance'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
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
                setActiveTab('account-security');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'account-security'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
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
            <span>View Public News Site</span>
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

      {/* 3. Main Content View Area */}
      <main className="flex-1 min-h-screen overflow-y-auto p-4 sm:p-8">
        {/* Mandatory Legal Agreement Acceptance Modal */}
        <LegalAgreementAcceptanceModal
          token={typeof window !== 'undefined' ? localStorage.getItem('token') : null}
          userRole="reporter"
          onAllAccepted={() => { }}
        />

        {/* Reporter Rejection Banner - Access & Actions Denied */}
        {isReporterRejected && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-2 border-red-600 text-red-200 shadow-2xl">
            <div className="flex items-center gap-3 text-lg font-black text-white">
              <XCircle className="w-6 h-6 text-red-400 shrink-0" />
              संवाददाता आवेदन अस्वीकृत (Application Rejected) - Access &amp; Actions Denied
            </div>
            <p className="text-xs leading-relaxed text-red-100/90 mt-2">
              केंद्रीय संपादकीय मंडल द्वारा आपका संवाददाता आवेदन अस्वीकृत कर दिया गया है। अस्वीकृति का कारण:{' '}
              <strong className="text-white font-bold">{user?.rejectionReason || 'योग्यता मापदंड / सत्यापन में विसंगति'}</strong>।
              संपादकीय आचार संहिता के तहत नई खबरें भेजने (News Submission), डिजिटल प्रेस आईडी कार्ड (Press ID Card) और नियुक्ति पत्र (Appointment Letter) के सभी अधिकार अवरुद्ध (Denied/Blocked) हैं।
            </p>
          </div>
        )}

        {/* Reporter Pending Application Banner */}
        {isReporterPending && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/80 border border-amber-600/80 text-amber-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs leading-relaxed">
              आपका संवाददाता आवेदन अभी <strong>प्रशासनिक समीक्षा (Under Review)</strong> में है। अनुमोदन (Approval) के पश्चात आपकी प्रेस आईडी कार्ड एवं समाचार सबमिशन सक्रिय हो जाएगा।
            </p>
          </div>
        )}

        {/* Reporter Suspension Banner */}
        {isReporterSuspended && (
          <div className="mb-6 p-5 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-200 space-y-2 shadow-2xl">
            <div className="flex items-center gap-2 text-base font-black text-white">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Reporter Privileges Suspended
            </div>
            <p className="text-xs leading-relaxed text-red-200">
              Your press correspondent privileges have been suspended by the central administration. Reason:{' '}
              <strong className="text-white">{user?.suspensionReason || 'Under administrative review'}</strong>.
              New news story submissions are temporarily blocked. All previously submitted and published news articles remain fully preserved.
            </p>
          </div>
        )}

        {/* Top Header Inside Main Content */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
              Field Journalism Console
            </span>
            <h2 className="text-2xl font-black text-white">
              {activeTab === 'overview' && 'Bureau Overview & Activity'}
              {activeTab === 'submit' && 'Submit Field Report / News'}
              {activeTab === 'my-reports' && 'My Submitted Reports'}
              {activeTab === 'press-card' && 'Digital Press Accreditation Card'}
              {activeTab === 'appointment-letter' && 'Official Press Appointment Letter'}
              {activeTab === 'compliance' && 'Policies & Editorial Compliance'}
              {activeTab === 'account-security' && 'Account Profile & Security'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('submit')}
              disabled={isReporterRejected || isReporterPending}
              className={`px-4 py-2 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-lg transition-transform ${isReporterRejected || isReporterPending
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                : 'px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 active:scale-95'
                }`}
              title={
                isReporterRejected
                  ? 'Action Denied: Application Rejected'
                  : isReporterPending
                    ? 'Action Blocked: Application Under Review'
                    : 'File New Report'
              }
            >
              <PlusCircle className="w-4 h-4" /> File New Report
            </button>
            <button
              onClick={() => {
                loadReporterData();
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
          <div className="space-y-8">
            {/* Urgent Legal & Editorial Policy Compliance Alert */}
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
                          {legalStatus.pendingCount} Mandatory Policies / Agreements Awaiting Your Acceptance
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white mt-1">
                        सीमांचल एक्सप्रेस पोर्टल की नीतियां स्वीकृति के लिए लंबित हैं
                      </h4>
                      <p className="text-xs text-rose-100/90 mt-1 max-w-2xl leading-relaxed">
                        नमस्कार {user?.name || 'संवाददाता'} जी, पोर्टल पर आपकी <strong>{legalStatus.pendingCount}</strong> विधिक व संपादकीय नीतियां लंबित हैं। कृपया नीचे दिए गए लिंक से इन्हें पढ़ें और स्वीकार करें।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('compliance')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 shrink-0 flex items-center gap-2"
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
                          v{doc.version || 1}.0 • {doc.category || 'Editorial'}
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
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black rounded-lg transition-colors shadow-sm"
                        >
                          स्वीकारें
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Policies Summary in Overview */}
            {legalStatus.acceptedDocuments && legalStatus.acceptedDocuments.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Accepted Policies &amp; Agreements
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {legalStatus.acceptedCount} Signed &amp; Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {legalStatus.acceptedDocuments.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-300 truncate">
                          ✓ {item.document?.title || item.acceptance?.documentTitle}
                        </p>
                        <span className="text-[10px] text-slate-400 block">
                          Accepted:{' '}
                          {item.acceptance?.acceptedAt
                            ? new Date(item.acceptance.acceptedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                            : 'Verified on application'}
                        </span>
                      </div>
                      <Link
                        href={`/legal/${item.document?.slug || item.acceptance?.documentSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title={`View ${item.document?.slug || item.acceptance?.documentSlug}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  Total Stories Filed
                </span>
                <strong className="text-3xl font-black text-white">{totalSubmissions}</strong>
                <span className="text-[10px] text-slate-400 block mt-2">All submitted drafts</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  Published Live
                </span>
                <strong className="text-3xl font-black text-emerald-400">{publishedCount}</strong>
                <span className="text-[10px] text-slate-400 block mt-2">Live on website</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-amber-400 block mb-1">
                  In Editorial Review
                </span>
                <strong className="text-3xl font-black text-amber-400">{pendingCount}</strong>
                <span className="text-[10px] text-slate-400 block mt-2">Awaiting desk approval</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-sky-400 block mb-1">Total Readers</span>
                <strong className="text-3xl font-black text-sky-400">{totalViews}</strong>
                <span className="text-[10px] text-slate-400 block mt-2">Total article reads</span>
              </div>
            </div>

            {/* Quick Submit Banner (Only for approved/active reporters) */}
            {!isReporterRejected && (
              <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-slate-950 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Have a breaking ground story?</h3>
                  <p className="text-xs text-amber-100 mt-1 max-w-xl">
                    Submit ground reports with photographs, video embeds, and local testimonials. Your
                    story will be vetted by the central desk and published live.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('submit')}
                  disabled={isReporterPending}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-60 text-amber-400 font-bold text-xs rounded-xl shadow-lg transition-transform"
                >
                  Start Writing Now →
                </button>
              </div>
            )}

            {/* Reporter Bio Dossier with Markdown */}
            {user.bio && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" /> Press Correspondent Bio & Beats
                </h3>
                <div className="text-slate-200 text-xs sm:text-sm">
                  <MarkdownView content={user.bio} isDark={true} />
                </div>
              </div>
            )}

            {/* Recent Submissions Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white">Recent Field Submissions</h3>
                <button
                  onClick={() => setActiveTab('my-reports')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  View All ({totalSubmissions}) →
                </button>
              </div>

              {mySubmissions.length > 0 ? (
                <div className="space-y-3">
                  {mySubmissions.slice(0, 4).map((story) => (
                    <div
                      key={story._id}
                      className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-slate-700 overflow-hidden shrink-0 relative">
                          <img
                            src={story.thumbnail ? getMediaUrl(story.thumbnail) : '/logo.jpeg'}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                          {story.videoUrl && (
                            <div className="absolute bottom-1 right-1 bg-red-600 text-white p-0.5 rounded shadow text-[8px]">
                              <Video className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(story.categories) && story.categories.length > 0 ? (
                              story.categories.map((c, idx) => (
                                <span key={c._id || idx} className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                  {c.name || c.nameHindi}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                {story.category?.name || story.categoryName || 'News'}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {story.title}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(story.createdAt).toLocaleDateString('en-US')} • {story.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${story.status === 'published'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : story.status === 'pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                        >
                          {story.status === 'published'
                            ? 'Published Live'
                            : story.status === 'pending'
                              ? 'In Review'
                              : 'Declined'}
                        </span>
                        {story.status === 'published' && (
                          <Link
                            href={`/news/${story.slug}`}
                            target="_blank"
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  You haven&apos;t filed any stories yet. Click &ldquo;File New Report&rdquo; to begin.
                </div>
              )}
            </div>

            {/* Mandatory Legal & Editorial Policies Compliance Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Legal & Editorial Policy Compliance (विधिक नीतियां एवं स्वीकृति)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      IT Act 2000 & Press Council of India standards compliance status
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

              {/* Status Breakdown */}
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
                            className="text-[11px] font-bold text-slate-950 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 shadow-sm"
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
          </div>
        )}

        {/* TAB 2: SUBMIT NEWS / FIELD REPORT */}
        {activeTab === 'submit' && (
          isReporterRejected ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">News Submissions Denied</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
                Your reporter accreditation application was rejected by the editorial board ({user?.rejectionReason || 'Application not approved'}). You do not have permission to file news reports.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Return to Dashboard Overview
                </button>
              </div>
            </div>
          ) : (user?.reporterStatus === 'suspended' || user?.status === 'suspended') ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Submissions Temporarily Restricted</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your reporter privileges are currently marked as suspended ({user?.suspensionReason || 'under administrative review'}). You cannot file new stories until reinstated by the Chief Editor.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-reports')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  View My Existing Published Reports
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xl max-w-6xl xl:max-w-7xl mx-auto">
              <div className="border-b border-slate-800 pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">File News Report for Editorial Review</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Field reports are vetted by the central editorial desk and published on the homepage and respective categories.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                  Full-Featured Field Editor
                </span>
              </div>

              {submitSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Report submitted successfully! Redirecting to your submissions...
                </div>
              )}

              {formError && (
                <div className="bg-red-950/80 border border-red-700 text-red-300 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitNews} className="space-y-5 text-xs">
                {/* Title & Subtitle */}
                <div>
                  <label id='title' className="block font-bold text-slate-200 mb-1.5">
                    Report Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    name='title'
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="e.g. Major bridge construction milestone completed across Kishanganj highway..."
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1.5">
                    Subtitle / Summary Lead
                  </label>
                  <input
                    type="text"
                    value={newsForm.subtitle}
                    onChange={(e) => setNewsForm({ ...newsForm, subtitle: e.target.value })}
                    placeholder="A concise 1-2 sentence lead summarizing the core development..."
                    className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* ROW 1: News Categories in Single Row */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-bold text-slate-200 text-xs sm:text-sm">
                      News Categories * <span className="text-xs font-normal text-amber-300">(Select 1 or more / 1 से अधिक श्रेणियां चुनें)</span>
                    </label>
                    <span className="text-xs text-amber-400 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/80">
                      {(newsForm.categories || []).length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-800/80 border border-slate-700 rounded-xl max-h-36 overflow-y-auto">
                    {categories.map((c) => {
                      const isSelected = (newsForm.categories || []).includes(c._id) || (newsForm.categories?.length === 0 && newsForm.category === c._id);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => {
                            const current = (newsForm.categories && newsForm.categories.length > 0)
                              ? newsForm.categories
                              : (newsForm.category ? [newsForm.category] : []);
                            let updated;
                            if (current.includes(c._id)) {
                              updated = current.filter((id) => id !== c._id);
                            } else {
                              updated = [...current, c._id];
                            }
                            setNewsForm({
                              ...newsForm,
                              categories: updated,
                              category: updated[0] || '',
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-1 ring-amber-300 scale-[1.02]'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-800'
                            }`}
                        >
                          <span className="text-[11px] font-bold">{isSelected ? '✓' : '+'}</span>
                          <span>{c.name}</span>
                          {c.nameHindi && <span className="text-[10px] opacity-80">({c.nameHindi})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW 2: Beat Dateline / Reporting Location Full Width */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="block font-bold text-slate-200 mb-1.5 text-xs sm:text-sm">
                    Beat Dateline / Reporting Location * <span className="text-xs font-normal text-slate-400">(e.g. Bahadurganj, Kishanganj, Bihar)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-red-500" />
                    <input
                      type="text"
                      required
                      value={newsForm.location}
                      onChange={(e) => setNewsForm({ ...newsForm, location: e.target.value })}
                      placeholder="e.g. Bahadurganj, Kishanganj, Bihar"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* ROW 3: Photo and Video Upload & Preview in 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Column 1: Featured Photograph */}
                  <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-400" />
                          Featured Photograph
                        </label>
                        <div className="flex items-center gap-2">
                          {newsForm.thumbnail && (
                            <button
                              type="button"
                              onClick={() => setNewsForm((prev) => ({ ...prev, thumbnail: '' }))}
                              className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                              title="Remove photograph"
                            >
                              <X className="w-3 h-3" />
                              <span>Clear</span>
                            </button>
                          )}
                          <label className="cursor-pointer text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                            <Upload className="w-3 h-3" />
                            {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleNewsImageUpload(e, false)}
                            />
                          </label>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={newsForm.thumbnail}
                        onChange={(e) => setNewsForm({ ...newsForm, thumbnail: e.target.value })}
                        placeholder="Upload photo above or paste image URL..."
                        className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                      />

                      {/* Photo Preview */}
                      {newsForm.thumbnail && (
                        <div className="mt-3 relative w-full aspect-video max-h-56 rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-xl">
                          <img
                            src={getMediaUrl(newsForm.thumbnail)}
                            alt="Thumbnail preview"
                            className="w-full h-full object-contain bg-slate-950"
                          />
                          <button
                            type="button"
                            onClick={() => setNewsForm((prev) => ({ ...prev, thumbnail: '' }))}
                            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-600 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-300 border border-white/10 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-amber-400" />
                            <span>Photo Attached</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Watermark Checkbox for Photo */}
                    <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white pt-2 border-t border-slate-800/80">
                      <input
                        type="checkbox"
                        checked={newsForm.watermarkPhoto}
                        onChange={(e) => setNewsForm({ ...newsForm, watermarkPhoto: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-600"
                      />
                      <div>
                        <span className="font-bold text-xs block text-slate-200">फोटो पर वॉटरमार्क जोड़ें (Watermark on Image)</span>
                        <span className="text-[10px] text-slate-400">Apply official channel watermark directly onto image file</span>
                      </div>
                    </label>
                  </div>

                  {/* Column 2: Video Clip */}
                  <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-red-500" />
                          Video Clip
                        </label>
                        <div className="flex items-center gap-2">
                          {newsForm.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setNewsForm((prev) => ({ ...prev, videoUrl: '' }))}
                              className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                              title="Remove video"
                            >
                              <X className="w-3 h-3" />
                              <span>Clear</span>
                            </button>
                          )}
                          <label className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition-all ${uploadingVideo
                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                            : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-800/80 hover:text-white'
                            }`}>
                            <Upload className="w-3 h-3" />
                            {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/mov,video/mkv,video/*"
                              disabled={uploadingVideo}
                              className="hidden"
                              onChange={(e) => handleNewsVideoUpload(e, false)}
                            />
                          </label>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={newsForm.videoUrl}
                        onChange={(e) => setNewsForm({ ...newsForm, videoUrl: e.target.value })}
                        placeholder="Upload video above or paste YouTube / MP4 URL..."
                        className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                      />

                      {/* Video Player Preview with Top-Right Watermark */}
                      {newsForm.videoUrl && (
                        <div className="mt-3 relative w-full aspect-video max-h-56 rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-xl">
                          {newsForm.videoUrl.includes('youtube.com') || newsForm.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={
                                newsForm.videoUrl.includes('watch?v=')
                                  ? newsForm.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                                  : newsForm.videoUrl.includes('youtu.be/')
                                    ? newsForm.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                                    : newsForm.videoUrl
                              }
                              title="Video Preview"
                              className="w-full h-full border-0 pointer-events-none"
                            />
                          ) : (
                            <video
                              src={getMediaUrl(newsForm.videoUrl)}
                              controls
                              className="w-full h-full object-contain"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => setNewsForm((prev) => ({ ...prev, videoUrl: '' }))}
                            className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-600 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                            title="Remove video"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-300 border border-white/10 flex items-center gap-1 pointer-events-none">
                            <Video className="w-3 h-3 text-red-400" />
                            <span>Video Preview</span>
                          </div>

                          {/* Video Watermark Overlay Badge (at Top-Right) */}
                          {newsForm.watermarkVideo && <VideoWatermarkBadge className="top-2.5 right-11" watermarkLogo={watermarkLogo} />}
                        </div>
                      )}
                    </div>

                    {/* Watermark Checkbox for Video */}
                    <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white pt-2 border-t border-slate-800/80">
                      <input
                        type="checkbox"
                        checked={newsForm.watermarkVideo}
                        onChange={(e) => setNewsForm({ ...newsForm, watermarkVideo: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-slate-900 border-slate-600"
                      />
                      <div>
                        <span className="font-bold text-xs block text-slate-200">प्लेयर पर वॉटरमार्क जोड़ें (Watermark on Player)</span>
                        <span className="text-[10px] text-slate-400">Display official broadcast watermark badge at top-right of player</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Body Content with Markdown Toolbar & Live Preview Toggle */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-slate-200 text-xs">
                        Detailed Report Content *
                      </label>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        ({(newsForm.content || '').length} characters)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Quick Markdown tags */}
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('h2', false)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert H2 Main Heading"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('heading', false)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert H3 Subheading"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('bold', false)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert Bold Text"
                      >
                        **B**
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('italic', false)}
                        className="px-2 py-0.5 text-[10px] italic bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert Italic Text"
                      >
                        *I*
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('quote', false)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert Quote"
                      >
                        &gt; Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('bullet', false)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert List"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownTag('link', false)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        title="Insert Link"
                      >
                        Link
                      </button>

                      <div className="border-l border-slate-700 h-4 mx-1 hidden sm:block"></div>

                      {/* Preview Toggle */}
                      <button
                        type="button"
                        onClick={() => setPreviewMarkdown(!previewMarkdown)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${previewMarkdown
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                          }`}
                      >
                        {previewMarkdown ? (
                          <>
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editing Mode</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Live Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {previewMarkdown ? (
                    <div className="w-full min-h-[320px] max-h-[500px] overflow-y-auto p-5 bg-slate-950 border border-amber-500/40 rounded-xl text-white leading-relaxed">
                      {newsForm.content ? (
                        <MarkdownView content={newsForm.content} isDark={true} />
                      ) : (
                        <span className="text-slate-500 italic text-xs">
                          Nothing to preview. Type report content in edit mode.
                        </span>
                      )}
                    </div>
                  ) : (
                    <textarea
                      rows={14}
                      required
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      placeholder="Write the full report here in Markdown format:&#10;&#10;## Main Subheading&#10;Paragraph content with on-the-ground facts, statements by officials, public reactions...&#10;&#10;> Eyewitness statement or quote...&#10;&#10;- Key bullet points..."
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans text-xs"
                    />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-bold text-slate-200 mb-1.5">
                    Tags / Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newsForm.tags}
                    onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                    placeholder="Kishanganj, Infrastructure, Flood, Roadways, Bihar"
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Compliance & Privacy Policy Acceptance */}
                <div className="p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    required
                    checked={newsForm.policyAccepted}
                    onChange={(e) => setNewsForm({ ...newsForm, policyAccepted: e.target.checked })}
                    id="reporterNewsPolicyCheck"
                    className="mt-0.5 w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-600 cursor-pointer"
                  />
                  <label htmlFor="reporterNewsPolicyCheck" className="cursor-pointer leading-relaxed flex-1">
                    I certify that this report, photographs, and video materials comply with the{' '}
                    <a
                      href="/legal/content-submission-guidelines"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-amber-400 hover:text-amber-300 underline font-bold inline-flex items-center gap-1"
                    >
                      Content Submission Guidelines (सामग्री प्रस्तुति दिशानिर्देश) <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and the{' '}
                    <a
                      href="/legal/editorial-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-amber-400 hover:text-amber-300 underline font-bold inline-flex items-center gap-1"
                    >
                      Journalist Guidelines (संपादकीय नीति) <ExternalLink className="w-3 h-3" />
                    </a>.
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting to Desk...' : 'Dispatch Report for Review'}
                  </button>
                </div>
              </form>
            </div>
          )
        )}

        {/* TAB 3: MY REPORTS & SUBMISSIONS */}
        {activeTab === 'my-reports' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {['all', 'published', 'pending', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setReportsFilter(st)}
                      className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors ${reportsFilter === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {st === 'all'
                        ? 'All'
                        : st === 'published'
                          ? 'Published'
                          : st === 'pending'
                            ? 'Under Review'
                            : 'Declined'}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={reportsSearch}
                    onChange={(e) => setReportsSearch(e.target.value)}
                    placeholder="Search by title, category, place..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 w-56 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Total Found: <strong>{filteredReports.length}</strong>
              </div>
            </div>

            {/* Reports list */}
            {filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((story) => {
                  let previewImg = '';
                  if (story.thumbnail) {
                    previewImg = getMediaUrl(story.thumbnail);
                  } else if (story.videoUrl) {
                    if (story.videoUrl.includes('youtu.be/')) {
                      const id = story.videoUrl.split('youtu.be/')[1]?.split('?')[0];
                      if (id) previewImg = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                    } else if (story.videoUrl.includes('watch?v=')) {
                      const id = story.videoUrl.split('watch?v=')[1]?.split('&')[0];
                      if (id) previewImg = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                    } else if (story.videoUrl.includes('embed/')) {
                      const id = story.videoUrl.split('embed/')[1]?.split('?')[0];
                      if (id) previewImg = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                    }
                  }

                  return (
                    <div
                      key={story._id}
                      className="p-5 rounded-2xl border border-slate-800 bg-slate-850/60 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm"
                    >
                      {/* Left: Thumbnail & Story Data */}
                      <div className="flex gap-4 items-start w-full md:w-auto flex-1 min-w-0">
                        {/* Media Preview Thumbnail */}
                        <div
                          onClick={() => setSelectedReportModal(story)}
                          className="w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700/80 relative cursor-pointer group shadow-md"
                          title="Click to view story details"
                        >
                          {previewImg ? (
                            <img
                              src={previewImg}
                              alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 text-[10px]">
                              <ImageIcon className="w-6 h-6 text-slate-600 mb-1" />
                              <span>No Media</span>
                            </div>
                          )}

                          {story.videoUrl && (
                            <div className="absolute top-1.5 left-1.5 bg-red-600/90 text-white px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shadow">
                              <Video className="w-2.5 h-2.5" />
                              <span>Video</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </div>

                        {/* Story Information */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {Array.isArray(story.categories) && story.categories.length > 0 ? (
                              story.categories.map((c, idx) => (
                                <span
                                  key={c._id || idx}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 uppercase border border-amber-800/60"
                                >
                                  {c.name || c.nameHindi || 'News'}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 uppercase border border-amber-800/60">
                                {story.category?.name || story.categoryName || 'News'}
                              </span>
                            )}

                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{story.location}</span>
                            </span>
                          </div>

                          <h4
                            onClick={() => setSelectedReportModal(story)}
                            className="text-sm sm:text-base font-bold text-white line-clamp-2 hover:text-amber-400 cursor-pointer transition-colors"
                          >
                            {story.title}
                          </h4>

                          {story.subtitle && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {story.subtitle}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Filed: {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-sky-400" />
                              {story.views || 0} views
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-400" />
                              {story.likes || 0} likes
                            </span>
                          </div>

                          {/* If declined, show editor reason */}
                          {story.status === 'rejected' && story.rejectionReason && (
                            <div className="mt-2 p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-[11px] text-red-200">
                              <strong className="text-red-400">Editor Feedback:</strong> {story.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right End: Dedicated Single Column for ALL Actions */}
                      <div className="flex flex-col gap-2 shrink-0 w-full md:w-36 pt-3 md:pt-0 md:border-l md:border-slate-800 md:pl-4 justify-center">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-center ${story.status === 'published'
                              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-sm'
                              : story.status === 'pending'
                                ? 'bg-amber-950/90 text-amber-300 border border-amber-700/80 shadow-sm'
                                : 'bg-red-950/90 text-red-300 border border-red-700/80 shadow-sm'
                            }`}
                        >
                          {story.status === 'published'
                            ? '✓ Published'
                            : story.status === 'pending'
                              ? '⏳ Under Review'
                              : '✕ Declined'}
                        </span>

                        {/* View Report Story Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedReportModal(story)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm transition-all cursor-pointer"
                          title="View Full Story & Media Dossier"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Story</span>
                        </button>

                        {/* Live Story Link (if published) */}
                        {story.status === 'published' && (
                          <Link
                            href={`/news/${story.slug}`}
                            target="_blank"
                            className="w-full px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-sky-800 shadow-sm transition-all"
                            title="Open published article live on website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Live</span>
                          </Link>
                        )}

                        {/* Edit & Resubmit Button (if pending or rejected) */}
                        {(story.status === 'pending' || story.status === 'rejected') && (
                          <button
                            type="button"
                            onClick={() => {
                              let initialCategories = [];
                              if (Array.isArray(story.categories) && story.categories.length > 0) {
                                initialCategories = story.categories.map((c) => (typeof c === 'object' && c ? c._id : c)).filter(Boolean);
                              } else if (story.category) {
                                initialCategories = [typeof story.category === 'object' && story.category ? story.category._id : story.category].filter(Boolean);
                              } else if (categories[0]?._id) {
                                initialCategories = [categories[0]._id];
                              }

                              setEditingReport(story);
                              setEditReportForm({
                                title: story.title || '',
                                subtitle: story.subtitle || '',
                                category: initialCategories[0] || '',
                                categories: initialCategories,
                                location: story.location || '',
                                content: story.content || '',
                                thumbnail: story.thumbnail || '',
                                videoUrl: story.videoUrl || '',
                                tags: Array.isArray(story.tags) ? story.tags.join(', ') : '',
                                watermarkPhoto: story.watermarkPhoto !== undefined ? Boolean(story.watermarkPhoto) : (story.hasWatermark !== undefined ? Boolean(story.hasWatermark) : true),
                                watermarkVideo: story.watermarkVideo !== undefined ? Boolean(story.watermarkVideo) : (story.hasWatermark !== undefined ? Boolean(story.hasWatermark) : true),
                              });
                            }}
                            className="w-full px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-800 shadow-sm transition-all cursor-pointer"
                            title="Edit and Update Report"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit & Update</span>
                          </button>
                        )}

                        {/* Delete Button (if pending or rejected) */}
                        {(story.status === 'pending' || story.status === 'rejected') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(story._id)}
                            className="w-full px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-red-800 shadow-sm transition-all cursor-pointer"
                            title="Delete draft/report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No reports matching the selected filter.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIGITAL PRESS ID CARD */}
        {activeTab === 'press-card' && (
          isReporterRejected ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Press Accreditation Denied</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
                Your reporter accreditation application was not approved ({user?.rejectionReason || 'Application rejected by editorial board'}). Official digital press cards are issued exclusively to accredited active journalists.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Return to Dashboard Overview
                </button>
              </div>
            </div>
          ) : isReporterPending ? (
            <div className="bg-slate-900 border border-amber-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-700 text-amber-400 mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Press Accreditation Pending Approval</h3>
              <p className="text-xs text-amber-300 max-w-md mx-auto leading-relaxed">
                Your reporter accreditation application is currently under editorial desk verification. Your digital press card with dynamic verification QR will become accessible once approved.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
              <div className="text-center mb-6 max-w-md">
                <h3 className="text-lg font-black text-white">Press Accreditation Identity Card</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Official field press credential issued by Seemanchal Express Editorial Board with secure QR verification.
                </p>
              </div>

              {fetchingDocs ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Generating press credential...</p>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <DigitalIdCard cardData={idCardData || user} />
                </div>
              )}
            </div>
          )
        )}

        {/* TAB 5: APPOINTMENT LETTER */}
        {activeTab === 'appointment-letter' && (
          isReporterRejected ? (
            <div className="bg-slate-900 border border-red-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 mx-auto flex items-center justify-center">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Appointment Letter Denied</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
                Authorized letters of engagement are not granted to rejected applicants. Contact the editorial desk if you believe this was an error.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Return to Dashboard Overview
                </button>
              </div>
            </div>
          ) : isReporterPending ? (
            <div className="bg-slate-900 border border-amber-800/80 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-700 text-amber-400 mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Appointment Letter Pending Approval</h3>
              <p className="text-xs text-amber-300 max-w-md mx-auto leading-relaxed">
                Your official letter of correspondent engagement will be issued once the central editorial board approves your credentials.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
              <div className="text-center mb-6 max-w-md">
                <h3 className="text-lg font-black text-white">Official Press Appointment Letter</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authorized letter of engagement confirming correspondent authorization across assigned beats.
                </p>
              </div>

              {fetchingDocs ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Loading appointment letter...</p>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <AppointmentLetter appointmentData={appointmentData || user} />
                </div>
              )}
            </div>
          )
        )}

        {/* TAB: LEGAL & EDITORIAL POLICIES COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Compliance Status Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${legalStatus.pendingCount === 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                      }`}
                  >
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                      Legal & Editorial Governance
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Policies & Agreements Compliance Console
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      पत्रकारिता संहिता, संपादकीय नीतियां एवं डिजिटल प्रेस अनुबंध
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
                    className={`text-2xl font-black ${legalStatus.pendingCount > 0 ? 'text-rose-500' : 'text-slate-400'
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
                  <span className="text-xs font-bold text-slate-400 block mb-1">Credential Status</span>
                  <strong className="text-2xl font-black text-amber-400">
                    {legalStatus.pendingCount === 0 ? 'Active & Good Standing' : 'Pending Verification'}
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
                    सीमांचल एक्सप्रेस के अधिकृत रिपोर्टर के रूप में कार्य करने हेतु निम्नलिखित दस्तावेजों को पढ़ना और स्वीकार करना अनिवार्य है।
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
                            Category: {doc.category || 'Editorial'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Version {doc.version || 1}.0
                          </span>
                        </div>
                        <h5 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {doc.title}
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                          {doc.summary || 'पत्रकारिता दिशानिर्देश, सत्यता सत्यापन और नैतिक रिपोर्टिंग के लिए निर्धारित नियम।'}
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
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-amber-950/40"
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
                    आपके खाते से संबंधित कोई भी कानूनी अथवा संपादकीय नीति लंबित नहीं है।
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
                    आपके द्वारा स्वीकार की गई विधिक नीतियां एवं उनके डिजिटल साक्ष्य।
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
                  { name: 'Editorial Policy', slug: 'editorial-policy' },
                  { name: 'Correction Policy', slug: 'correction-policy' },
                  { name: 'Reporter Agreement', slug: 'reporter-agreement' },
                  { name: 'Reporter Code of Conduct', slug: 'reporter-code-of-conduct' },
                  { name: 'Content Submission Guidelines', slug: 'content-submission-guidelines' },
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

        {/* TAB 6: ACCOUNT PROFILE & SECURITY */}
        {activeTab === 'account-security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left: Profile Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Reporter Profile Details
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                {/* Press Profile Photo Card with Upload */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70">
                  <label className="block font-bold text-slate-300 mb-2">Press Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 bg-slate-900 shadow-sm">
                      <img
                        src={getMediaUrl(profileForm.photo || user.photo)}
                        alt={profileForm.name || user.name}
                        className="w-full h-full object-cover"
                      />
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm">
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
                        Format: JPG, PNG, WebP. Used for official Press ID card.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Reporter Bio <span className="text-[10px] text-amber-400 font-normal">(Markdown Supported)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Brief background on your reporting beats and field investigative work (Markdown supported with **bold**, - bullet points, etc.)..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {profileLoading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Right: Security & Password */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Change Password & Security
              </h3>

              {passwordMsg.text && (
                <div
                  className={`p-3 rounded-lg text-xs font-bold mb-4 ${passwordMsg.type === 'success'
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
                      type={showReporterPasswords ? 'text' : 'password'}
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
                      onClick={() => setShowReporterPasswords(!showReporterPasswords)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                      title={showReporterPasswords ? 'Hide passwords' : 'View passwords'}
                    >
                      {showReporterPasswords ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
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
                      type={showReporterPasswords ? 'text' : 'password'}
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
                      onClick={() => setShowReporterPasswords(!showReporterPasswords)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                      title={showReporterPasswords ? 'Hide passwords' : 'View passwords'}
                    >
                      {showReporterPasswords ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
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
                      type={showReporterPasswords ? 'text' : 'password'}
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
                      onClick={() => setShowReporterPasswords(!showReporterPasswords)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                      title={showReporterPasswords ? 'Hide passwords' : 'View passwords'}
                    >
                      {showReporterPasswords ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
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

        {/* MODAL: Edit Report & Resubmit - Full-Screen Spacious */}
        {editingReport && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl xl:max-w-7xl max-h-[94vh] sm:max-h-[96vh] h-full flex flex-col text-white shadow-2xl overflow-hidden">
              {/* Sticky Modal Header */}
              <div className="flex items-start justify-between gap-4 px-5 sm:px-8 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 z-10">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 uppercase">
                    Edit &amp; Resubmit Field Report
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    Edit Field Report: {editReportForm.title || editingReport.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update report details, body markdown, or photo. Resubmission will be placed into the editorial queue.
                  </p>
                </div>
                <button
                  onClick={() => setEditingReport(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleEditReportSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 text-xs flex flex-col">
                <div className="space-y-4">
                  {editingReport.status === 'rejected' && editingReport.rejectionReason && (
                    <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200">
                      <strong className="text-red-300 block mb-0.5">Editor Feedback to Address:</strong>
                      {editingReport.rejectionReason}
                    </div>
                  )}

                  {/* Headline & Subtitle */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Headline / Title *</label>
                    <input
                      type="text"
                      required
                      value={editReportForm.title}
                      onChange={(e) => setEditReportForm({ ...editReportForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Subtitle / Summary Lead</label>
                    <input
                      type="text"
                      value={editReportForm.subtitle}
                      onChange={(e) => setEditReportForm({ ...editReportForm, subtitle: e.target.value })}
                      placeholder="Concise 1-2 sentence lead summarizing the story..."
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* ROW 1: News Categories in Single Row */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-bold text-slate-200 text-xs sm:text-sm">
                        News Categories * <span className="text-xs font-normal text-amber-300">(Select 1 or more / 1 से अधिक श्रेणियां चुनें)</span>
                      </label>
                      <span className="text-xs text-amber-400 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/80">
                        {(editReportForm.categories || []).length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-800 border border-slate-700 rounded-xl max-h-36 overflow-y-auto">
                      {categories.map((c) => {
                        const isSelected = (editReportForm.categories || []).includes(c._id) || (editReportForm.categories?.length === 0 && editReportForm.category === c._id);
                        return (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => {
                              const current = (editReportForm.categories && editReportForm.categories.length > 0)
                                ? editReportForm.categories
                                : (editReportForm.category ? [editReportForm.category] : []);
                              let updated;
                              if (current.includes(c._id)) {
                                updated = current.filter((id) => id !== c._id);
                              } else {
                                updated = [...current, c._id];
                              }
                              setEditReportForm({
                                ...editReportForm,
                                categories: updated,
                                category: updated[0] || '',
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-1 ring-amber-300 scale-[1.02]'
                              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-800'
                              }`}
                          >
                            <span className="text-[11px] font-bold">{isSelected ? '✓' : '+'}</span>
                            <span>{c.name}</span>
                            {c.nameHindi && <span className="text-[10px] opacity-80">({c.nameHindi})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROW 2: Beat Dateline / Reporting Location Full Width */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <label className="block font-bold text-slate-200 mb-1.5 text-xs sm:text-sm">
                      Beat Dateline / Reporting Location * <span className="text-xs font-normal text-slate-400">(e.g. Bahadurganj, Kishanganj, Bihar)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-red-500" />
                      <input
                        type="text"
                        required
                        value={editReportForm.location}
                        onChange={(e) => setEditReportForm({ ...editReportForm, location: e.target.value })}
                        placeholder="e.g. Bahadurganj, Kishanganj, Bihar"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* ROW 3: Photo and Video Upload & Preview in 2 Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Column 1: Featured Photograph */}
                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-amber-400" /> Featured Photograph
                          </label>
                          <div className="flex items-center gap-2">
                            {editReportForm.thumbnail && (
                              <button
                                type="button"
                                onClick={() => setEditReportForm((prev) => ({ ...prev, thumbnail: '' }))}
                                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                                title="Remove photograph"
                              >
                                <X className="w-3 h-3" />
                                <span>Clear</span>
                              </button>
                            )}
                            <label className="cursor-pointer text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                              <Upload className="w-3 h-3" />
                              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleNewsImageUpload(e, true)}
                              />
                            </label>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={editReportForm.thumbnail}
                          onChange={(e) => setEditReportForm({ ...editReportForm, thumbnail: e.target.value })}
                          placeholder="Upload or paste image URL..."
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                        />

                        {/* Photo Preview */}
                        {editReportForm.thumbnail && (
                          <div className="mt-3 relative w-full aspect-video max-h-56 rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-xl">
                            <img
                              src={getMediaUrl(editReportForm.thumbnail)}
                              alt="Thumbnail preview"
                              className="w-full h-full object-contain bg-slate-950"
                            />
                            <button
                              type="button"
                              onClick={() => setEditReportForm((prev) => ({ ...prev, thumbnail: '' }))}
                              className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-600 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-300 border border-white/10 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-amber-400" />
                              <span>Photo Attached</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Watermark Checkbox for Photo */}
                      <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white pt-2 border-t border-slate-800/80">
                        <input
                          type="checkbox"
                          checked={editReportForm.watermarkPhoto}
                          onChange={(e) => setEditReportForm({ ...editReportForm, watermarkPhoto: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-600"
                        />
                        <div>
                          <span className="font-bold text-xs block text-slate-200">फोटो पर वॉटरमार्क जोड़ें (Watermark on Image)</span>
                          <span className="text-[10px] text-slate-400">Apply official channel watermark directly onto image file</span>
                        </div>
                      </label>
                    </div>

                    {/* Column 2: Video Clip */}
                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-red-500" /> Video Clip
                          </label>
                          <div className="flex items-center gap-2">
                            {editReportForm.videoUrl && (
                              <button
                                type="button"
                                onClick={() => setEditReportForm((prev) => ({ ...prev, videoUrl: '' }))}
                                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                                title="Remove video"
                              >
                                <X className="w-3 h-3" />
                                <span>Clear</span>
                              </button>
                            )}
                            <label className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition-all ${uploadingEditVideo
                              ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                              : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-800/80 hover:text-white'
                              }`}>
                              <Upload className="w-3 h-3" />
                              {uploadingEditVideo ? 'Uploading...' : 'Upload Video'}
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/mov,video/mkv,video/*"
                                disabled={uploadingEditVideo}
                                className="hidden"
                                onChange={(e) => handleNewsVideoUpload(e, true)}
                              />
                            </label>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={editReportForm.videoUrl}
                          onChange={(e) => setEditReportForm({ ...editReportForm, videoUrl: e.target.value })}
                          placeholder="Upload video above or paste YouTube / MP4 URL..."
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                        />

                        {/* Video Player Preview with Top-Right Watermark */}
                        {editReportForm.videoUrl && (
                          <div className="mt-3 relative w-full aspect-video max-h-56 rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-xl">
                            {editReportForm.videoUrl.includes('youtube.com') || editReportForm.videoUrl.includes('youtu.be') ? (
                              <iframe
                                src={
                                  editReportForm.videoUrl.includes('watch?v=')
                                    ? editReportForm.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                                    : editReportForm.videoUrl.includes('youtu.be/')
                                      ? editReportForm.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                                      : editReportForm.videoUrl
                                }
                                title="Video Preview"
                                className="w-full h-full border-0 pointer-events-none"
                              />
                            ) : (
                              <video
                                src={getMediaUrl(editReportForm.videoUrl)}
                                controls
                                className="w-full h-full object-contain"
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => setEditReportForm((prev) => ({ ...prev, videoUrl: '' }))}
                              className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-600 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                              title="Remove video"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-300 border border-white/10 flex items-center gap-1 pointer-events-none">
                              <Video className="w-3 h-3 text-red-400" />
                              <span>Video Preview</span>
                            </div>

                            {/* Video Watermark Overlay Badge (at Top-Right) */}
                            {editReportForm.watermarkVideo && <VideoWatermarkBadge className="top-2.5 right-11" watermarkLogo={watermarkLogo} />}
                          </div>
                        )}
                      </div>

                      {/* Watermark Checkbox for Video */}
                      <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white pt-2 border-t border-slate-800/80">
                        <input
                          type="checkbox"
                          checked={editReportForm.watermarkVideo}
                          onChange={(e) => setEditReportForm({ ...editReportForm, watermarkVideo: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-slate-900 border-slate-600"
                        />
                        <div>
                          <span className="font-bold text-xs block text-slate-200">प्लेयर पर वॉटरमार्क जोड़ें (Watermark on Player)</span>
                          <span className="text-[10px] text-slate-400">Display official broadcast watermark badge at top-right of player</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Body Content with Markdown Toolbar & Live Preview Toggle */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800">
                      <label className="font-bold text-slate-300">Detailed Report Body (Markdown Supported) *</label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('h2', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert H2 Main Heading"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('heading', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert H3 Subheading"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('bold', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Bold Text"
                        >
                          **B**
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('italic', true)}
                          className="px-2 py-0.5 text-[10px] italic bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Italic Text"
                        >
                          *I*
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('quote', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Quote"
                        >
                          &gt; Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('bullet', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownTag('link', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Link"
                        >
                          Link
                        </button>

                        <div className="border-l border-slate-700 h-4 mx-1 hidden sm:block"></div>

                        <button
                          type="button"
                          onClick={() => setEditPreviewMarkdown(!editPreviewMarkdown)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${editPreviewMarkdown
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                            }`}
                        >
                          {editPreviewMarkdown ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editing Mode</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Live Preview</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {editPreviewMarkdown ? (
                      <div className="w-full min-h-[300px] max-h-[480px] overflow-y-auto p-5 bg-slate-950 border border-amber-500/40 rounded-xl text-white leading-relaxed">
                        {editReportForm.content ? (
                          <MarkdownView content={editReportForm.content} isDark={true} />
                        ) : (
                          <span className="text-slate-500 italic text-xs">No body content</span>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows={14}
                        required
                        value={editReportForm.content}
                        onChange={(e) => setEditReportForm({ ...editReportForm, content: e.target.value })}
                        placeholder="Write the full report here in Markdown format..."
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-sans leading-relaxed focus:outline-none focus:border-amber-500 text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 mt-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editReportSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {editReportSubmitting ? 'Updating...' : 'Save & Resubmit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Reporter View Own Submission Details with Markdown */}
        {selectedReportModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl xl:max-w-6xl max-h-[94vh] sm:max-h-[96vh] h-full flex flex-col text-white shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between gap-4 px-5 sm:px-8 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 z-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {Array.isArray(selectedReportModal.categories) && selectedReportModal.categories.length > 0 ? (
                      selectedReportModal.categories.map((c, idx) => (
                        <span key={c._id || idx} className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider bg-amber-500 text-slate-950">
                          {c.name || c.nameHindi || 'News'}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider bg-amber-500 text-slate-950">
                        {selectedReportModal.category?.name || selectedReportModal.categoryName || 'News Story'}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${selectedReportModal.status === 'published'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : selectedReportModal.status === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                    >
                      {selectedReportModal.status === 'published' ? 'Published Live' : selectedReportModal.status}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {selectedReportModal.title}
                  </h3>
                  {selectedReportModal.subtitle && (
                    <p className="text-xs text-slate-400 mt-1 italic border-l-2 border-amber-500 pl-2">
                      {selectedReportModal.subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedReportModal(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner / Feedback */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                {selectedReportModal.status === 'rejected' && selectedReportModal.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200">
                    <strong className="text-red-300 block mb-1">Editorial Desk Feedback:</strong>
                    {selectedReportModal.rejectionReason}
                  </div>
                )}

                {/* Media Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedReportModal.thumbnail && (
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                      <img
                        src={getMediaUrl(selectedReportModal.thumbnail)}
                        alt={selectedReportModal.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  {selectedReportModal.videoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video relative flex items-center justify-center">
                      {selectedReportModal.videoUrl.includes('youtube.com') || selectedReportModal.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={
                            selectedReportModal.videoUrl.includes('watch?v=')
                              ? selectedReportModal.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                              : selectedReportModal.videoUrl.includes('youtu.be/')
                                ? selectedReportModal.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                                : selectedReportModal.videoUrl
                          }
                          title="Report Video"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={getMediaUrl(selectedReportModal.videoUrl)}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}
                      {(selectedReportModal.watermarkVideo || selectedReportModal.hasWatermark) && (
                        <VideoWatermarkBadge className="top-2.5 right-2.5" watermarkLogo={watermarkLogo} />
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                      <Video className="w-8 h-8 text-slate-600 mb-1" />
                      <span>No Video Attached</span>
                    </div>
                  )}
                </div>

                {/* Detailed Report Content (Markdown) */}
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-700">
                    Detailed Report Content (Markdown Formatted)
                  </h4>
                  <div className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                    <MarkdownView content={selectedReportModal.content} isDark={true} />
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-8 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/95 shrink-0">
                <span className="text-xs text-slate-400">
                  Dateline: {selectedReportModal.location} • Views: {selectedReportModal.views || 0}
                </span>
                <button
                  onClick={() => setSelectedReportModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Review & Accept Legal Document */}
        {reviewingPolicyDoc && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl w-full max-w-3xl text-white max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-fade-in">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Mandatory Agreement
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Version {reviewingPolicyDoc.version || 1}.0
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {reviewingPolicyDoc.category || 'Editorial'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {reviewingPolicyDoc.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    सीमांचल एक्सप्रेस संपादकीय एवं विधिक नीति समीक्षा
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
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                  >
                    <span>/legal/{reviewingPolicyDoc.slug}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {reviewingPolicyDoc.summary && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-400 block mb-1">दस्तावेज़ सारांश (Summary):</strong>
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
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/60 text-[11px] text-slate-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    मैं (<strong className="text-white">{user?.name || 'संवाददाता'}</strong>) घोषणा करता हूँ कि मैंने <strong className="text-amber-400">"{reviewingPolicyDoc.title}"</strong> को ध्यानपूर्वक पढ़ व समझ लिया है। मैं पोर्टल के संवाददाता के रूप में इसके सभी नियमों, आचार संहिता और विधिक शर्तों का निष्ठापूर्वक पालन करने हेतु अपनी डिजिटल स्वीकृति देता हूँ।
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
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-950/60 flex items-center gap-2 disabled:opacity-50"
                >
                  {policyAcceptLoading ? (
                    'स्वीकृति दर्ज हो रही है...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
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
