'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Shield,
  Users,
  FileCheck,
  Newspaper,
  Award,
  Layers,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Trash2,
  Edit,
  Edit3,
  Upload,
  Eye,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  MapPin,
  ExternalLink,
  Printer,
  FolderPlus,
  UserCheck,
  UserX,
  Lock,
  LogOut,
  Menu,
  Video,
  Phone,
  Mail,
  Flame,
  Calendar,
  Sparkles,
  History,
  EyeOff,
  BarChart3,
  ChevronDown,
  ImageIcon,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import {
  setStats,
  setApplications,
  updateApplicationStatus,
  setUsers,
  updateUserItem,
  setPositions,
  setAdminCategories,
  setAdminNewsList,
  updateNewsItem,
  removeNewsItem,
  setInquiries,
  removeInquiryItem,
  setActiveAdminTab,
  setAdminLoading,
  setActionLoading,
  setAdminError,
} from '../../store/slices/adminSlice';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';
import MarkdownView from '../../components/common/MarkdownView';
import DigitalIdCard from '../../components/documents/DigitalIdCard';
import AppointmentLetter from '../../components/documents/AppointmentLetter';
import LegalDocumentsSection from '../../components/admin/LegalDocumentsSection';
import ReporterManagementSection from '../../components/admin/ReporterManagementSection';
import MembershipManagementSection from '../../components/admin/MembershipManagementSection';
import ComplaintsDeskSection from '../../components/admin/ComplaintsDeskSection';
import AdminActivityLogsSection from '../../components/admin/AdminActivityLogsSection';
import SiteSettingsSection from '../../components/admin/SiteSettingsSection';
import AnalyticsDashboardGraphs from '../../components/admin/AnalyticsDashboardGraphs';
import AdminDashboardSkeleton from '../../components/admin/AdminDashboardSkeleton';
import applyWatermarkToImage, { VideoWatermarkBadge } from '../../lib/watermarkHelper';

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading, isAdmin, logout } = useAuth();
  const {
    stats,
    applications,
    users,
    positions,
    categories,
    newsList,
    inquiries,
    activeAdminTab,
    loading,
    actionLoading,
  } = useSelector((state) => state.admin);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Application Filter & Search states
  const [appRoleFilter, setAppRoleFilter] = useState('all'); // 'all', 'member', 'reporter'
  const [appStatusFilter, setAppStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [appSearch, setAppSearch] = useState('');

  // Members & Team Filter & Search states
  const [memberTierFilter, setMemberTierFilter] = useState('all');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');

  // Approval Modal State
  const [approvalModalUser, setApprovalModalUser] = useState(null);
  const [inspectApplicantModal, setInspectApplicantModal] = useState(null);
  const [approvalForm, setApprovalForm] = useState({
    assignedDesignation: '',
    committeeLevel: 'District',
    assignedLocation: '',
    showOnTeamPage: true,
    validYears: 2,
  });

  // Rejection Modal State
  const [rejectionModalUser, setRejectionModalUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Edit Member Modal State
  const [editMemberModalUser, setEditMemberModalUser] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState({
    assignedDesignation: '',
    committeeLevel: 'District',
    assignedLocation: '',
    showOnTeamPage: true,
  });

  // Document Preview Modals State
  const [viewIdCardUser, setViewIdCardUser] = useState(null);
  const [viewLetterUser, setViewLetterUser] = useState(null);

  // Add Position Modal State
  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [positionForm, setPositionForm] = useState({
    title: '',
    committeeLevel: 'District',
    committeeName: 'C. District Executive Committee',
    maxSeats: '1',
    order: 10,
  });

  // Add Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameHindi: '',
    slug: '',
    description: '',
    order: 1,
  });

  // Video & Image Upload States
  const [videoUploading, setVideoUploading] = useState(false);
  const [editVideoUploading, setEditVideoUploading] = useState(false);
  const [newsImageUploading, setNewsImageUploading] = useState(false);
  const [activeMemberActionMenu, setActiveMemberActionMenu] = useState(null);

  // Add News Modal State
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newNewsPreview, setNewNewsPreview] = useState(false);
  const [newNewsForm, setNewNewsForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    categories: [],
    content: '',
    thumbnail: '',
    videoUrl: '',
    location: 'New Delhi HQ',
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    watermarkPhoto: false,
    watermarkVideo: false,
    policyAccepted: true,
    tags: '',
  });

  // Edit News Modal State (Edition & Submission)
  const [editingNewsStory, setEditingNewsStory] = useState(null);
  const [editNewsForm, setEditNewsForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    categories: [],
    content: '',
    thumbnail: '',
    videoUrl: '',
    location: '',
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    watermarkPhoto: true,
    watermarkVideo: true,
    policyAccepted: true,
    tags: '',
  });
  const [editNewsSubmitting, setEditNewsSubmitting] = useState(false);
  const [editNewsUploading, setEditNewsUploading] = useState(false);
  const [editNewsPreview, setEditNewsPreview] = useState(false);

  // View Report Modal State & News Filters
  const [viewReportModalStory, setViewReportModalStory] = useState(null);
  const [newsFilterStatus, setNewsFilterStatus] = useState('all'); // 'all', 'published', 'pending', 'rejected'
  const [newsSearch, setNewsSearch] = useState('');

  // Password Change State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showAdminPasswords, setShowAdminPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  // Access Control: Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, isAdmin, router]);

  // Load all initial admin data
  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    dispatch(setAdminLoading(true));

    try {
      const [statsRes, appsRes, usersRes, posRes, catRes, newsRes, inqRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/applications?status=pending'),
        api.get('/admin/users'),
        api.get('/positions'),
        api.get('/categories'),
        api.get('/admin/news'),
        api.get('/contact'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        dispatch(setStats(statsRes.value.data.stats));
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.data.success) {
        dispatch(setApplications(appsRes.value.data.applications));
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
        dispatch(setUsers(usersRes.value.data.users));
      }
      if (posRes.status === 'fulfilled' && posRes.value.data.success) {
        dispatch(setPositions(posRes.value.data.positions));
      }
      if (catRes.status === 'fulfilled' && catRes.value.data.success) {
        dispatch(setAdminCategories(catRes.value.data.categories));
        if (catRes.value.data.categories.length > 0) {
          setNewNewsForm((prev) => ({ ...prev, category: catRes.value.data.categories[0]._id }));
        }
      }
      if (newsRes.status === 'fulfilled' && newsRes.value.data.success) {
        dispatch(setAdminNewsList(newsRes.value.data.news));
      }
      if (inqRes.status === 'fulfilled' && inqRes.value.data.success) {
        dispatch(setInquiries(inqRes.value.data.inquiries));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      dispatch(setAdminLoading(false));
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  // Reload applications when filter or search changes
  const fetchFilteredApplications = async () => {
    try {
      let url = `/admin/applications?status=${appStatusFilter}`;
      if (appRoleFilter !== 'all') url += `&role=${appRoleFilter}`;
      if (appSearch) url += `&search=${encodeURIComponent(appSearch)}`;
      const res = await api.get(url);
      if (res.data.success) {
        dispatch(setApplications(res.data.applications));
      }
    } catch (err) {
      console.error('App filter error:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      const delayDebounce = setTimeout(() => {
        fetchFilteredApplications();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [appStatusFilter, appRoleFilter, appSearch]);

  // Open Approval Modal
  const openApproveModal = (applicant) => {
    setApprovalModalUser(applicant);
    const isReporter = applicant.role === 'reporter';
    const defaultLevel = isReporter ? 'Press' : 'District';
    const defaultDesignation = isReporter
      ? 'Reporter / Correspondent'
      : 'District Executive Member';

    setApprovalForm({
      committeeLevel: defaultLevel,
      assignedDesignation: defaultDesignation,
      assignedLocation:
        applicant.reportingAreaPreference ||
        (applicant.address?.district ? `${applicant.address.district}, Bihar` : 'Seemanchal Region'),
      showOnTeamPage: true,
      validYears: 2,
    });
  };

  // Submit Approval
  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approvalModalUser) return;
    dispatch(setActionLoading(true));

    try {
      const res = await api.post(`/admin/applications/${approvalModalUser._id}/approve`, approvalForm);
      if (res.data.success) {
        dispatch(
          updateApplicationStatus({
            id: approvalModalUser._id,
            updatedUser: res.data.user,
          })
        );
        setApprovalModalUser(null);
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        if (statsRes.data.success) dispatch(setStats(statsRes.data.stats));
        if (usersRes.data.success) dispatch(setUsers(usersRes.data.users));
        alert(res.data.message || 'Application approved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving application.');
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  // Submit Rejection
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionModalUser) return;
    dispatch(setActionLoading(true));

    try {
      const res = await api.post(`/admin/applications/${rejectionModalUser._id}/reject`, {
        reason: rejectionReason,
      });
      if (res.data.success) {
        dispatch(
          updateApplicationStatus({
            id: rejectionModalUser._id,
            updatedUser: res.data.user,
          })
        );
        setRejectionModalUser(null);
        setRejectionReason('');
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        if (statsRes.data.success) dispatch(setStats(statsRes.data.stats));
        if (usersRes.data.success) dispatch(setUsers(usersRes.data.users));
        alert('Application declined.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting application.');
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  // Quick Toggle "Show on Team Page"
  const handleToggleTeamDisplay = async (targetUser) => {
    try {
      const updatedValue = !targetUser.showOnTeamPage;
      const res = await api.put(`/admin/users/${targetUser._id}`, {
        showOnTeamPage: updatedValue,
      });
      if (res.data.success) {
        const updatedList = users.map((u) =>
          u._id === targetUser._id ? { ...u, showOnTeamPage: updatedValue } : u
        );
        dispatch(setUsers(updatedList));
      }
    } catch (err) {
      alert('Failed to update team page visibility.');
    }
  };

  // Open Edit Member Modal
  const openEditMemberModal = (m) => {
    setEditMemberModalUser(m);
    setEditMemberForm({
      assignedDesignation: m.assignedDesignation || '',
      committeeLevel: m.committeeLevel || 'District',
      assignedLocation: m.assignedLocation || '',
      showOnTeamPage: Boolean(m.showOnTeamPage),
    });
  };

  // Submit Edit Member Assignment
  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    if (!editMemberModalUser) return;
    dispatch(setActionLoading(true));

    try {
      const res = await api.put(`/admin/users/${editMemberModalUser._id}`, editMemberForm);
      if (res.data.success) {
        const updatedList = users.map((u) =>
          u._id === editMemberModalUser._id ? res.data.user : u
        );
        dispatch(setUsers(updatedList));
        setEditMemberModalUser(null);
        alert('Member assignment updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        const updatedList = users.filter((u) => u._id !== userId);
        dispatch(setUsers(updatedList));
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) dispatch(setStats(statsRes.data.stats));
        alert('User removed.');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Add Custom Position
  const handleAddPositionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/positions', positionForm);
      if (res.data.success) {
        setShowAddPositionModal(false);
        const posRes = await api.get('/positions');
        if (posRes.data.success) dispatch(setPositions(posRes.data.positions));
        setPositionForm({
          title: '',
          committeeLevel: 'District',
          committeeName: 'C. District Executive Committee',
          maxSeats: '1',
          order: 10,
        });
        alert('Position added successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add position');
    }
  };

  // Delete Position
  const handleDeletePosition = async (posId) => {
    if (!confirm('Are you sure you want to delete this position?')) return;
    try {
      const res = await api.delete(`/positions/${posId}`);
      if (res.data.success) {
        const posRes = await api.get('/positions');
        if (posRes.data.success) dispatch(setPositions(posRes.data.positions));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Reset Default Positions
  const handleResetDefaultPositions = async () => {
    if (
      !confirm(
        'Do you want to reset all positions to the official sanctioned committee hierarchy (Tiers A to F and Press)?'
      )
    )
      return;
    try {
      const res = await api.post('/positions/reset-defaults');
      if (res.data.success) {
        dispatch(setPositions(res.data.positions));
        alert('Default sanctioned committees and positions restored!');
      }
    } catch (err) {
      alert('Reset failed');
    }
  };

  // Add News Category
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', categoryForm);
      if (res.data.success) {
        setShowAddCategoryModal(false);
        const catRes = await api.get('/categories');
        if (catRes.data.success) dispatch(setAdminCategories(catRes.data.categories));
        setCategoryForm({
          name: '',
          nameHindi: '',
          slug: '',
          description: '',
          order: 1,
        });
        alert('Category created successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        const catRes = await api.get('/categories');
        if (catRes.data.success) dispatch(setAdminCategories(catRes.data.categories));
      }
    } catch (err) {
      alert('Delete category failed');
    }
  };

  // Open Edit Category
  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      nameHindi: cat.nameHindi || '',
      slug: cat.slug || '',
      description: cat.description || '',
      order: cat.order ?? 1,
    });
  };

  // Save Edit Category
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await api.put(`/categories/${editingCategory._id}`, categoryForm);
      if (res.data.success) {
        setEditingCategory(null);
        const catRes = await api.get('/categories');
        if (catRes.data.success) dispatch(setAdminCategories(catRes.data.categories));
        alert('Category updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  // Video File Upload Handler
  const handleVideoUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      alert('Video file is too large. Maximum allowed size is 200MB.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    if (isEdit) {
      setEditVideoUploading(true);
    } else {
      setVideoUploading(true);
    }

    try {
      const res = await api.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        if (isEdit) {
          setEditNewsForm((prev) => ({ ...prev, videoUrl: res.data.fileUrl }));
        } else {
          setNewNewsForm((prev) => ({ ...prev, videoUrl: res.data.fileUrl }));
        }
      } else {
        alert(res.data.message || 'Failed to upload video');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload video');
    } finally {
      if (isEdit) {
        setEditVideoUploading(false);
      } else {
        setVideoUploading(false);
      }
    }
  };

  // Change News Status
  const handleUpdateNewsStatus = async (newsId, status) => {
    try {
      const res = await api.put(`/admin/news/${newsId}/status`, { status });
      if (res.data.success) {
        const newsRes = await api.get('/admin/news');
        if (newsRes.data.success) {
          dispatch(setAdminNewsList(newsRes.data.news));
          if (viewReportModalStory && viewReportModalStory._id === newsId) {
            const updated = newsRes.data.news.find((n) => n._id === newsId);
            if (updated) setViewReportModalStory(updated);
          }
        }
      }
    } catch (err) {
      alert('Status update failed');
    }
  };

  // Toggle News Flags (isBreaking, isFeatured)
  const handleToggleNewsFlag = async (newsId, field, currentValue) => {
    try {
      const res = await api.put(`/admin/news/${newsId}/status`, { [field]: !currentValue });
      if (res.data.success) {
        const newsRes = await api.get('/admin/news');
        if (newsRes.data.success) {
          dispatch(setAdminNewsList(newsRes.data.news));
          if (viewReportModalStory && viewReportModalStory._id === newsId) {
            const updated = newsRes.data.news.find((n) => n._id === newsId);
            if (updated) setViewReportModalStory(updated);
          }
        }
      }
    } catch (err) {
      alert('Failed to update article flag');
    }
  };

  // Delete News
  const handleDeleteNews = async (newsId) => {
    if (!confirm('Are you sure you want to permanently delete this news story?')) return;
    try {
      const res = await api.delete(`/news/${newsId}`);
      if (res.data.success) {
        if (viewReportModalStory && viewReportModalStory._id === newsId) {
          setViewReportModalStory(null);
        }
        const newsRes = await api.get('/admin/news');
        if (newsRes.data.success) dispatch(setAdminNewsList(newsRes.data.news));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Publish Admin Article
  const handleAddNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      const cats = Array.isArray(newNewsForm.categories) && newNewsForm.categories.length > 0
        ? newNewsForm.categories
        : (newNewsForm.category ? [newNewsForm.category] : (categories[0]?._id ? [categories[0]._id] : []));

      const payload = {
        ...newNewsForm,
        categories: cats,
        category: cats[0] || newNewsForm.category,
        tags: typeof newNewsForm.tags === 'string'
          ? newNewsForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : newNewsForm.tags,
      };
      const res = await api.post('/news', payload);
      if (res.data.success) {
        setShowAddNewsModal(false);
        const newsRes = await api.get('/admin/news');
        if (newsRes.data.success) dispatch(setAdminNewsList(newsRes.data.news));
        setNewNewsForm({
          title: '',
          subtitle: '',
          category: categories[0]?._id || '',
          categories: [],
          content: '',
          thumbnail: '',
          videoUrl: '',
          location: 'New Delhi HQ',
          isBreaking: false,
          isFeatured: false,
          isTrending: false,
          tags: '',
        });
        setNewNewsPreview(false);
        alert('Article published live on the website!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed');
    }
  };

  // Quick Markdown tag inserter for Admin News modals
  const insertNewsMarkdownTag = (tagType, isEdit = false) => {
    const setForm = isEdit ? setEditNewsForm : setNewNewsForm;
    let snippet = '';
    if (tagType === 'h2') snippet = '\n\n## Main Section Heading\n';
    if (tagType === 'h3') snippet = '\n\n### Subheading / Dateline Point\n';
    if (tagType === 'bold') snippet = '**Bold Headline** ';
    if (tagType === 'italic') snippet = '*Italic Emphasis* ';
    if (tagType === 'quote') snippet = '\n> "Official quotation or witness statement..."\n';
    if (tagType === 'bullet') snippet = '\n- Key development point 1\n- Key development point 2\n';
    if (tagType === 'link') snippet = ' [Link Title](https://example.com) ';

    setForm((prev) => ({
      ...prev,
      content: (prev.content || '') + snippet,
    }));
  };

  // Open Edit News Story Modal
  const openEditNewsModal = (story) => {
    setEditingNewsStory(story);
    let initialCategories = [];
    if (Array.isArray(story.categories) && story.categories.length > 0) {
      initialCategories = story.categories.map((c) => (typeof c === 'object' && c ? c._id : c)).filter(Boolean);
    } else if (story.category) {
      initialCategories = [typeof story.category === 'object' && story.category ? story.category._id : story.category].filter(Boolean);
    } else if (categories[0]?._id) {
      initialCategories = [categories[0]._id];
    }

    setEditNewsForm({
      title: story.title || '',
      subtitle: story.subtitle || '',
      category: initialCategories[0] || '',
      categories: initialCategories,
      content: story.content || '',
      thumbnail: story.thumbnail || '',
      videoUrl: story.videoUrl || '',
      location: story.location || 'New Delhi HQ',
      isBreaking: Boolean(story.isBreaking),
      isFeatured: Boolean(story.isFeatured),
      isTrending: Boolean(story.isTrending),
      watermarkPhoto: story.watermarkPhoto !== undefined ? Boolean(story.watermarkPhoto) : Boolean(story.hasWatermark),
      watermarkVideo: story.watermarkVideo !== undefined ? Boolean(story.watermarkVideo) : Boolean(story.hasWatermark),
      policyAccepted: story.policyAccepted !== undefined ? Boolean(story.policyAccepted) : true,
      tags: Array.isArray(story.tags) ? story.tags.join(', ') : story.tags || '',
    });
    setEditNewsPreview(false);
  };

  // Submit Edited News Story (Edition & Submission)
  const handleEditNewsSubmit = async (e) => {
    e.preventDefault();
    if (!editingNewsStory) return;
    setEditNewsSubmitting(true);
    try {
      const cats = Array.isArray(editNewsForm.categories) && editNewsForm.categories.length > 0
        ? editNewsForm.categories
        : (editNewsForm.category ? [editNewsForm.category] : []);

      const payload = {
        ...editNewsForm,
        categories: cats,
        category: cats[0] || editNewsForm.category,
        tags: typeof editNewsForm.tags === 'string'
          ? editNewsForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : editNewsForm.tags,
      };
      const res = await api.put(`/news/${editingNewsStory._id}`, payload);
      if (res.data.success) {
        dispatch(updateNewsItem(res.data.news));
        const newsRes = await api.get('/admin/news');
        if (newsRes.data.success) dispatch(setAdminNewsList(newsRes.data.news));
        if (viewReportModalStory && viewReportModalStory._id === editingNewsStory._id) {
          setViewReportModalStory(res.data.news);
        }
        setEditingNewsStory(null);
        alert('News story updated and saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update story');
    } finally {
      setEditNewsSubmitting(false);
    }
  };

  // Upload Image for Publish News Form (with Watermark support)
  const handleNewsImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsImageUploading(true);
    try {
      let finalFile = file;
      if (newNewsForm.watermarkPhoto) {
        finalFile = await applyWatermarkToImage(file);
      }
      const formData = new FormData();
      formData.append('file', finalFile);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const fileUrl = res.data.fileUrl || res.data.url;
        setNewNewsForm((prev) => ({ ...prev, thumbnail: fileUrl }));
      } else {
        alert(res.data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Image upload failed');
    } finally {
      setNewsImageUploading(false);
    }
  };

  // Remove Designation for Member
  const handleRemoveMemberDesignation = async (m) => {
    if (!confirm(`Are you sure you want to remove the designation "${m.assignedDesignation || 'Assigned Title'}" from ${m.name}?`)) {
      return;
    }
    try {
      const res = await api.put(`/admin/users/${m._id}`, { assignedDesignation: '' });
      if (res.data.success) {
        dispatch(updateUserItem(res.data.user));
        alert(`Designation removed for ${m.name}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove designation');
    }
  };

  // Upload Image for Edit Story Form
  const handleEditNewsImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditNewsUploading(true);
    try {
      let finalFile = file;
      if (editNewsForm.watermarkPhoto) {
        finalFile = await applyWatermarkToImage(file);
      }
      const formData = new FormData();
      formData.append('file', finalFile);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const fileUrl = res.data.fileUrl || res.data.url;
        setEditNewsForm((prev) => ({ ...prev, thumbnail: fileUrl }));
      }
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setEditNewsUploading(false);
    }
  };

  // Admin Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
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
        text: err.response?.data?.message || 'Failed to update password. Check current password.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // 1. While authentication is verifying OR while initial admin data is loading:
  if (authLoading || (user && user.role === 'admin' && loading && !stats.totalReporters && !users.length)) {
    return <AdminDashboardSkeleton />;
  }

  // 2. If finished loading and user is not authenticated or not admin:
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700/80 text-red-500 flex items-center justify-center mb-4 shadow-2xl">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Admin Access Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          You need active administrator credentials to access the Seemanchal Express central governance desk.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign in as Administrator</span>
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Filter positions by selected committee level in modal
  const filteredPositions = positions.filter(
    (p) => p.committeeLevel === approvalForm.committeeLevel
  );

  // Filter approved members & reporters for the "Manage Members & Team" tab
  const filteredMembers = users.filter((u) => {
    if (u.role === 'admin') return false;
    if (memberRoleFilter !== 'all' && u.role !== memberRoleFilter) return false;
    if (memberTierFilter !== 'all' && u.committeeLevel !== memberTierFilter) return false;
    if (memberSearch) {
      const q = memberSearch.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchId = u.idCardNumber?.toLowerCase().includes(q);
      const matchDesignation = u.assignedDesignation?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchId && !matchDesignation) return false;
    }
    return true;
  });

  // Filter news reports for the "Editorial & Submissions" tab
  const filteredNewsList = newsList.filter((story) => {
    if (newsFilterStatus !== 'all' && story.status !== newsFilterStatus) return false;
    if (newsSearch) {
      const q = newsSearch.toLowerCase();
      const matchTitle = story.title?.toLowerCase().includes(q);
      const matchAuthor = story.authorName?.toLowerCase().includes(q);
      const matchCat = story.category?.name?.toLowerCase().includes(q);
      const matchLoc = story.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchCat && !matchLoc) return false;
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

      {/* 2. Admin Sidebar */}
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

          {/* Admin Identity Badge */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center font-bold text-sm shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-white truncate">{user.name}</h3>
              <span className="text-[10px] text-red-400 font-bold block uppercase">
                Administrator
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {user.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => {
                dispatch(setActiveAdminTab('analytics'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'analytics' || activeAdminTab === 'overview'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Dashboard Analytics</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-sky-500/20 text-sky-300 font-mono">
                Graphs
              </span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('applications'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'applications'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4" />
                <span>Application Reviews</span>
              </span>
              {stats.totalPendingApplications > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950">
                  {stats.totalPendingApplications}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('reporters'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'reporters'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Reporter Management</span>
              </span>
              {stats.suspendedReporters > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-red-950 text-red-400 border border-red-800">
                  {stats.suspendedReporters} susp
                </span>
              )}
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('membership'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'membership'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Membership Control</span>
              </span>
              {stats.expiredMemberships > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  {stats.expiredMemberships} exp
                </span>
              )}
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('complaints'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'complaints'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Grievances & Complaints</span>
              </span>
              {stats.pendingComplaints > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-600 text-white animate-pulse">
                  {stats.pendingComplaints}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('legal'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'legal'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>Legal Documents</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                {stats.totalLegalDocs || 15}
              </span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('news'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'news'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4" />
                <span>Editorial & Submissions</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                {newsList.length}
              </span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('members'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'members'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Team & Public Directory</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                {users.filter((u) => u.role !== 'admin').length}
              </span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('categories'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'categories'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>News Categories</span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('positions'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'positions'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>Committee Positions</span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('inquiries'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'inquiries'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Public Inquiries</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                {inquiries.length}
              </span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('activity'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'activity'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <History className="w-4 h-4 text-sky-400" />
              <span>Activity Audit Logs</span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('settings'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'settings'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Seal, Signature & Settings</span>
            </button>

            <button
              onClick={() => {
                dispatch(setActiveAdminTab('security'));
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'security'
                ? 'bg-red-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Security</span>
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

      {/* 3. Main Content View Area */}
      <main className="flex-1 min-h-screen overflow-y-auto p-3">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-0.5">
              Central Administration
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {(activeAdminTab === 'analytics' || activeAdminTab === 'overview') && 'Dashboard Analytics & Operational Intelligence'}
              {activeAdminTab === 'applications' && 'Applicant Reviews & Credential Issuance'}
              {activeAdminTab === 'reporters' && 'Press Reporter Management & Bureau Status'}
              {activeAdminTab === 'membership' && 'Membership Control & Expiry Governance'}
              {activeAdminTab === 'complaints' && 'Grievance Redressal & Editorial Complaints Desk'}
              {activeAdminTab === 'legal' && 'Legal Documents & Guidelines Management'}
              {activeAdminTab === 'members' && 'Member Management & Public Team Directory'}
              {activeAdminTab === 'news' && 'Editorial Publishing & Reporter Moderation'}
              {activeAdminTab === 'categories' && 'News Categories & Hierarchy'}
              {activeAdminTab === 'positions' && 'Committee Structure & Sanctioned Positions'}
              {activeAdminTab === 'inquiries' && 'Public Messages & Whistleblower Tips'}
              {activeAdminTab === 'activity' && 'Administrative Activity Audit Logs'}
              {activeAdminTab === 'settings' && 'Institutional Settings, Seal & Signatures'}
              {activeAdminTab === 'security' && 'Admin Password & Security'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => dispatch(setActiveAdminTab('analytics'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${activeAdminTab === 'analytics' || activeAdminTab === 'overview'
                ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-sky-400 border-slate-700'
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics Graphs</span>
            </button>
            <button
              onClick={() => setShowAddNewsModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Publish News Article
            </button>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <FolderPlus className="w-4 h-4" /> Add Category
            </button>
            <button
              onClick={loadAdminData}
              title="Refresh"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real DB Analytics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
          <div
            onClick={() => dispatch(setActiveAdminTab('reporters'))}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl px-3 py-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Reporters</span>
            <strong className="text-xl font-black text-amber-400">
              {stats.activeReporters ?? stats.totalReporters}
            </strong>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
              {stats.suspendedReporters > 0 ? (
                <span className="text-red-400 font-bold">{stats.suspendedReporters} Suspended</span>
              ) : (
                'Active Bureau'
              )}
            </span>
          </div>

          <div
            onClick={() => dispatch(setActiveAdminTab('membership'))}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl px-3 py-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Members</span>
            <strong className="text-xl font-black text-white">
              {stats.activeMembers ?? stats.totalMembers}
            </strong>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
              {stats.expiredMemberships > 0 ? (
                <span className="text-amber-400 font-bold">{stats.expiredMemberships} Expired</span>
              ) : (
                'Active Terms'
              )}
            </span>
          </div>

          <div
            onClick={() => dispatch(setActiveAdminTab('complaints'))}
            className="bg-slate-900 border border-slate-800 hover:border-red-500 rounded-xl px-3 py-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-bold text-red-400 block mb-0.5">Grievances</span>
            <strong className="text-xl font-black text-red-400">
              {stats.pendingComplaints ?? 0}
            </strong>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
              {stats.resolvedComplaints ? `${stats.resolvedComplaints} Resolved` : 'Pending Cases'}
            </span>
          </div>

          <div
            onClick={() => dispatch(setActiveAdminTab('legal'))}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl px-3 py-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-bold text-purple-400 block mb-0.5">Legal Policies</span>
            <strong className="text-xl font-black text-purple-300">
              {stats.publishedLegalDocs ?? 15}
            </strong>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
              {stats.draftLegalDocs ? `${stats.draftLegalDocs} Drafts` : 'Published'}
            </span>
          </div>

          <div
            onClick={() => dispatch(setActiveAdminTab('news'))}
            className="bg-slate-900 border border-slate-800 hover:border-red-600 rounded-xl px-3 py-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Published News</span>
            <strong className="text-xl font-black text-red-500">
              {stats.totalNewsPublished}
            </strong>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
              {stats.pendingNewsReview ? `${stats.pendingNewsReview} In Review` : 'Live Articles'}
            </span>
          </div>

          <div
            onClick={() => dispatch(setActiveAdminTab('analytics'))}
            className="bg-slate-900 border border-slate-800 hover:border-sky-500 rounded-xl px-3 py-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Readership</span>
            <strong className="text-xl font-black text-sky-400">
              {stats.totalViews}
            </strong>
            <span className="text-[9px] text-sky-400 font-bold block mt-0.5">Graphs &rarr;</span>
          </div>
        </div>

        {/* TAB: EXECUTIVE ANALYTICS & DASHBOARD GRAPHS */}
        {(activeAdminTab === 'overview' || activeAdminTab === 'analytics') && (
          <AnalyticsDashboardGraphs
            stats={stats}
            newsList={newsList}
            categories={categories}
          />
        )}

        {/* TAB: REPORTER MANAGEMENT SYSTEM */}
        {activeAdminTab === 'reporters' && <ReporterManagementSection />}

        {/* TAB: MEMBERSHIP CONTROL & EXPIRY */}
        {activeAdminTab === 'membership' && <MembershipManagementSection />}

        {/* TAB: COMPLAINTS & GRIEVANCE REDRESSAL DESK */}
        {activeAdminTab === 'complaints' && <ComplaintsDeskSection />}

        {/* TAB: CENTRALIZED LEGAL DOCUMENTS & POLICIES */}
        {activeAdminTab === 'legal' && <LegalDocumentsSection />}

        {/* TAB: ADMINISTRATIVE ACTIVITY AUDIT LOGS */}
        {activeAdminTab === 'activity' && <AdminActivityLogsSection />}

        {/* TAB: INSTITUTIONAL SETTINGS, SEAL & SIGNATURES */}
        {activeAdminTab === 'settings' && <SiteSettingsSection />}

        {/* TAB 1: APPLICATIONS WORKFLOW */}
        {activeAdminTab === 'applications' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800">
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

              <div className="text-xs text-slate-400">
                Total Records: <strong>{applications.length}</strong>
              </div>
            </div>

            {applications.length > 0 ? (
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
                      <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
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
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${app.role === 'reporter'
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
                          {new Date(app.createdAt).toLocaleDateString('en-US')}
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
                                onClick={() => setRejectionModalUser(app)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 rounded text-xs font-bold transition-colors border border-slate-700"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span
                                className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize ${app.status === 'approved'
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
        )}

        {/* TAB 2: MEMBERS & TEAM PAGE MANAGEMENT */}
        {activeAdminTab === 'members' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Approved Members, Reporters & Team Page Control
                </h3>
                <p className="text-xs text-slate-400">
                  Manage assigned office designations, jurisdictions, credential documents, and toggle public display on the website&apos;s Team page.
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Showing <strong>{filteredMembers.length}</strong> leaders / reporters
              </div>
            </div>

            {/* Filter and Search Bar for Members */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
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
                Public on Team Page: <strong>{filteredMembers.filter((m) => m.showOnTeamPage).length}</strong>
              </div>
            </div>

            {filteredMembers.length > 0 ? (
              <div className="overflow-x-auto min-h-[420px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-white uppercase font-bold text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Member / Reporter</th>
                      <th className="py-3 px-4">Designation & Tier</th>
                      <th className="py-3 px-4">Assigned Area</th>
                      <th className="py-3 px-4">ID Card No.</th>
                      <th className="py-3 px-4 text-center">Show on Team Page</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredMembers.map((m, idx) => {
                      const isNearBottom = filteredMembers.length >= 3 && idx >= Math.max(1, filteredMembers.length - 3);
                      return (
                        <tr key={m._id} className={`hover:bg-slate-800/40 transition-colors ${activeMemberActionMenu === m._id ? 'relative z-30' : ''}`}>
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-slate-600">
                              <img
                                src={getMediaUrl(m.photo)}
                                alt={m.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <strong className="text-white block font-bold">{m.name}</strong>
                              <span className="text-[10px] text-slate-400">{m.phone}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <strong className="text-white block font-semibold">
                              {m.assignedDesignation || 'Unassigned'}
                            </strong>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-bold border border-slate-700">
                              {m.committeeLevel || 'General'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-400" />
                              {m.assignedLocation || m.reportingAreaPreference || 'National'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-amber-400">
                            {m.idCardNumber || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleTeamDisplay(m)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm ${m.showOnTeamPage
                                ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                                }`}
                            >
                              {m.showOnTeamPage ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Public (Visible)
                                </>
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5 text-slate-500" /> Hidden
                                </>
                              )}
                            </button>
                          </td>

                          <td className={`py-3.5 px-4 text-right ${activeMemberActionMenu === m._id ? 'relative z-30' : ''}`}>
                            <div className="inline-block text-left relative">
                              <button
                                type="button"
                                onClick={() => setActiveMemberActionMenu(activeMemberActionMenu === m._id ? null : m._id)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                              >
                                <span>Action</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeMemberActionMenu === m._id ? 'rotate-180' : ''}`} />
                              </button>

                              {activeMemberActionMenu === m._id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setActiveMemberActionMenu(null)}
                                  />
                                  <div
                                    className={`absolute right-0 ${isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                      } w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-40 p-1.5 space-y-1 text-left text-xs animate-in fade-in zoom-in-95 duration-100`}
                                  >
                                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                      Action: {m.name}
                                    </div>

                                    {/* Change Designation */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMemberActionMenu(null);
                                        openEditMemberModal(m);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-blue-950/70 hover:text-blue-300 font-semibold transition-colors text-left"
                                    >
                                      <Award className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                      <span>Change Designation</span>
                                    </button>

                                    {/* Remove Designation */}
                                    {m.assignedDesignation && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMemberActionMenu(null);
                                          handleRemoveMemberDesignation(m);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/70 font-semibold transition-colors text-left"
                                      >
                                        <UserX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                        <span>Remove Designation</span>
                                      </button>
                                    )}

                                    {/* Digital ID Card */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMemberActionMenu(null);
                                        setViewIdCardUser(m);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 font-semibold transition-colors text-left"
                                    >
                                      <Award className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                      <span>View Digital ID Card</span>
                                    </button>

                                    {/* Appointment Letter */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMemberActionMenu(null);
                                        setViewLetterUser(m);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 font-semibold transition-colors text-left"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>Appointment Letter</span>
                                    </button>

                                    {/* Delete User */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMemberActionMenu(null);
                                        handleDeleteUser(m._id);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-950/70 font-semibold transition-colors text-left border-t border-slate-800/80 pt-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                      <span>Delete Member</span>
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
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No members found matching the selected filter.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NEWS & EDITORIAL DESK */}
        {activeAdminTab === 'news' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Editorial Desk & Reporter News Moderation</h3>
                <p className="text-xs text-slate-400">
                  Review ground reports filed by correspondents, inspect publisher credentials and detailed markdown content, or broadcast breaking alerts.
                </p>
              </div>
              <button
                onClick={() => setShowAddNewsModal(true)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" /> Publish News Article
              </button>
            </div>

            {/* Filter and Search Bar for News */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Status:</span>
                  <select
                    value={newsFilterStatus}
                    onChange={(e) => setNewsFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  >
                    <option value="all">All Stories ({newsList.length})</option>
                    <option value="pending">
                      Pending Moderation ({newsList.filter((n) => n.status === 'pending').length})
                    </option>
                    <option value="published">
                      Published Live ({newsList.filter((n) => n.status === 'published').length})
                    </option>
                    <option value="rejected">
                      Declined ({newsList.filter((n) => n.status === 'rejected').length})
                    </option>
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="Search headline, reporter name, location..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 w-60 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Showing <strong>{filteredNewsList.length}</strong> reports
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredNewsList.length > 0 ? (
                filteredNewsList.map((story) => (
                  <div
                    key={story._id}
                    className="p-3 sm:p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-800/50 hover:border-slate-700/80 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Compact Thumbnail with subtle video badge */}
                      <div
                        onClick={() => setViewReportModalStory(story)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/80 relative cursor-pointer group/thumb shadow-sm"
                        title="Click to inspect report"
                      >
                        <img
                          src={getMediaUrl(story.thumbnail, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80')}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                        />
                        {story.videoUrl && (
                          <div className="absolute bottom-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full shadow" title="Video Included">
                            <Video className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Content Column: 3 Clean Lines without jagged wrapping */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {/* Line 1: Category, Status, Showcase Badges, Date & Views (Single line, never wraps) */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap overflow-hidden">
                          {Array.isArray(story.categories) && story.categories.length > 0 ? (
                            story.categories.map((c, idx) => (
                              <span key={c._id || idx} className="font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 uppercase border border-red-800/60 shrink-0">
                                {c.name || c.nameHindi || 'News'}
                              </span>
                            ))
                          ) : (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 uppercase border border-red-800/60 shrink-0">
                              {story.category?.name || story.categoryName || 'News'}
                            </span>
                          )}
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${story.status === 'published'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : story.status === 'pending'
                                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                                : 'bg-red-950/80 text-red-400 border border-red-800/60'
                              }`}
                          >
                            {story.status === 'published' ? 'Published' : story.status}
                          </span>

                          {story.isBreaking && (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow-sm shrink-0">
                              <Flame className="w-2.5 h-2.5 fill-red-600 text-red-600" /> Breaking
                            </span>
                          )}
                          {story.isFeatured && (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-0.5 shrink-0">
                              <Sparkles className="w-2.5 h-2.5 text-yellow-400" /> Highlight
                            </span>
                          )}
                          {story.isTrending && (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5 shrink-0">
                              <TrendingUp className="w-2.5 h-2.5 text-rose-400" /> Trending
                            </span>
                          )}

                          <span className="text-slate-600 shrink-0">•</span>
                          <span className="text-slate-400 flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(story.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-slate-600 shrink-0">•</span>
                          <span className="text-slate-400 flex items-center gap-1 shrink-0">
                            <Eye className="w-3 h-3 text-slate-500" />
                            {story.views || 0} views
                          </span>
                        </div>

                        {/* Line 2: Headline */}
                        <h4
                          onClick={() => setViewReportModalStory(story)}
                          className="text-sm font-bold text-white truncate hover:text-amber-400 transition-colors cursor-pointer py-0.5"
                          title={story.title}
                        >
                          {story.title}
                        </h4>

                        {/* Line 3: Clean, inline Author & Location (Never wraps) */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap overflow-hidden">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-4 h-4 rounded-full overflow-hidden border border-red-500 shrink-0 bg-slate-900">
                              <img
                                src={getMediaUrl(story.author?.photo)}
                                alt={story.authorName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-slate-300 text-[11px] font-medium truncate max-w-[140px] sm:max-w-none">
                              By: <strong className="text-amber-300 font-semibold">{story.authorName}</strong>
                            </span>
                          </div>
                          <span className="text-slate-500 text-[11px] hidden md:inline truncate max-w-[160px]">
                            ({story.author?.assignedDesignation || story.author?.role || 'Correspondent'})
                          </span>
                          <span className="text-slate-600 shrink-0">•</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-0.5 shrink-0">
                            <MapPin className="w-3 h-3 text-red-400" />
                            {story.location || story.author?.assignedLocation || 'Seemanchal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status Cluster */}
                    <div className="flex flex-col items-start xl:items-end gap-1.5 shrink-0 self-start xl:self-center">
                      {/* Top Row: Middle Actions */}
                      {/* Editorial Showcase One-Click Toggles in Clean Pill Group */}
                      {story.status === 'published' && (
                        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                          {/* 1. Breaking Toggle */}
                          <button
                            onClick={() => handleToggleNewsFlag(story._id, 'isBreaking', story.isBreaking)}
                            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${story.isBreaking
                              ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-sm'
                              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900'
                              }`}
                            title={story.isBreaking ? 'Remove from Breaking Ticker' : 'Broadcast to Breaking News Banners/Ticker'}
                          >
                            <Flame className={`w-3 h-3 ${story.isBreaking ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
                            <span>Breaking</span>
                          </button>

                          {/* 2. Top Highlight Toggle */}
                          <button
                            onClick={() => handleToggleNewsFlag(story._id, 'isFeatured', story.isFeatured)}
                            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${story.isFeatured
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-500 shadow-sm'
                              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900'
                              }`}
                            title={story.isFeatured ? 'Remove from Top Highlights' : 'Promote to Top Highlight News Titles / Hero'}
                          >
                            <Sparkles className={`w-3 h-3 ${story.isFeatured ? 'text-yellow-400' : 'text-slate-500'}`} />
                            <span>Highlight</span>
                          </button>

                          {/* 3. Top Trending Toggle */}
                          <button
                            onClick={() => handleToggleNewsFlag(story._id, 'isTrending', story.isTrending)}
                            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${story.isTrending
                              ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-sm'
                              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900'
                              }`}
                            title={story.isTrending ? 'Remove from Trending' : 'Add to Top Trending Stories'}
                          >
                            <TrendingUp className={`w-3 h-3 ${story.isTrending ? 'text-rose-400' : 'text-slate-500'}`} />
                            <span>Trending</span>
                          </button>
                        </div>
                      )}

                      {story.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateNewsStatus(story._id, 'published')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateNewsStatus(story._id, 'rejected')}
                            className="px-2 py-1.5 bg-red-950 text-red-400 hover:bg-red-900 rounded-lg text-xs font-bold border border-red-800"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {/* Bottom Row: Left 2 Actions (View, Edit) & Right 2 Actions (External Link, Delete) */}
                      <div className="flex items-center gap-1.5">
                        {/* Left Action 1: View */}
                        <button
                          onClick={() => setViewReportModalStory(story)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors shadow-sm"
                          title="View Full Report and Author Bio"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>View</span>
                        </button>

                        {/* Left Action 2: Edit */}
                        <button
                          onClick={() => openEditNewsModal(story)}
                          className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-800 transition-colors shadow-sm"
                          title="Edit and Update Story Content"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit</span>
                        </button>

                        {/* Right Action 1: External Link (View Live on Website) */}
                        {story.status === 'published' && (
                          <Link
                            href={`/news/${story.slug}`}
                            target="_blank"
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-400 rounded-lg border border-slate-700 transition-colors"
                            title="View Live on Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Right Action 2: Delete Story */}
                        <button
                          onClick={() => handleDeleteNews(story._id)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/60 rounded-lg border border-slate-800 hover:border-red-900/60 transition-colors"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No news reports found matching the selected filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeAdminTab === 'categories' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">News Categories Manager</h3>
                <p className="text-xs text-slate-400">
                  Manage public news categories, sorting sequence, and navigation filters.
                </p>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((cat) => (
                <div
                  key={cat._id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-800/40 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 uppercase border border-red-800">
                        Priority #{cat.order ?? 0}
                      </span>
                      <span className="text-xs font-mono text-slate-400">/{cat.slug}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                    {cat.nameHindi && (
                      <p className="text-xs text-slate-400">{cat.nameHindi}</p>
                    )}
                    {cat.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/50 transition-colors"
                      title="Edit Category & Priority"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COMMITTEE POSITIONS */}
        {activeAdminTab === 'positions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Dynamic Committee & Position Management
                </h3>
                <p className="text-xs text-slate-400">
                  Admins can add new positions, modify allowed seats across tiers, or restore the sanctioned hierarchy.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddPositionModal(true)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" /> Add Custom Position
                </button>
                <button
                  onClick={handleResetDefaultPositions}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-500" /> Restore Sanctioned Hierarchy
                </button>
              </div>
            </div>

            {/* Positions list grouped by level */}
            {['National', 'State', 'District', 'Block', 'Panchayat', 'Ward', 'Press'].map((lvl) => {
              const posInLevel = positions.filter((p) => p.committeeLevel === lvl);
              if (posInLevel.length === 0) return null;

              return (
                <div key={lvl} className="mb-4">
                  <div className="bg-slate-800/80 text-white px-3 py-1.5 rounded-lg flex justify-between items-center mb-2 border border-slate-700">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {posInLevel[0]?.committeeName || `${lvl} Committee`}
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold">
                      Positions: {posInLevel.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {posInLevel.map((pos) => (
                      <div
                        key={pos._id}
                        className="p-2.5 rounded-lg border border-slate-800 bg-slate-800/40 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{pos.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            Sanctioned Seats: <strong className="text-red-400">{pos.maxSeats}</strong>
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePosition(pos._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded"
                          title="Delete Position"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 6: INQUIRIES */}
        {activeAdminTab === 'inquiries' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <h3 className="text-base font-bold text-white mb-3 pb-2 border-b border-slate-800">
              Incoming Inquiries & Whistleblower Tips
            </h3>
            {inquiries.length > 0 ? (
              <div className="space-y-2">
                {inquiries.map((inq) => (
                  <div key={inq._id} className="p-3 rounded-xl border border-slate-800 bg-slate-800/40 text-xs">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <strong className="text-white text-sm block">{inq.name}</strong>
                        <span className="text-slate-400">{inq.email} • {inq.phone}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(inq.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <div className="font-bold text-red-400 mb-1">Subject: {inq.subject}</div>
                    <p className="text-slate-300 leading-relaxed bg-slate-800 p-2.5 rounded border border-slate-700">
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">No messages received yet.</p>
            )}
          </div>
        )}

        {/* TAB 7: ADMIN SECURITY */}
        {activeAdminTab === 'security' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm max-w-lg mx-auto">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
              Update Admin Master Password
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
                    type={showAdminPasswords ? 'text' : 'password'}
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
                    onClick={() => setShowAdminPasswords(!showAdminPasswords)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                    title={showAdminPasswords ? 'Hide passwords' : 'View passwords'}
                  >
                    {showAdminPasswords ? (
                      <EyeOff className="w-4 h-4 text-red-400" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">New Master Password *</label>
                <div className="relative">
                  <input
                    type={showAdminPasswords ? 'text' : 'password'}
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
                    onClick={() => setShowAdminPasswords(!showAdminPasswords)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                    title={showAdminPasswords ? 'Hide passwords' : 'View passwords'}
                  >
                    {showAdminPasswords ? (
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
                    type={showAdminPasswords ? 'text' : 'password'}
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
                    onClick={() => setShowAdminPasswords(!showAdminPasswords)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-white p-0.5"
                    title={showAdminPasswords ? 'Hide passwords' : 'View passwords'}
                  >
                    {showAdminPasswords ? (
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
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow"
              >
                {passwordLoading ? 'Updating Master Password...' : 'Save New Master Password'}
              </button>
            </form>
          </div>
        )}

        {/* MODAL 1: Approval Modal */}
        {approvalModalUser && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Approve Application & Assign Office
                  </h3>
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
                      <option key={p._id} value={p.title}>
                        {p.title} (Seats: {p.maxSeats})
                      </option>
                    ))}
                    <option value="Special Representative">Special Representative (Custom)</option>
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
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value={1}>1 Year</option>
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years</option>
                      <option value={5}>5 Years</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                      <input
                        type="checkbox"
                        checked={approvalForm.showOnTeamPage}
                        onChange={(e) =>
                          setApprovalForm({ ...approvalForm, showOnTeamPage: e.target.checked })
                        }
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>Show on Public Team Page</span>
                    </label>
                  </div>
                </div>

                <div className="bg-emerald-950/80 p-3 rounded-lg border border-emerald-800 text-emerald-300 text-[11px] leading-relaxed">
                  ✓ Approval will automatically generate the official <strong>Digital ID Card</strong> and <strong>Appointment Letter</strong>.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setApprovalModalUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                  >
                    {actionLoading ? 'Approving...' : 'Confirm Approval & Generate Credentials'}
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
                State reason for declining applicant <strong className="text-white">{rejectionModalUser.name}</strong>:
              </p>
              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete verification documents or no openings currently available..."
                  className="w-full p-3 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectionModalUser(null)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold text-white shadow"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Edit Member Assignment Modal */}
        {editMemberModalUser && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit Assignment & Committee Details
                  </h3>
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
                  <label className="block font-bold text-slate-300 mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMemberForm.assignedDesignation}
                    onChange={(e) =>
                      setEditMemberForm({
                        ...editMemberForm,
                        assignedDesignation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Assigned Jurisdiction / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMemberForm.assignedLocation}
                    onChange={(e) =>
                      setEditMemberForm({
                        ...editMemberForm,
                        assignedLocation: e.target.value,
                      })
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

        {/* MODAL 6: Add Position Modal */}
        {showAddPositionModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Add Custom Position to Tier
              </h3>
              <form onSubmit={handleAddPositionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Position Title *</label>
                  <input
                    type="text"
                    required
                    value={positionForm.title}
                    onChange={(e) => setPositionForm({ ...positionForm, title: e.target.value })}
                    placeholder="e.g. Senior Vice President"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Committee Tier *</label>
                  <select
                    value={positionForm.committeeLevel}
                    onChange={(e) => {
                      const lvl = e.target.value;
                      let cName = `${lvl} Committee`;
                      if (lvl === 'National') cName = 'A. National Executive Committee';
                      if (lvl === 'State') cName = 'B. State Executive Committee';
                      if (lvl === 'District') cName = 'C. District Executive Committee';
                      if (lvl === 'Block') cName = 'D. Block / Taluka Committee';
                      if (lvl === 'Panchayat') cName = 'E. Gram Panchayat Committee';
                      if (lvl === 'Ward') cName = 'F. Ward Committee';
                      if (lvl === 'Press') cName = 'Editorial & Field Reporting Team';

                      setPositionForm({
                        ...positionForm,
                        committeeLevel: lvl,
                        committeeName: cName,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="National">National</option>
                    <option value="State">State</option>
                    <option value="District">District</option>
                    <option value="Block">Block</option>
                    <option value="Panchayat">Panchayat</option>
                    <option value="Ward">Ward</option>
                    <option value="Press">Press</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Sanctioned Seats</label>
                  <input
                    type="text"
                    value={positionForm.maxSeats}
                    onChange={(e) => setPositionForm({ ...positionForm, maxSeats: e.target.value })}
                    placeholder="1, 2, 5–11, Open"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddPositionModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                  >
                    Save Position
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 7: Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Add News Category
              </h3>
              <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setCategoryForm({ ...categoryForm, name, slug });
                    }}
                    placeholder="e.g. Technology & Innovation"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g. tech-innovation"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-[11px] text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Short description of this news category..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 7B: Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Edit Category & Priority</span>
                <span className="text-[11px] font-mono text-amber-400">/{editingCategory.slug}</span>
              </h3>
              <form onSubmit={handleEditCategorySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category Name (Hindi)</label>
                  <input
                    type="text"
                    value={categoryForm.nameHindi}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameHindi: e.target.value })}
                    placeholder="e.g. सीमांचल विशेष"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-[11px] text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Priority / Display Order (Navbar Sequence) *</span>
                    <span className="text-[10px] text-slate-400">Lower number = Leftmost</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow"
                  >
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 8: Publish News Modal (With Video Support & Markdown Support - Full-Screen Spacious) */}
        {showAddNewsModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl xl:max-w-7xl max-h-[94vh] sm:max-h-[96vh] h-full flex flex-col shadow-2xl text-white overflow-hidden">
              {/* Modal Sticky Header with Close Button */}
              <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Publish News Article Live
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 uppercase tracking-wider hidden sm:inline-block">
                        Central Editorial Desk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Full-featured news creator with Markdown support, watermarked media, and instant broadcast syndication
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddNewsModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Form Body */}
              <form onSubmit={handleAddNewsSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 text-xs flex flex-col">
                <div className="space-y-4">
                  {/* Headline & Subtitle */}
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">Headline / Title *</label>
                    <input
                      type="text"
                      required
                      value={newNewsForm.title}
                      onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                      placeholder="e.g. सीमांचल में बाढ़ सुरक्षा पर उच्चस्तरीय बैठक, विशेष निगरानी के निर्देश..."
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">Subtitle / Summary Lead</label>
                    <input
                      type="text"
                      value={newNewsForm.subtitle}
                      onChange={(e) => setNewNewsForm({ ...newNewsForm, subtitle: e.target.value })}
                      placeholder="Concise 1-2 sentence lead summarizing the story..."
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>

                  {/* 2-Column Responsive Grid: Metadata (Left) & Media (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left Column: Categories & Dateline & Tags */}
                    <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block font-bold text-slate-300">
                            Categories * <span className="text-[11px] font-normal text-amber-300">(Select 1 or more / 1 से अधिक श्रेणियां चुनें)</span>
                          </label>
                          <span className="text-[11px] text-slate-400 font-bold">
                            {(newNewsForm.categories || []).length} selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800/90 border border-slate-700 rounded-lg max-h-36 overflow-y-auto">
                          {categories.map((c) => {
                            const isSelected = (newNewsForm.categories || []).includes(c._id) || (newNewsForm.categories?.length === 0 && newNewsForm.category === c._id);
                            return (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  const current = (newNewsForm.categories && newNewsForm.categories.length > 0)
                                    ? newNewsForm.categories
                                    : (newNewsForm.category ? [newNewsForm.category] : []);
                                  let updated;
                                  if (current.includes(c._id)) {
                                    updated = current.filter((id) => id !== c._id);
                                  } else {
                                    updated = [...current, c._id];
                                  }
                                  setNewNewsForm({
                                    ...newNewsForm,
                                    categories: updated,
                                    category: updated[0] || '',
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${isSelected
                                  ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400 font-bold'
                                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                                  }`}
                              >
                                <span className="text-[10px]">{isSelected ? '✓' : '+'}</span>
                                <span>{c.name}</span>
                                {c.nameHindi && <span className="text-[10px] opacity-75">({c.nameHindi})</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Dateline / Reporting Location</label>
                        <input
                          type="text"
                          value={newNewsForm.location}
                          onChange={(e) => setNewNewsForm({ ...newNewsForm, location: e.target.value })}
                          placeholder="e.g. Kishanganj, Purnea, Patna, New Delhi"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Tags / Keywords (comma separated)</label>
                        <input
                          type="text"
                          value={newNewsForm.tags}
                          onChange={(e) => setNewNewsForm({ ...newNewsForm, tags: e.target.value })}
                          placeholder="e.g. Bihar, Kishanganj, Politics, Development"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Right Column: Media (Featured Photo & Video Coverage) */}
                    <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      {/* Photo Upload & URL */}
                      <div>
                        <label className="font-bold text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Featured Photo (Upload or URL) *
                          </span>
                          {newNewsForm.thumbnail && (
                            <button
                              type="button"
                              onClick={() => setNewNewsForm({ ...newNewsForm, thumbnail: '' })}
                              className="text-[10px] text-red-400 hover:text-red-300 font-normal"
                            >
                              ✕ Clear
                            </button>
                          )}
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${newsImageUploading
                              ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-950/80 hover:bg-blue-900 border-blue-800/80 text-blue-200'
                              }`}>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{newsImageUploading ? 'Processing...' : 'Upload Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={newsImageUploading}
                                onChange={handleNewsImageUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={newNewsForm.thumbnail}
                              onChange={(e) => setNewNewsForm({ ...newNewsForm, thumbnail: e.target.value })}
                              placeholder="or paste image URL..."
                              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>

                          {newNewsForm.thumbnail && (
                            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black group shadow">
                              <img
                                src={getMediaUrl(newNewsForm.thumbnail)}
                                alt="Thumbnail Preview"
                                className="w-full h-full object-cover"
                              />
                              {newNewsForm.watermarkPhoto && (
                                <div className="absolute bottom-1 right-1 bg-black/85 text-[8px] font-bold px-1.5 py-0.5 rounded text-white border border-red-500/60 flex items-center gap-1 pointer-events-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                  <span>फोटो वॉटरमार्क</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video Upload & URL */}
                      <div>
                        <label className="font-bold text-slate-300 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-red-500" /> Video Coverage (Upload or URL)
                          </span>
                          {newNewsForm.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setNewNewsForm({ ...newNewsForm, videoUrl: '' })}
                              className="text-[10px] text-red-400 hover:text-red-300 font-normal"
                            >
                              ✕ Remove Video
                            </button>
                          )}
                        </label>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <label className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${videoUploading
                              ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                              : 'bg-red-950/80 hover:bg-red-900 border-red-800/80 text-red-200'
                              }`}>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{videoUploading ? 'Uploading Video...' : 'Upload Video'}</span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/mov,video/mkv,video/*"
                                disabled={videoUploading}
                                onChange={(e) => handleVideoUpload(e, false)}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={newNewsForm.videoUrl}
                              onChange={(e) => setNewNewsForm({ ...newNewsForm, videoUrl: e.target.value })}
                              placeholder="or paste YouTube / MP4 URL"
                              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>

                          {newNewsForm.videoUrl && (
                            <div className="space-y-1.5">
                              <div className="p-1.5 px-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between">
                                <span className="truncate max-w-[280px]">✓ Video Attached: {newNewsForm.videoUrl}</span>
                              </div>
                              {/* Live Video Preview with Watermark overlay */}
                              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video max-w-xs shadow">
                                {newNewsForm.videoUrl.includes('youtube.com') || newNewsForm.videoUrl.includes('youtu.be') ? (
                                  <iframe
                                    src={
                                      newNewsForm.videoUrl.includes('watch?v=')
                                        ? newNewsForm.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                                        : newNewsForm.videoUrl.includes('youtu.be/')
                                          ? newNewsForm.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                                          : newNewsForm.videoUrl
                                    }
                                    title="Video Preview"
                                    className="w-full h-full border-0 pointer-events-none"
                                  />
                                ) : (
                                  <video src={getMediaUrl(newNewsForm.videoUrl)} className="w-full h-full object-contain" />
                                )}
                                {newNewsForm.watermarkVideo && <VideoWatermarkBadge />}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watermark & Policy Settings */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-start gap-2.5 cursor-pointer bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <input
                          type="checkbox"
                          checked={newNewsForm.watermarkPhoto}
                          onChange={(e) => setNewNewsForm({ ...newNewsForm, watermarkPhoto: e.target.checked })}
                          className="mt-0.5 rounded text-red-600"
                        />
                        <div>
                          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                            <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                            Add Watermark on Photo / Image (फोटो वॉटरमार्क)
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            अपलोड की जाने वाली फोटो पर &apos;सीमांचल एक्सप्रेस&apos; का आधिकारिक डिजिटल वॉटरमार्क स्वतः स्टैम्प होगा।
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <input
                          type="checkbox"
                          checked={newNewsForm.watermarkVideo}
                          onChange={(e) => setNewNewsForm({ ...newNewsForm, watermarkVideo: e.target.checked })}
                          className="mt-0.5 rounded text-red-600"
                        />
                        <div>
                          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                            <Video className="w-3.5 h-3.5 text-amber-400" />
                            Add Watermark on Video (वीडियो वॉटरमार्क)
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            वीडियो प्लेयर पर लाइव चैनल ब्रॉडकास्ट का डिजिटल वॉटरमार्क बैज प्रदर्शित होगा।
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
                      <input
                        type="checkbox"
                        id="policyAcceptanceCheckAdmin"
                        required
                        checked={newNewsForm.policyAccepted}
                        onChange={(e) => setNewNewsForm({ ...newNewsForm, policyAccepted: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label htmlFor="policyAcceptanceCheckAdmin" className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs cursor-pointer">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Editorial &amp; Privacy Policy Acceptance (नीति स्वीकृति) *
                          </label>
                          <div className="flex items-center gap-2">
                            <a
                              href="/legal/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900/60 px-2 py-0.5 rounded border border-amber-800/80 transition-colors"
                              title="Read Privacy Policy in new tab"
                            >
                              <span>Read Privacy Policy (गोपनीयता नीति पढ़ें)</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href="/legal/editorial-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-slate-300 hover:text-white underline inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-750 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                              title="Read Editorial Policy in new tab"
                            >
                              <span>Editorial Code</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <label htmlFor="policyAcceptanceCheckAdmin" className="text-[11px] text-slate-400 mt-1 block leading-relaxed cursor-pointer">
                          मैं प्रमाणित करता हूँ कि यह समाचार, संलग्न छवियां और वीडियो सामग्री सीमांचल एक्सप्रेस की{' '}
                          <a
                            href="/legal/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-amber-400 hover:text-amber-300 underline font-semibold"
                          >
                            गोपनीयता नीति (Privacy Policy)
                          </a>{' '}
                          एवं{' '}
                          <a
                            href="/legal/editorial-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-amber-400 hover:text-amber-300 underline font-semibold"
                          >
                            संपादकीय पत्रकारिता आचार संहिता
                          </a>{' '}
                          के पूर्णतः अनुरूप हैं।
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Article Body with Markdown Toolbar & Live Markdown Preview Toggle */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <label className="block font-bold text-slate-200 text-xs">
                          Detailed Article Body (Markdown Supported) *
                        </label>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                          ({(newNewsForm.content || '').length} characters)
                        </span>
                      </div>

                      {/* Formatting Toolbar & Preview Toggle */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('h2', false)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert H2 Section Heading"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('h3', false)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert H3 Subheading"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('bold', false)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Bold Text"
                        >
                          **B**
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('italic', false)}
                          className="px-2 py-0.5 text-[10px] italic bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Italic Text"
                        >
                          *I*
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('quote', false)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Blockquote"
                        >
                          &gt; Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('bullet', false)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('link', false)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Link"
                        >
                          Link
                        </button>

                        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                        {/* Preview / Edit Toggle */}
                        <button
                          type="button"
                          onClick={() => setNewNewsPreview(!newNewsPreview)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${newNewsPreview
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700'
                            }`}
                        >
                          {newNewsPreview ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Raw Text</span>
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

                    {newNewsPreview ? (
                      <div className="p-4 sm:p-6 bg-slate-950 border border-slate-800 rounded-xl min-h-[280px] max-h-[460px] overflow-y-auto leading-relaxed">
                        {newNewsForm.content ? (
                          <MarkdownView content={newNewsForm.content} isDark={true} />
                        ) : (
                          <p className="text-slate-500 italic text-center py-10">
                            No article body written yet. Click &apos;Edit Raw Text&apos; above to write your story.
                          </p>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows={12}
                        required
                        value={newNewsForm.content}
                        onChange={(e) => setNewNewsForm({ ...newNewsForm, content: e.target.value })}
                        placeholder="Write full news article in Markdown format...&#10;&#10;## Section Subheading&#10;Detailed coverage paragraphs...&#10;&#10;> Official quotes from authorities...&#10;&#10;- Key bullet points..."
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white leading-relaxed text-xs focus:outline-none focus:border-red-500 font-sans"
                      />
                    )}
                  </div>

                  {/* Editorial Showcases */}
                  <div className="flex flex-wrap gap-4 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNewsForm.isBreaking}
                        onChange={(e) =>
                          setNewNewsForm({ ...newNewsForm, isBreaking: e.target.checked })
                        }
                        className="rounded text-red-600"
                      />
                      <span className="font-bold text-red-400 flex items-center gap-1 text-xs">
                        <Flame className="w-3.5 h-3.5" /> Breaking News Banner / Ticker
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNewsForm.isFeatured}
                        onChange={(e) =>
                          setNewNewsForm({ ...newNewsForm, isFeatured: e.target.checked })
                        }
                        className="rounded text-yellow-500"
                      />
                      <span className="font-bold text-yellow-400 flex items-center gap-1 text-xs">
                        <Sparkles className="w-3.5 h-3.5" /> Top Highlight News Title
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNewsForm.isTrending}
                        onChange={(e) =>
                          setNewNewsForm({ ...newNewsForm, isTrending: e.target.checked })
                        }
                        className="rounded text-rose-500"
                      />
                      <span className="font-bold text-rose-400 flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3.5 h-3.5" /> Top Trending Stories
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Sticky Footer with Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-auto shrink-0">
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ready for live publication across Seemanchal Express web &amp; mobile feeds</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAddNewsModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                    >
                      <Newspaper className="w-4 h-4" />
                      <span>Publish Live</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 10: Inspect Applicant Full Dossier */}
        {inspectApplicantModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto shadow-2xl relative">
              {/* Header */}
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${inspectApplicantModal.role === 'reporter'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                      >
                        {inspectApplicantModal.role}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${inspectApplicantModal.status === 'approved'
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

              {/* Dossier Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                {/* Residential Address */}
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

                {/* Role Specific Qualifications & Beats */}
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

              {/* Bio Statement with Markdown */}
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

              {/* Modal Actions */}
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

        {/* MODAL 9: View Full Report & Publisher Dossier */}
        {viewReportModalStory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto shadow-2xl relative">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {Array.isArray(viewReportModalStory.categories) && viewReportModalStory.categories.length > 0 ? (
                      viewReportModalStory.categories.map((c, idx) => (
                        <span key={c._id || idx} className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider bg-red-600 text-white">
                          {c.name || c.nameHindi || 'News'}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider bg-red-600 text-white">
                        {viewReportModalStory.category?.name || viewReportModalStory.categoryName || 'News Story'}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${viewReportModalStory.status === 'published'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : viewReportModalStory.status === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                    >
                      {viewReportModalStory.status === 'published' ? 'Published Live' : viewReportModalStory.status}
                    </span>
                    {viewReportModalStory.isBreaking && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-red-600 text-red-600" /> Breaking
                      </span>
                    )}
                    {viewReportModalStory.isFeatured && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {viewReportModalStory.title}
                  </h3>
                  {viewReportModalStory.subtitle && (
                    <p className="text-xs text-slate-400 mt-1 italic border-l-2 border-red-500 pl-2">
                      {viewReportModalStory.subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setViewReportModalStory(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Publisher & Reporter Dossier Card */}
              <div className="mb-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Reported & Published By
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {viewReportModalStory.author?.idCardNumber || 'Press Card N/A'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 bg-slate-900 shrink-0 shadow">
                    <img
                      src={getMediaUrl(viewReportModalStory.author?.photo)}
                      alt={viewReportModalStory.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-base text-white font-black">
                        {viewReportModalStory.authorName}
                      </strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-800">
                        {viewReportModalStory.author?.role || 'Correspondent'}
                      </span>
                      {viewReportModalStory.author?.assignedDesignation && (
                        <span className="text-[11px] font-semibold text-amber-300">
                          {viewReportModalStory.author.assignedDesignation}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                      {viewReportModalStory.author?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-sky-400" />
                          {viewReportModalStory.author.email}
                        </span>
                      )}
                      {viewReportModalStory.author?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {viewReportModalStory.author.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {viewReportModalStory.location || viewReportModalStory.author?.assignedLocation || 'Seemanchal'}
                      </span>
                    </div>

                    {/* Author Profile Bio (with Markdown Support!) */}
                    {viewReportModalStory.author?.bio ? (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Reporter Bio & Background:
                        </span>
                        <div className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <MarkdownView content={viewReportModalStory.author.bio} isDark={true} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        No bio provided by reporter.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Media Preview: Thumbnail & Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {viewReportModalStory.thumbnail && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800 relative">
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                      Featured Thumbnail
                    </span>
                    <img
                      src={getMediaUrl(viewReportModalStory.thumbnail)}
                      alt={viewReportModalStory.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {viewReportModalStory.videoUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video relative flex items-center justify-center">
                    {viewReportModalStory.videoUrl.includes('youtube.com') || viewReportModalStory.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={
                          viewReportModalStory.videoUrl.includes('watch?v=')
                            ? viewReportModalStory.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                            : viewReportModalStory.videoUrl.includes('youtu.be/')
                              ? viewReportModalStory.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                              : viewReportModalStory.videoUrl
                        }
                        title={viewReportModalStory.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      ></iframe>
                    ) : (
                      <video
                        src={getMediaUrl(viewReportModalStory.videoUrl)}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                    <Video className="w-8 h-8 text-slate-600 mb-1" />
                    <span>No Video Attached</span>
                  </div>
                )}
              </div>

              {/* Detailed Report Content (Markdown Supported!) */}
              <div className="mb-6 p-5 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Detailed Report Content (Markdown)
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(viewReportModalStory.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span>{viewReportModalStory.views || 0} Total Views</span>
                  </div>
                </div>

                <div className="text-slate-200">
                  <MarkdownView content={viewReportModalStory.content} isDark={true} />
                </div>

                {viewReportModalStory.tags && viewReportModalStory.tags.length > 0 && (
                  <div className="mt-5 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tags:</span>
                    {viewReportModalStory.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Editorial Controls & Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Breaking Toggle */}
                  <button
                    onClick={() =>
                      handleToggleNewsFlag(
                        viewReportModalStory._id,
                        'isBreaking',
                        viewReportModalStory.isBreaking
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewReportModalStory.isBreaking
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {viewReportModalStory.isBreaking ? 'Breaking News (Active)' : 'Mark as Breaking'}
                  </button>

                  {/* Top Highlight Toggle */}
                  <button
                    onClick={() =>
                      handleToggleNewsFlag(
                        viewReportModalStory._id,
                        'isFeatured',
                        viewReportModalStory.isFeatured
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewReportModalStory.isFeatured
                      ? 'bg-yellow-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {viewReportModalStory.isFeatured ? 'Top Highlight (Active)' : 'Mark as Top Highlight'}
                  </button>

                  {/* Top Trending Toggle */}
                  <button
                    onClick={() =>
                      handleToggleNewsFlag(
                        viewReportModalStory._id,
                        'isTrending',
                        viewReportModalStory.isTrending
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewReportModalStory.isTrending
                      ? 'bg-rose-500 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {viewReportModalStory.isTrending ? 'Top Trending (Active)' : 'Mark as Top Trending'}
                  </button>

                  {/* View Live Article */}
                  {viewReportModalStory.status === 'published' && (
                    <Link
                      href={`/news/${viewReportModalStory.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View on Live Site
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {viewReportModalStory.status === 'pending' && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateNewsStatus(viewReportModalStory._id, 'published')
                        }
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Check className="w-4 h-4" /> Approve & Publish
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateNewsStatus(viewReportModalStory._id, 'rejected')
                        }
                        className="px-3 py-2 bg-red-950 text-red-400 hover:bg-red-900 rounded-lg text-xs font-bold border border-red-800"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Edit Story Button in View Modal */}
                  <button
                    onClick={() => {
                      const story = viewReportModalStory;
                      setViewReportModalStory(null);
                      openEditNewsModal(story);
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Story
                  </button>

                  <button
                    onClick={() => handleDeleteNews(viewReportModalStory._id)}
                    className="px-3 py-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Story
                  </button>

                  <button
                    onClick={() => setViewReportModalStory(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 10: Edit News Story (Edition & Submission) - Full-Screen Spacious */}
        {editingNewsStory && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl xl:max-w-7xl max-h-[94vh] sm:max-h-[96vh] h-full flex flex-col text-white shadow-2xl overflow-hidden">
              {/* Sticky Header */}
              <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">Edit &amp; Update News Story</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase hidden sm:inline-block">
                        Story Edition &amp; Submission
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Originally filed by: <strong className="text-amber-300">{editingNewsStory.authorName}</strong> ({editingNewsStory.author?.assignedDesignation || 'Contributor'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingNewsStory(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleEditNewsSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 text-xs flex flex-col">
                <div className="space-y-4">
                  {/* Title & Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Story Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editNewsForm.title}
                      onChange={(e) => setEditNewsForm({ ...editNewsForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Subtitle / Summary (Optional)
                    </label>
                    <input
                      type="text"
                      value={editNewsForm.subtitle}
                      onChange={(e) => setEditNewsForm({ ...editNewsForm, subtitle: e.target.value })}
                      placeholder="Brief 1-2 sentence lead summarizing the story..."
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 2-Column Responsive Grid: Metadata & Media */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: Categories, Dateline, Tags */}
                    <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Categories * <span className="text-[11px] font-normal text-amber-300">(Select 1 or more / 1 से अधिक श्रेणियां चुनें)</span>
                          </label>
                          <span className="text-[11px] text-slate-400 font-bold">
                            {(editNewsForm.categories || []).length} selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800/90 border border-slate-700 rounded-lg max-h-36 overflow-y-auto">
                          {categories.map((c) => {
                            const isSelected = (editNewsForm.categories || []).includes(c._id) || (editNewsForm.categories?.length === 0 && editNewsForm.category === c._id);
                            return (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  const current = (editNewsForm.categories && editNewsForm.categories.length > 0)
                                    ? editNewsForm.categories
                                    : (editNewsForm.category ? [editNewsForm.category] : []);
                                  let updated;
                                  if (current.includes(c._id)) {
                                    updated = current.filter((id) => id !== c._id);
                                  } else {
                                    updated = [...current, c._id];
                                  }
                                  setEditNewsForm({
                                    ...editNewsForm,
                                    categories: updated,
                                    category: updated[0] || '',
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${isSelected
                                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400 font-bold'
                                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                                  }`}
                              >
                                <span className="text-[10px]">{isSelected ? '✓' : '+'}</span>
                                <span>{c.name}</span>
                                {c.nameHindi && <span className="text-[10px] opacity-75">({c.nameHindi})</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                          Reporting Location / Dateline
                        </label>
                        <input
                          type="text"
                          value={editNewsForm.location}
                          onChange={(e) => setEditNewsForm({ ...editNewsForm, location: e.target.value })}
                          placeholder="e.g. Kishanganj, Purnea, Patna"
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                          Tags / Keywords (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editNewsForm.tags}
                          onChange={(e) => setEditNewsForm({ ...editNewsForm, tags: e.target.value })}
                          placeholder="Kishanganj, Politics, Bihar, Development"
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Right: Media Section */}
                    <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      {/* Featured Thumbnail */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                          Featured Thumbnail Image
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                          <input
                            type="text"
                            value={editNewsForm.thumbnail}
                            onChange={(e) => setEditNewsForm({ ...editNewsForm, thumbnail: e.target.value })}
                            placeholder="Image URL or upload image file directly..."
                            className="w-full sm:flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                          />
                          <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{editNewsUploading ? 'Uploading...' : 'Upload Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditNewsImageUpload}
                              disabled={editNewsUploading}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {editNewsForm.thumbnail && (
                          <div className="mt-2 w-36 h-20 rounded-lg overflow-hidden border border-slate-700 bg-black">
                            <img src={getMediaUrl(editNewsForm.thumbnail)} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Video Report */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-amber-500" />
                            Video Report (Upload File or URL)
                          </label>
                          {editNewsForm.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setEditNewsForm({ ...editNewsForm, videoUrl: '' })}
                              className="text-[10px] text-red-400 hover:text-red-300 font-normal"
                            >
                              ✕ Remove Video
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className={`cursor-pointer px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${editVideoUploading
                              ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-950/80 hover:bg-amber-900 border-amber-800/80 text-amber-200'
                              }`}>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{editVideoUploading ? 'Uploading Video...' : 'Upload Video File'}</span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/mov,video/mkv,video/*"
                                disabled={editVideoUploading}
                                onChange={(e) => handleVideoUpload(e, true)}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={editNewsForm.videoUrl}
                              onChange={(e) => setEditNewsForm({ ...editNewsForm, videoUrl: e.target.value })}
                              placeholder="or paste YouTube / MP4 URL"
                              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                            />
                          </div>

                          {editNewsForm.videoUrl && (
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between">
                              <span className="truncate max-w-[320px]">✓ Video Attached: {editNewsForm.videoUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content (with Markdown Toolbar & Live Preview Toggle) */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Detailed Story Content (Markdown Supported) *
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('h2', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert H2 Section Heading"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('h3', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert H3 Subheading"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('bold', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Bold Text"
                        >
                          **B**
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('italic', true)}
                          className="px-2 py-0.5 text-[10px] italic bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Italic Text"
                        >
                          *I*
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('quote', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Blockquote"
                        >
                          &gt; Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('bullet', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => insertNewsMarkdownTag('link', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Insert Link"
                        >
                          Link
                        </button>

                        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                        <button
                          type="button"
                          onClick={() => setEditNewsPreview(!editNewsPreview)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                        >
                          {editNewsPreview ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Raw Text</span>
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

                    {editNewsPreview ? (
                      <div className="p-4 sm:p-6 bg-slate-950 border border-slate-800 rounded-xl min-h-[280px] max-h-[460px] overflow-y-auto leading-relaxed">
                        <MarkdownView content={editNewsForm.content} isDark={true} />
                      </div>
                    ) : (
                      <textarea
                        rows={12}
                        required
                        value={editNewsForm.content}
                        onChange={(e) => setEditNewsForm({ ...editNewsForm, content: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500 font-sans"
                      />
                    )}
                  </div>

                  {/* Editorial Showcases */}
                  <div className="flex flex-wrap gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editNewsForm.isBreaking}
                        onChange={(e) => setEditNewsForm({ ...editNewsForm, isBreaking: e.target.checked })}
                        className="rounded text-red-600"
                      />
                      <span className="font-bold text-red-400 flex items-center gap-1 text-xs">
                        <Flame className="w-3.5 h-3.5" /> Breaking News Banner / Ticker
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editNewsForm.isFeatured}
                        onChange={(e) => setEditNewsForm({ ...editNewsForm, isFeatured: e.target.checked })}
                        className="rounded text-yellow-500"
                      />
                      <span className="font-bold text-yellow-400 flex items-center gap-1 text-xs">
                        <Sparkles className="w-3.5 h-3.5" /> Top Highlight News Title
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editNewsForm.isTrending}
                        onChange={(e) => setEditNewsForm({ ...editNewsForm, isTrending: e.target.checked })}
                        className="rounded text-rose-500"
                      />
                      <span className="font-bold text-rose-400 flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3.5 h-3.5" /> Top Trending Stories
                      </span>
                    </label>
                  </div>

                  {/* Separate Watermark Options for Photo & Video */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Watermark Controls (वॉटरमार्क सेटिंग्स)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <input
                          type="checkbox"
                          checked={editNewsForm.watermarkPhoto}
                          onChange={(e) => setEditNewsForm({ ...editNewsForm, watermarkPhoto: e.target.checked })}
                          className="rounded text-red-600"
                        />
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-red-400" /> Photo Watermark
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <input
                          type="checkbox"
                          checked={editNewsForm.watermarkVideo}
                          onChange={(e) => setEditNewsForm({ ...editNewsForm, watermarkVideo: e.target.checked })}
                          className="rounded text-amber-500"
                        />
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-amber-400" /> Video Watermark
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5 mt-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingNewsStory(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editNewsSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editNewsSubmitting ? 'Saving Changes...' : 'Save & Submit Updates'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
