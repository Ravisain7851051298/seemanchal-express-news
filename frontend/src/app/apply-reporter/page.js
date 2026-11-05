'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Newspaper,
  Camera,
  Eye,
  EyeOff,
  Scale,
  ExternalLink,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

export default function ApplyReporterPage() {
  const { registerReporter } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    idProofNumber: '',
    photo: '',
    reportingAreaPreference: 'Kishanganj / Seemanchal',
    pressExperienceYears: '1',
    reportingBeats: ['Ground Reporting', 'Politics & Policy'],
    bio: '',
    address: {
      street: '',
      villageOrWard: '',
      panchayatOrBlock: '',
      district: 'Kishanganj',
      state: 'Bihar',
      pincode: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableBeats = [
    'Ground Reporting & Rural Affairs',
    'Politics & Governance',
    'Crime, Law & Police Administration',
    'Education & Youth Career',
    'Agriculture & Rural Economy',
    'Healthcare & Community Welfare',
    'Flood & Disaster Management',
    'Culture, Arts & Heritage',
  ];

  const handleBeatToggle = (beat) => {
    setFormData((prev) => {
      const exists = prev.reportingBeats.includes(beat);
      if (exists) {
        return { ...prev, reportingBeats: prev.reportingBeats.filter((b) => b !== beat) };
      } else {
        return { ...prev, reportingBeats: [...prev.reportingBeats, beat] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('addr_')) {
      const field = name.replace('addr_', '');
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, photo: res.data.fileUrl }));
      }
    } catch (err) {
      console.error('Reporter photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerReporter(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error submitting reporter application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Reporter Application Received!
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            The editorial board of Seemanchal Express is reviewing your credentials and desired coverage area.
            Once approved, you will be issued an official <strong>Digital Press ID Card</strong>, <strong>Appointment Letter</strong>, and <strong>News Submission Portal</strong> access.
          </p>

          <Link
            href="/reporter"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow"
          >
            Go to Reporter Panel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-red-950 text-white p-6 sm:p-8 border-b-4 border-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5" />
                Press & Field Correspondent Recruitment
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Seemanchal Express Reporter Application
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Apply to become an accredited press correspondent or field reporter representing your block, town, or district.
              </p>
            </div>
            <img
              src="/logo.jpeg"
              alt="Seemanchal Express Logo"
              className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-amber-400/50 shadow-md shrink-0"
            />
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Reporter Credentials */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-amber-500 pl-2">
                1. Reporter Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Amit Kumar Ray"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="reporter@mail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                      title={showPassword ? 'Hide password' : 'View password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Government ID / Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    name="idProofNumber"
                    required
                    value={formData.idProofNumber}
                    onChange={handleChange}
                    placeholder="Aadhaar or Voter ID"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Journalism / Media Experience
                  </label>
                  <select
                    name="pressExperienceYears"
                    value={formData.pressExperienceYears}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    <option value="0">Fresher / Citizen Journalist</option>
                    <option value="1">1 Year</option>
                    <option value="2">2-3 Years</option>
                    <option value="5">5+ Years</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Passport Photograph (Mandatory for Press ID Card) *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500 bg-white shadow-md flex items-center justify-center shrink-0">
                    {photoPreview || formData.photo ? (
                      <img
                        src={photoPreview || getMediaUrl(formData.photo)}
                        alt="Reporter Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                        <span className="text-[10px] block font-semibold">No Photo</span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="cursor-pointer px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{formData.photo || photoPreview ? 'Change Photo' : 'Upload Passport Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {(formData.photo || photoPreview) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, photo: '' }));
                            setPhotoPreview('');
                          }}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Upload a formal passport-sized photograph. This will appear on your official Press Identity Card and correspondent accreditation documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Reporting Area & Beats */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-amber-500 pl-2">
                2. Reporting Jurisdiction & Beats
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Desired Reporting Jurisdiction (District / Sub-division / Block) *
                </label>
                <input
                  type="text"
                  name="reportingAreaPreference"
                  required
                  value={formData.reportingAreaPreference}
                  onChange={handleChange}
                  placeholder="e.g. Kishanganj Sadar, Bahadurganj, Purnea East, etc."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Preferred Reporting Beats
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {availableBeats.map((beat, idx) => {
                    const checked = formData.reportingBeats.includes(beat);
                    return (
                      <label
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${checked
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleBeatToggle(beat)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>{beat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mandatory Legal Policy Acceptance & Declaration */}
            <div className="pt-4 border-t border-slate-200">
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="applyPolicyAcceptance"
                    required
                    checked={formData.policyAccepted !== false}
                    onChange={(e) => setFormData({ ...formData, policyAccepted: e.target.checked })}
                    className="mt-1 rounded text-amber-600 focus:ring-amber-500 cursor-pointer w-4 h-4"
                  />
                  <div className="flex-1 text-xs text-slate-800">
                    <label htmlFor="applyPolicyAcceptance" className="font-bold flex items-center gap-1.5 cursor-pointer text-slate-900">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span>पत्रकारिता आचार संहिता एवं विधिक नीति स्वीकृति (Mandatory Legal Acceptance) *</span>
                    </label>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      मैं प्रमाणित करता हूँ कि मैंने सीमांचल एक्सप्रेस की नीतियों को पढ़ लिया है। मैं आवेदन के साथ इन अनिवार्य नीतियों को डिजिटल रूप से स्वीकार करता हूँ:
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link
                        href="/legal/editorial-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[11px] font-bold text-amber-800 inline-flex items-center gap-1"
                      >
                        <span>Editorial Policy (संपादकीय नीति)</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Link
                        href="/legal/reporter-agreement"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[11px] font-bold text-amber-800 inline-flex items-center gap-1"
                      >
                        <span>Reporter Agreement (अनुबंध)</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Link
                        href="/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[11px] font-bold text-amber-800 inline-flex items-center gap-1"
                      >
                        <span>Privacy Policy (गोपनीयता नीति)</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || formData.policyAccepted === false}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Newspaper className="w-4 h-4" />
                {loading ? 'Submitting Application...' : 'Submit Press Reporter Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
