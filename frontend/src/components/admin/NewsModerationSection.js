'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Newspaper,
  PlusCircle,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Video,
  Image as ImageIcon,
  Flame,
  Zap,
  TrendingUp,
  Upload,
  X,
  ExternalLink,
  MapPin,
  Clock,
  User,
  Shield,
  FileText,
} from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';
import MarkdownView from '../common/MarkdownView';
import applyWatermarkToImage, { VideoWatermarkBadge } from '../../lib/watermarkHelper';
import { setAdminNewsList, updateNewsItem, removeNewsItem } from '../../store/slices/adminSlice';

export default function NewsModerationSection() {
  const dispatch = useDispatch();
  const { newsList, categories } = useSelector((state) => state.admin);

  const [newsFilterStatus, setNewsFilterStatus] = useState('all');
  const [newsSearch, setNewsSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [watermarkLogo, setWatermarkLogo] = useState('');

  // Modals state
  const [viewingNewsStory, setViewingNewsStory] = useState(null);
  const [editingNewsStory, setEditingNewsStory] = useState(null);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);

  // Form states
  const [newNewsPreview, setNewNewsPreview] = useState(false);
  const [editNewsPreview, setEditNewsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [newNewsForm, setNewNewsForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    categories: [],
    content: '',
    thumbnail: '',
    videoUrl: '',
    location: 'Seemanchal Region',
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    watermarkPhoto: true,
    watermarkVideo: true,
    tags: '',
  });

  const [editNewsForm, setEditNewsForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    categories: [],
    content: '',
    thumbnail: '',
    videoUrl: '',
    location: 'Seemanchal Region',
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    watermarkPhoto: true,
    watermarkVideo: true,
    tags: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data?.success && res.data?.settings) {
          setWatermarkLogo(res.data.settings.credentials?.watermarkLogo || '');
        }
      } catch (_) { }
    };
    fetchSettings();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/news');
      if (res.data?.success) {
        dispatch(setAdminNewsList(res.data.news));
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newsId, status) => {
    try {
      const res = await api.put(`/admin/news/${newsId}/status`, { status });
      if (res.data?.success) {
        dispatch(updateNewsItem(res.data.news));
        if (viewingNewsStory && viewingNewsStory._id === newsId) {
          setViewingNewsStory(res.data.news);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update news status');
    }
  };

  const handleToggleBreaking = async (newsId, current) => {
    try {
      const res = await api.put(`/admin/news/${newsId}/breaking`, { isBreaking: !current });
      if (res.data?.success) {
        dispatch(updateNewsItem(res.data.news));
        if (viewingNewsStory && (viewingNewsStory._id === newsId || viewingNewsStory.id === newsId)) {
          setViewingNewsStory((prev) => ({ ...prev, isBreaking: !current }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle breaking news:', err);
    }
  };

  const handleToggleFeatured = async (newsId, current) => {
    try {
      const res = await api.put(`/admin/news/${newsId}/featured`, { isFeatured: !current });
      if (res.data?.success) {
        dispatch(updateNewsItem(res.data.news));
        if (viewingNewsStory && (viewingNewsStory._id === newsId || viewingNewsStory.id === newsId)) {
          setViewingNewsStory((prev) => ({ ...prev, isFeatured: !current }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle featured news:', err);
    }
  };

  const handleToggleTrending = async (newsId, current) => {
    try {
      const res = await api.put(`/admin/news/${newsId}/trending`, { isTrending: !current });
      if (res.data?.success) {
        dispatch(updateNewsItem(res.data.news));
        if (viewingNewsStory && (viewingNewsStory._id === newsId || viewingNewsStory.id === newsId)) {
          setViewingNewsStory((prev) => ({ ...prev, isTrending: !current }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle trending news:', err);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await api.delete(`/admin/news/${newsId}`);
      if (res.data?.success) {
        dispatch(removeNewsItem(newsId));
        if (viewingNewsStory && viewingNewsStory._id === newsId) {
          setViewingNewsStory(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleFileUpload = async (file, type, isEdit = false) => {
    if (!file) return;
    let uploadFile = file;

    if (type === 'image') {
      setUploadingImage(true);
      const shouldWatermark = isEdit ? editNewsForm.watermarkPhoto : newNewsForm.watermarkPhoto;
      if (shouldWatermark) {
        uploadFile = await applyWatermarkToImage(file, watermarkLogo);
      }
    } else {
      setUploadingVideo(true);
    }

    const formData = new FormData();
    formData.append(type === 'image' ? 'file' : 'video', uploadFile);
    const endpoint = type === 'image' ? '/upload' : '/upload/video';

    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.fileUrl) {
        if (isEdit) {
          setEditNewsForm((prev) => ({
            ...prev,
            [type === 'image' ? 'thumbnail' : 'videoUrl']: res.data.fileUrl,
          }));
        } else {
          setNewNewsForm((prev) => ({
            ...prev,
            [type === 'image' ? 'thumbnail' : 'videoUrl']: res.data.fileUrl,
          }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      if (type === 'image') setUploadingImage(false);
      else setUploadingVideo(false);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cats =
        Array.isArray(newNewsForm.categories) && newNewsForm.categories.length > 0
          ? newNewsForm.categories
          : newNewsForm.category
            ? [newNewsForm.category]
            : categories[0]?._id
              ? [categories[0]._id]
              : [];

      const payload = {
        ...newNewsForm,
        categories: cats,
        category: cats[0] || newNewsForm.category,
        tags:
          typeof newNewsForm.tags === 'string'
            ? newNewsForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : newNewsForm.tags,
        watermarkPhoto: Boolean(newNewsForm.watermarkPhoto),
        watermarkVideo: Boolean(newNewsForm.watermarkVideo),
        hasWatermark: Boolean(newNewsForm.watermarkPhoto || newNewsForm.watermarkVideo),
      };

      const res = await api.post('/news', payload);
      if (res.data?.success) {
        setShowAddNewsModal(false);
        fetchNews();
        setNewNewsForm({
          title: '',
          subtitle: '',
          category: categories[0]?._id || '',
          categories: [],
          content: '',
          thumbnail: '',
          videoUrl: '',
          location: 'Seemanchal Region',
          isBreaking: false,
          isFeatured: false,
          isTrending: false,
          watermarkPhoto: true,
          watermarkVideo: true,
          tags: '',
        });
        setNewNewsPreview(false);
        alert('Article published live on the website!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (story) => {
    setEditingNewsStory(story);
    const initialCats = Array.isArray(story.categories) && story.categories.length > 0
      ? story.categories.map((c) => (typeof c === 'object' ? c._id : c))
      : story.category
        ? [typeof story.category === 'object' ? story.category._id : story.category]
        : [];

    setEditNewsForm({
      title: story.title || '',
      subtitle: story.subtitle || '',
      category: initialCats[0] || '',
      categories: initialCats,
      content: story.content || '',
      thumbnail: story.thumbnail || '',
      videoUrl: story.videoUrl || '',
      location: story.location || 'Seemanchal Region',
      isBreaking: Boolean(story.isBreaking),
      isFeatured: Boolean(story.isFeatured),
      isTrending: Boolean(story.isTrending),
      watermarkPhoto: story.watermarkPhoto !== undefined ? Boolean(story.watermarkPhoto) : (story.hasWatermark !== undefined ? Boolean(story.hasWatermark) : true),
      watermarkVideo: story.watermarkVideo !== undefined ? Boolean(story.watermarkVideo) : (story.hasWatermark !== undefined ? Boolean(story.hasWatermark) : true),
      tags: Array.isArray(story.tags) ? story.tags.join(', ') : story.tags || '',
    });
    setEditNewsPreview(false);
  };

  const handleUpdateNewsSubmit = async (e) => {
    e.preventDefault();
    if (!editingNewsStory) return;
    setSubmitting(true);
    try {
      const cats =
        Array.isArray(editNewsForm.categories) && editNewsForm.categories.length > 0
          ? editNewsForm.categories
          : editNewsForm.category
            ? [editNewsForm.category]
            : [];

      const payload = {
        ...editNewsForm,
        categories: cats,
        category: cats[0] || editNewsForm.category,
        tags:
          typeof editNewsForm.tags === 'string'
            ? editNewsForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : editNewsForm.tags,
        watermarkPhoto: Boolean(editNewsForm.watermarkPhoto),
        watermarkVideo: Boolean(editNewsForm.watermarkVideo),
        hasWatermark: Boolean(editNewsForm.watermarkPhoto || editNewsForm.watermarkVideo),
      };

      const res = await api.put(`/news/${editingNewsStory._id}`, payload);
      if (res.data?.success) {
        dispatch(updateNewsItem(res.data.news));
        setEditingNewsStory(null);
        fetchNews();
        if (viewingNewsStory && viewingNewsStory._id === editingNewsStory._id) {
          setViewingNewsStory(res.data.news);
        }
        alert('Article updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNewsList = newsList.filter((story) => {
    if (newsFilterStatus === 'trending') {
      if (!story.isTrending) return false;
    } else if (newsFilterStatus === 'breaking') {
      if (!story.isBreaking) return false;
    } else if (newsFilterStatus === 'featured') {
      if (!story.isFeatured) return false;
    } else if (newsFilterStatus !== 'all' && story.status !== newsFilterStatus) {
      return false;
    }
    if (newsSearch) {
      const q = newsSearch.toLowerCase();
      const matchTitle = story.title?.toLowerCase().includes(q);
      const matchAuthor = story.author?.name?.toLowerCase().includes(q);
      const matchLoc = story.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchLoc) return false;
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
              <Newspaper className="w-5 h-5 text-red-500" />
              Editorial Desk & Reporter News Moderation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review ground reports filed by correspondents, inspect publisher credentials, broadcast breaking alerts, or publish new editorial stories.
            </p>
          </div>
          <button
            onClick={() => setShowAddNewsModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" /> Publish News Article
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter:</span>
              <select
                value={newsFilterStatus}
                onChange={(e) => setNewsFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-red-500"
              >
                <option value="all">All Stories ({newsList.length})</option>
                <option value="pending">
                  Pending Moderation ({newsList.filter((n) => n.status === 'pending').length})
                </option>
                <option value="published">
                  Published Live ({newsList.filter((n) => n.status === 'published').length})
                </option>
                <option value="trending">
                  Trending Stories ({newsList.filter((n) => n.isTrending).length})
                </option>
                <option value="breaking">
                  Breaking Alerts ({newsList.filter((n) => n.isBreaking).length})
                </option>
                <option value="featured">
                  Featured Headlines ({newsList.filter((n) => n.isFeatured).length})
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
            Showing <strong className="text-white">{filteredNewsList.length}</strong> reports
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading news reports...</div>
        ) : filteredNewsList.length > 0 ? (
          <div className="space-y-3">
            {filteredNewsList.map((story) => (
              <div
                key={story._id || story.id}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-800/40 hover:border-slate-700 transition-all flex flex-col gap-3"
              >
                {/* Top Row: Thumbnail + Story Info */}
                <div className="flex items-start gap-4 w-full">
                  <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700 relative">
                    <img
                      src={getMediaUrl(story.thumbnail)}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/logo.jpeg';
                      }}
                    />
                    {story.videoUrl && (
                      <span className="absolute bottom-1 right-1 p-1 rounded bg-black/80 text-red-400">
                        <Video className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${story.status === 'published'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : story.status === 'pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                      >
                        {story.status}
                      </span>
                      {story.isTrending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-purple-400" /> Trending
                        </span>
                      )}
                      {story.isBreaking && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 shadow-sm">
                          <Zap className="w-3 h-3 text-white" /> Breaking
                        </span>
                      )}
                      {story.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" /> Featured
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {story.location || 'Seemanchal'} •{' '}
                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString('en-US') : ''}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">{story.title}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      By: <strong className="text-slate-300">{story.author?.name || 'Editorial Team'}</strong>
                      {story.author?.assignedDesignation && ` (${story.author.assignedDesignation})`}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: All Action Buttons in a Line */}
                <div className="pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center gap-2">
                  {/* View Dossier Button */}
                  <button
                    onClick={() => setViewingNewsStory(story)}
                    className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm cursor-pointer"
                    title="Inspect Full Story & Dossier"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                    <span>View</span>
                  </button>

                  {/* Moderate Pending Story Buttons */}
                  {story.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(story._id || story.id, 'published')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        title="Approve and Publish Live"
                      >
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Approve Live</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(story._id || story.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-950/80 text-red-300 hover:bg-red-900 rounded-lg text-xs font-bold border border-red-800 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        title="Decline Story"
                      >
                        <XCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                        <span>Decline Story</span>
                      </button>
                    </>
                  )}

                  {/* View Live Article (if published) */}
                  {story.status === 'published' && story.slug && (
                    <a
                      href={`/news/${story.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm cursor-pointer"
                      title="Open article live on website"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>View Live</span>
                    </a>
                  )}

                  {/* Trending Action Toggle */}
                  <button
                    onClick={() => handleToggleTrending(story._id || story.id, story.isTrending)}
                    title={story.isTrending ? 'Remove from Trending stories' : 'Add to Trending stories'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${story.isTrending
                        ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 font-extrabold shadow-purple-900/30'
                        : 'bg-slate-800/90 text-purple-300 hover:text-white border-slate-700 hover:bg-purple-950/70 hover:border-purple-700'
                      }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                    <span>{story.isTrending ? '✓ Trending' : '+ Add Trending'}</span>
                  </button>

                  {/* Breaking Action Toggle */}
                  <button
                    onClick={() => handleToggleBreaking(story._id || story.id, story.isBreaking)}
                    title={story.isBreaking ? 'Remove from Breaking ticker' : 'Set as Breaking News alert'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${story.isBreaking
                        ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 font-extrabold shadow-red-900/30'
                        : 'bg-slate-800/90 text-red-300 hover:text-white border-slate-700 hover:bg-red-950/70 hover:border-red-800'
                      }`}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>{story.isBreaking ? '⚡ Breaking' : '+ Add Breaking'}</span>
                  </button>

                  {/* Featured Action Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(story._id || story.id, story.isFeatured)}
                    title={story.isFeatured ? 'Remove from Featured carousel' : 'Mark as Featured headline'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${story.isFeatured
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-amber-900/30'
                        : 'bg-slate-800/90 text-amber-300 hover:text-white border-slate-700 hover:bg-amber-950/70 hover:border-amber-800'
                      }`}
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>{story.isFeatured ? '🔥 Featured' : '+ Add Featured'}</span>
                  </button>

                  {/* Edit Story Button */}
                  <button
                    onClick={() => openEditModal(story)}
                    className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm cursor-pointer"
                    title="Edit News Article"
                  >
                    <Edit className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>Edit Story</span>
                  </button>

                  {/* Delete Story Button */}
                  <button
                    onClick={() => handleDeleteNews(story._id || story.id)}
                    className="px-3 py-1.5 bg-slate-800/90 hover:bg-red-950 text-slate-300 hover:text-red-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 hover:border-red-800 transition-colors shadow-sm cursor-pointer ml-auto"
                    title="Delete News Article"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No news articles matching selected criteria.
          </div>
        )}
      </div>

      {/* MODAL 1: View Story & Dossier Modal */}
      {viewingNewsStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${viewingNewsStory.status === 'published'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : viewingNewsStory.status === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                  >
                    {viewingNewsStory.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {viewingNewsStory._id}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{viewingNewsStory.title}</h3>
                {viewingNewsStory.subtitle && (
                  <p className="text-xs text-slate-400 mt-0.5">{viewingNewsStory.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setViewingNewsStory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author / Correspondent Box */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 mb-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 shrink-0">
                  <img
                    src={getMediaUrl(viewingNewsStory.author?.photo)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <strong className="text-white block font-bold">
                    {viewingNewsStory.author?.name || 'Chief Editor / Admin'}
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {viewingNewsStory.author?.assignedDesignation || 'Editorial Correspondent'} •{' '}
                    {viewingNewsStory.location || 'Seemanchal'}
                  </span>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Published: {new Date(viewingNewsStory.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Media previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {viewingNewsStory.thumbnail && (
                <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 max-h-64 flex items-center justify-center">
                  <img
                    src={getMediaUrl(viewingNewsStory.thumbnail)}
                    alt=""
                    className="max-h-64 w-full object-cover"
                  />
                </div>
              )}
              {viewingNewsStory.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 max-h-64 flex items-center justify-center relative">
                  {viewingNewsStory.videoUrl.includes('youtube.com') ||
                    viewingNewsStory.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={
                        viewingNewsStory.videoUrl.includes('watch?v=')
                          ? viewingNewsStory.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                          : viewingNewsStory.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                      }
                      className="w-full h-64 border-0"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={getMediaUrl(viewingNewsStory.videoUrl)}
                      controls
                      className="max-h-64 w-full"
                    />
                  )}
                  {(viewingNewsStory.watermarkVideo || viewingNewsStory.hasWatermark) && (
                    <VideoWatermarkBadge className="top-2.5 right-2.5" watermarkLogo={watermarkLogo} />
                  )}
                </div>
              )}
            </div>

            {/* Markdown Content */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 mb-4 max-h-80 overflow-y-auto">
              <MarkdownView content={viewingNewsStory.content} isDark={true} />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleTrending(viewingNewsStory._id || viewingNewsStory.id, viewingNewsStory.isTrending)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${viewingNewsStory.isTrending
                      ? 'bg-purple-600 text-white border-purple-500 font-extrabold shadow-sm'
                      : 'bg-slate-800 text-purple-300 border-slate-700 hover:bg-purple-950/70 hover:border-purple-700'
                    }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{viewingNewsStory.isTrending ? '✓ Trending' : '+ Add Trending'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBreaking(viewingNewsStory._id || viewingNewsStory.id, viewingNewsStory.isBreaking)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${viewingNewsStory.isBreaking
                      ? 'bg-red-600 text-white border-red-500 font-extrabold shadow-sm'
                      : 'bg-slate-800 text-red-300 border-slate-700 hover:bg-red-950/70 hover:border-red-800'
                    }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{viewingNewsStory.isBreaking ? '⚡ Breaking' : '+ Add Breaking'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFeatured(viewingNewsStory._id || viewingNewsStory.id, viewingNewsStory.isFeatured)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${viewingNewsStory.isFeatured
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                      : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-amber-950/70 hover:border-amber-800'
                    }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{viewingNewsStory.isFeatured ? '🔥 Featured' : '+ Add Featured'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {viewingNewsStory.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(viewingNewsStory._id || viewingNewsStory.id, 'published')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve Live
                    </button>
                    <button
                      onClick={() => handleStatusChange(viewingNewsStory._id || viewingNewsStory.id, 'rejected')}
                      className="px-4 py-2 bg-red-950 text-red-400 hover:bg-red-900 rounded-lg text-xs font-bold border border-red-800 inline-flex items-center gap-1.5 shadow"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewingNewsStory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Publish News Modal */}
      {showAddNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 text-white max-h-[92vh] flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-500" />
                Publish Official Editorial Article
              </h3>
              <button
                onClick={() => setShowAddNewsModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNews} className="space-y-4 overflow-y-auto pr-2 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={newNewsForm.title}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                  placeholder="Enter news headline..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtitle / Summary</label>
                <input
                  type="text"
                  value={newNewsForm.subtitle}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, subtitle: e.target.value })}
                  placeholder="Short brief or secondary headline..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Row 1: News Category in Single Row */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">News Category *</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800/80 border border-slate-700 rounded-xl max-h-28 overflow-y-auto">
                  {categories.map((c) => {
                    const isSelected =
                      newNewsForm.category === (c._id || c.id) ||
                      (newNewsForm.categories || []).includes(c._id || c.id);
                    return (
                      <button
                        key={c._id || c.id}
                        type="button"
                        onClick={() => {
                          const catId = c._id || c.id;
                          setNewNewsForm({
                            ...newNewsForm,
                            category: catId,
                            categories: [catId],
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isSelected
                            ? 'bg-red-600 text-white font-bold shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{c.name}</span>
                        {c.nameHindi && <span className="text-[10px] opacity-75">({c.nameHindi})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Beat Dateline / Reporting Location Full Width */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Beat Dateline / Reporting Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-500" />
                  <input
                    type="text"
                    required
                    value={newNewsForm.location}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, location: e.target.value })}
                    placeholder="e.g. Bahadurganj, Kishanganj, Bihar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Photo & Video Upload in 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
                {/* Col 1: Photo Upload, URL & Preview */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" /> Cover Photo
                    </span>
                    {newNewsForm.thumbnail && (
                      <button
                        type="button"
                        onClick={() => setNewNewsForm({ ...newNewsForm, thumbnail: '' })}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={newNewsForm.thumbnail}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, thumbnail: e.target.value })}
                    placeholder="Paste image URL or upload below..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                    />
                  </div>
                  {uploadingImage && <span className="text-[11px] text-amber-400 block">Uploading image...</span>}
                  {newNewsForm.thumbnail && (
                    <div className="mt-2 relative w-full aspect-video max-h-48 rounded-lg border border-slate-700 overflow-hidden bg-black">
                      <img src={getMediaUrl(newNewsForm.thumbnail)} alt="Cover Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Col 2: Video Upload, URL & Preview */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-red-400" /> Video Clip
                    </span>
                    {newNewsForm.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setNewNewsForm({ ...newNewsForm, videoUrl: '' })}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={newNewsForm.videoUrl}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, videoUrl: e.target.value })}
                    placeholder="Paste YouTube or MP4 URL..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'video')}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                    />
                  </div>
                  {uploadingVideo && <span className="text-[11px] text-amber-400 block">Uploading video...</span>}
                  {newNewsForm.videoUrl && (
                    <div className="mt-2 relative w-full aspect-video max-h-48 rounded-lg border border-slate-700 overflow-hidden bg-black">
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
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <video src={getMediaUrl(newNewsForm.videoUrl)} controls className="w-full h-full object-contain" />
                      )}
                      {newNewsForm.watermarkVideo && (
                        <VideoWatermarkBadge className="top-2.5 right-2.5" watermarkLogo={watermarkLogo} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Editor / Preview Tabs */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-300">Article Content (Markdown Supported) *</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setNewNewsPreview(false)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${!newNewsPreview ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNewsPreview(true)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${newNewsPreview ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {newNewsPreview ? (
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 min-h-[160px] max-h-60 overflow-y-auto">
                    <MarkdownView content={newNewsForm.content || '*No content entered yet.*'} isDark={true} />
                  </div>
                ) : (
                  <textarea
                    required
                    rows={8}
                    value={newNewsForm.content}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, content: e.target.value })}
                    placeholder="Write detailed news story in Markdown..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs leading-relaxed"
                  />
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={newNewsForm.watermarkPhoto}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, watermarkPhoto: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Watermark on Photo (Left)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={newNewsForm.watermarkVideo}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, watermarkVideo: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Watermark on Video (Right)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={newNewsForm.isBreaking}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, isBreaking: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Breaking News Ticker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={newNewsForm.isFeatured}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, isFeatured: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Featured Carousel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={newNewsForm.isTrending}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, isTrending: e.target.checked })}
                    className="rounded text-sky-500"
                  />
                  <span>Trending Highlights</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddNewsModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow"
                >
                  {submitting ? 'Publishing...' : 'Publish Live Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit News Modal */}
      {editingNewsStory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 text-white max-h-[92vh] flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                Edit News Story
              </h3>
              <button
                onClick={() => setEditingNewsStory(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateNewsSubmit} className="space-y-4 overflow-y-auto pr-2 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={editNewsForm.title}
                  onChange={(e) => setEditNewsForm({ ...editNewsForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtitle / Summary</label>
                <input
                  type="text"
                  value={editNewsForm.subtitle}
                  onChange={(e) => setEditNewsForm({ ...editNewsForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Row 1: News Category in Single Row */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">News Category *</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-800/80 border border-slate-700 rounded-xl max-h-28 overflow-y-auto">
                  {categories.map((c) => {
                    const isSelected =
                      editNewsForm.category === (c._id || c.id) ||
                      (editNewsForm.categories || []).includes(c._id || c.id);
                    return (
                      <button
                        key={c._id || c.id}
                        type="button"
                        onClick={() => {
                          const catId = c._id || c.id;
                          setEditNewsForm({
                            ...editNewsForm,
                            category: catId,
                            categories: [catId],
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isSelected
                            ? 'bg-red-600 text-white font-bold shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{c.name}</span>
                        {c.nameHindi && <span className="text-[10px] opacity-75">({c.nameHindi})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Beat Dateline / Reporting Location Full Width */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Beat Dateline / Reporting Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-500" />
                  <input
                    type="text"
                    required
                    value={editNewsForm.location}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, location: e.target.value })}
                    placeholder="e.g. Bahadurganj, Kishanganj, Bihar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Photo & Video Upload in 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
                {/* Col 1: Photo Upload, URL & Preview */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" /> Cover Photo
                    </span>
                    {editNewsForm.thumbnail && (
                      <button
                        type="button"
                        onClick={() => setEditNewsForm({ ...editNewsForm, thumbnail: '' })}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editNewsForm.thumbnail}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, thumbnail: e.target.value })}
                    placeholder="Paste image URL or upload below..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'image', true)}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                    />
                  </div>
                  {uploadingImage && <span className="text-[11px] text-amber-400 block">Uploading image...</span>}
                  {editNewsForm.thumbnail && (
                    <div className="mt-2 relative w-full aspect-video max-h-48 rounded-lg border border-slate-700 overflow-hidden bg-black">
                      <img src={getMediaUrl(editNewsForm.thumbnail)} alt="Cover Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Col 2: Video Upload, URL & Preview */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-red-400" /> Video Clip
                    </span>
                    {editNewsForm.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditNewsForm({ ...editNewsForm, videoUrl: '' })}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editNewsForm.videoUrl}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, videoUrl: e.target.value })}
                    placeholder="Paste YouTube or MP4 URL..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'video', true)}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                    />
                  </div>
                  {uploadingVideo && <span className="text-[11px] text-amber-400 block">Uploading video...</span>}
                  {editNewsForm.videoUrl && (
                    <div className="mt-2 relative w-full aspect-video max-h-48 rounded-lg border border-slate-700 overflow-hidden bg-black">
                      {editNewsForm.videoUrl.includes('youtube.com') || editNewsForm.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={
                            editNewsForm.videoUrl.includes('watch?v=')
                              ? editNewsForm.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                              : editNewsForm.videoUrl.includes('youtu.be/')
                                ? editNewsForm.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                                : editNewsForm.videoUrl
                          }
                          title="Video Preview"
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <video src={getMediaUrl(editNewsForm.videoUrl)} controls className="w-full h-full object-contain" />
                      )}
                      {editNewsForm.watermarkVideo && (
                        <VideoWatermarkBadge className="top-2.5 right-2.5" watermarkLogo={watermarkLogo} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Editor */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-300">Article Content *</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditNewsPreview(false)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${!editNewsPreview ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditNewsPreview(true)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${editNewsPreview ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {editNewsPreview ? (
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 min-h-[160px] max-h-60 overflow-y-auto">
                    <MarkdownView content={editNewsForm.content || ''} isDark={true} />
                  </div>
                ) : (
                  <textarea
                    required
                    rows={8}
                    value={editNewsForm.content}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, content: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs leading-relaxed"
                  />
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={editNewsForm.watermarkPhoto}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, watermarkPhoto: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Watermark on Photo (Left)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={editNewsForm.watermarkVideo}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, watermarkVideo: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Watermark on Video (Right)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={editNewsForm.isBreaking}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, isBreaking: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Breaking News Ticker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={editNewsForm.isFeatured}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, isFeatured: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Featured Carousel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={editNewsForm.isTrending}
                    onChange={(e) => setEditNewsForm({ ...editNewsForm, isTrending: e.target.checked })}
                    className="rounded text-sky-500"
                  />
                  <span>Trending Highlights</span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingNewsStory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
