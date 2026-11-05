'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  MapPin,
  ShieldCheck,
  BookOpen,
  Award,
} from 'lucide-react';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
} from '../common/SocialIcons';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

export default function SiteSettingsSection() {
  const [activeSubTab, setActiveSubTab] = useState('credentials'); // 'credentials', 'social', 'about', 'contact'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Upload progress states
  const [sealUploading, setSealUploading] = useState(false);
  const [sigUploading, setSigUploading] = useState(false);

  // Form State
  const [settings, setSettings] = useState({
    organizationName: 'Seemanchal Express',
    tagline: 'Voice of the People | सच की निर्भीक आवाज',
    credentials: {
      officialSeal: '',
      presidentSignature: '',
      signatoryName: 'Nation Correspondence / Chief Editor',
      signatoryDesignation: 'Editor-in-Chief & Central Secretariat',
    },
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      telegram: '',
      whatsapp: '',
      linkedin: '',
    },
    aboutUs: {
      title: 'Seemanchal Express (सीमांचल एक्सप्रेस)',
      subtitle: 'Voice of the People | सच की निर्भीक आवाज',
      mission: '',
      vision: '',
      detailedContent: '',
    },
    contactUs: {
      headquartersAddress: 'F 65, Shaheen Bagh, Okhla, New Delhi-110025, India',
      phone: '+91 9871023184',
      alternatePhone: '',
      email: 'mail@seemanchalexpress.in',
      supportEmail: 'editor@seemanchalexpress.in',
      whatsappNumber: '+91 9871023184',
      officeHours: 'Monday - Saturday: 9:00 AM - 8:00 PM IST',
      mapEmbedUrl: '',
    },
  });

  // Fetch current settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data?.success && res.data.settings) {
        const s = res.data.settings;
        setSettings({
          organizationName: s.organizationName || 'Seemanchal Express',
          tagline: s.tagline || 'Voice of the People | सच की निर्भीक आवाज',
          credentials: {
            officialSeal: s.credentials?.officialSeal || '',
            presidentSignature: s.credentials?.presidentSignature || '',
            signatoryName: s.credentials?.signatoryName || 'Nation Correspondence / Chief Editor',
            signatoryDesignation: s.credentials?.signatoryDesignation || 'Editor-in-Chief & Central Secretariat',
          },
          socialLinks: {
            facebook: s.socialLinks?.facebook || '',
            twitter: s.socialLinks?.twitter || '',
            instagram: s.socialLinks?.instagram || '',
            youtube: s.socialLinks?.youtube || '',
            telegram: s.socialLinks?.telegram || '',
            whatsapp: s.socialLinks?.whatsapp || '',
            linkedin: s.socialLinks?.linkedin || '',
          },
          aboutUs: {
            title: s.aboutUs?.title || 'Seemanchal Express (सीमांचल एक्सप्रेस)',
            subtitle: s.aboutUs?.subtitle || 'Voice of the People | सच की निर्भीक आवाज',
            mission: s.aboutUs?.mission || '',
            vision: s.aboutUs?.vision || '',
            detailedContent: s.aboutUs?.detailedContent || '',
          },
          contactUs: {
            headquartersAddress: s.contactUs?.headquartersAddress || 'F 65, Shaheen Bagh, Okhla, New Delhi-110025, India',
            phone: s.contactUs?.phone || '+91 9871023184',
            alternatePhone: s.contactUs?.alternatePhone || '',
            email: s.contactUs?.email || 'mail@seemanchalexpress.in',
            supportEmail: s.contactUs?.supportEmail || 'editor@seemanchalexpress.in',
            whatsappNumber: s.contactUs?.whatsappNumber || '+91 9871023184',
            officeHours: s.contactUs?.officeHours || 'Monday - Saturday: 9:00 AM - 8:00 PM IST',
            mapEmbedUrl: s.contactUs?.mapEmbedUrl || '',
          },
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setSaveError('Failed to load site settings from server');
    } finally {
      setLoading(false);
    }
  };

  // Upload Official Seal File
  const handleSealUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    setSealUploading(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setSettings((prev) => ({
          ...prev,
          credentials: {
            ...prev.credentials,
            officialSeal: res.data.fileUrl,
          },
        }));
        setSaveSuccess('Official Seal uploaded successfully! Click "Save Settings" below to publish.');
      } else {
        setSaveError(res.data?.message || 'Failed to upload seal image');
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Error uploading seal image');
    } finally {
      setSealUploading(false);
    }
  };

  // Upload President / Editor Signature File
  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    setSigUploading(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setSettings((prev) => ({
          ...prev,
          credentials: {
            ...prev.credentials,
            presidentSignature: res.data.fileUrl,
          },
        }));
        setSaveSuccess('Signature uploaded successfully! Click "Save Settings" below to publish.');
      } else {
        setSaveError(res.data?.message || 'Failed to upload signature image');
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Error uploading signature image');
    } finally {
      setSigUploading(false);
    }
  };

  // Save Settings to Backend
  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const res = await api.put('/settings', settings);
      if (res.data?.success) {
        setSaveSuccess('Institutional Settings & Credentials saved and published successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      } else {
        setSaveError(res.data?.message || 'Failed to save settings');
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Server error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading institutional settings and credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Institutional Settings & Credentials (संस्थागत सेटिंग्स)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure official round seal, presidential signatures, dynamic social media links, and public page content.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save & Publish All'}</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('credentials')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'credentials'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Official Seal & Signature</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('social')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'social'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Social Media Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('about')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'about'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>About Us Page Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'contact'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Contact Us & Headquarters</span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL SEAL & SIGNATURE */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Official Credentials Stamping & Authority Signoff</strong>
              <p className="text-slate-400 leading-relaxed">
                The Official Seal and Authorized Signature uploaded here are automatically printed onto all member and reporter <strong>Digital Identity Cards</strong> and formal <strong>Appointment Letters</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Official Seal Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>Official Institutional Seal (आधिकारिक मुहर / स्टाम्प)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Round stamp format (PNG with transparent background recommended)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Seal Preview Box */}
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-red-500/50 bg-slate-950 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {settings.credentials.officialSeal ? (
                    <img
                      src={getMediaUrl(settings.credentials.officialSeal)}
                      alt="Official Seal"
                      className="w-full h-full object-contain drop-shadow"
                    />
                  ) : (
                    <div className="text-center text-[10px] text-slate-500 font-bold">
                      No Seal Uploaded
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sealUploading ? 'Uploading Seal...' : 'Upload Official Seal'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleSealUpload}
                      className="hidden"
                      disabled={sealUploading}
                    />
                  </label>

                  {settings.credentials.officialSeal && (
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          credentials: { ...prev.credentials, officialSeal: '' },
                        }))
                      }
                      className="ml-2 text-[11px] text-red-400 hover:text-red-300 underline"
                    >
                      Remove Seal
                    </button>
                  )}

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Will be rendered on official appointment letterhead and digital ID credentials as the verifying institutional stamp.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Nation Correspondence / Chief Editor Signature Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Nation Correspondence / Chief Editor Signature (डिजिटल हस्ताक्षर)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Authorized signatory signature (Transparent PNG recommended)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Signature Preview Box */}
                <div className="w-40 h-28 rounded-xl border-2 border-dashed border-amber-500/50 bg-slate-950 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {settings.credentials.presidentSignature ? (
                    <img
                      src={getMediaUrl(settings.credentials.presidentSignature)}
                      alt="President Signature"
                      className="max-h-full max-w-full object-contain drop-shadow"
                    />
                  ) : (
                    <div className="text-center text-[10px] text-slate-500 font-bold">
                      No Signature Uploaded
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{sigUploading ? 'Uploading Signature...' : 'Upload Signature'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleSignatureUpload}
                      className="hidden"
                      disabled={sigUploading}
                    />
                  </label>

                  {settings.credentials.presidentSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          credentials: { ...prev.credentials, presidentSignature: '' },
                        }))
                      }
                      className="ml-2 text-[11px] text-red-400 hover:text-red-300 underline"
                    >
                      Remove Signature
                    </button>
                  )}

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Will be rendered above &ldquo;Authorized Signatory&rdquo; on all ID cards and formal letters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Signatory Names & Titles */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Signatory Credentials & Authority Nomenclature
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Authorized Signatory Designation / Name *
                </label>
                <input
                  type="text"
                  value={settings.credentials.signatoryName}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      credentials: { ...prev.credentials, signatoryName: e.target.value },
                    }))
                  }
                  placeholder="e.g. Nation Correspondence / Chief Editor"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Secretariat & Authority Office Title *
                </label>
                <input
                  type="text"
                  value={settings.credentials.signatoryDesignation}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      credentials: { ...prev.credentials, signatoryDesignation: e.target.value },
                    }))
                  }
                  placeholder="e.g. Editor-in-Chief & Central Secretariat"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOCIAL MEDIA CHANNELS */}
      {activeSubTab === 'social' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Official Social Media Channel URLs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Links added here will appear in the website footer, contact us section, and headers. Leave blank to hide a channel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Facebook */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Facebook Page URL</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.facebook}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                  }))
                }
                placeholder="https://facebook.com/seemanchalexpress"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Twitter / X */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <TwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Twitter / X Profile URL</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.twitter}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                  }))
                }
                placeholder="https://twitter.com/seemanchalexp"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.instagram}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                  }))
                }
                placeholder="https://instagram.com/seemanchalexpress"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.youtube}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, youtube: e.target.value },
                  }))
                }
                placeholder="https://youtube.com/@seemanchalexpress"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram Channel / Group URL</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.telegram}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, telegram: e.target.value },
                  }))
                }
                placeholder="https://t.me/seemanchalexpress"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <WhatsappIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Channel / Group Link</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.whatsapp}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, whatsapp: e.target.value },
                  }))
                }
                placeholder="https://whatsapp.com/channel/seemanchalexpress"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* LinkedIn */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn Page URL (Optional)</span>
              </label>
              <input
                type="url"
                value={settings.socialLinks.linkedin}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                  }))
                }
                placeholder="https://linkedin.com/company/seemanchalexpress"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT US CONTENT */}
      {activeSubTab === 'about' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-500" />
              <span>About Us Page Dynamic CMS Content</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Update the organization narrative, mission statement, and editorial principles on the /about page.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Organization Heading Title *
                </label>
                <input
                  type="text"
                  value={settings.aboutUs.title}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      aboutUs: { ...prev.aboutUs, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Tagline / Subheading *
                </label>
                <input
                  type="text"
                  value={settings.aboutUs.subtitle}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      aboutUs: { ...prev.aboutUs, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Our Mission (हमारा उद्देश्य) *
              </label>
              <textarea
                rows="4"
                value={settings.aboutUs.mission}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutUs: { ...prev.aboutUs, mission: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                placeholder="Core mission statement regarding Seemanchal development and fearless reporting..."
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Core Principles & Vision (मार्गदर्शक सिद्धांत) *
              </label>
              <textarea
                rows="4"
                value={settings.aboutUs.vision}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutUs: { ...prev.aboutUs, vision: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                placeholder="Guiding principles of truth, impartiality, and social integrity..."
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Detailed Editorial Philosophy & Story (Markdown Supported)
              </label>
              <textarea
                rows="6"
                value={settings.aboutUs.detailedContent}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutUs: { ...prev.aboutUs, detailedContent: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                placeholder="Optional detailed background story, history, and editorial charter..."
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTACT US CONTENT */}
      {activeSubTab === 'contact' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Contact Us & Central Secretariat Coordinates</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure official address, helpline phone numbers, email inboxes, and working hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">
                Headquarters Full Address *
              </label>
              <input
                type="text"
                value={settings.contactUs.headquartersAddress}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, headquartersAddress: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Primary Helpline Phone Number *
              </label>
              <input
                type="text"
                value={settings.contactUs.phone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, phone: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Alternate Contact Phone (Optional)
              </label>
              <input
                type="text"
                value={settings.contactUs.alternatePhone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, alternatePhone: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Official Editorial Email *
              </label>
              <input
                type="email"
                value={settings.contactUs.email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, email: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Support / Grievance Email (Optional)
              </label>
              <input
                type="email"
                value={settings.contactUs.supportEmail}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, supportEmail: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                WhatsApp Desk Number
              </label>
              <input
                type="text"
                value={settings.contactUs.whatsappNumber}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, whatsappNumber: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Office Working Hours *
              </label>
              <input
                type="text"
                value={settings.contactUs.officeHours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactUs: { ...prev.contactUs, officeHours: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action Bar */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save & Publish All Institutional Settings'}</span>
        </button>
      </div>
    </div>
  );
}

