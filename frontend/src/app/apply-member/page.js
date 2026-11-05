'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileCheck,
  Camera,
  Eye,
  EyeOff,
  Scale,
  ExternalLink,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

export default function ApplyMemberPage() {
  const router = useRouter();
  const { registerMember } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    idProofNumber: '',
    photo: '',
    bloodGroup: '',
    qualifications: '',
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

  const handleFileUpload = async (e) => {
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
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerMember(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Membership Application Received!
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Your application has been submitted to the Seemanchal Express central administrative secretariat for review. 
            Upon approval, your designated committee tier (National, State, District, Block, Panchayat, Ward) and position will be assigned, activating your official <strong>Digital ID Card</strong> and <strong>Appointment Letter</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/member"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow flex items-center justify-center gap-1.5"
            >
              Go to Member Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-red-950 text-white p-6 sm:p-8 border-b-4 border-red-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-amber-300 border border-red-500/40 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                Official Membership Form
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Seemanchal Express Membership Application
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Apply to join our National, State, District, Block, Panchayat, or Ward committees.
              </p>
            </div>
            <img
              src="/logo.jpeg"
              alt="Seemanchal Express Logo"
              className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-red-500/50 shadow-md shrink-0"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Personal Details */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-red-600 pl-2">
                1. Personal Information
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
                    placeholder="e.g. Md. Tariq Anwer"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
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
                    placeholder="name@email.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone *
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
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
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                      title={showPassword ? 'Hide password' : 'View password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-red-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Government ID / Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={handleChange}
                    placeholder="Aadhaar or Voter ID"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Passport Photograph (Mandatory for Official ID Card) *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-red-600 bg-white shadow-md flex items-center justify-center shrink-0">
                    {photoPreview || formData.photo ? (
                      <img
                        src={photoPreview || getMediaUrl(formData.photo)}
                        alt="Photo Preview"
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
                      <label className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{formData.photo || photoPreview ? 'Change Photo' : 'Upload Passport Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
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
                      Upload a clear, front-facing passport photograph (JPG, PNG, or WebP). This will be printed on your Digital ID Card and verified credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Address & Location */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-red-600 pl-2">
                2. Residential Address & Area
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Village / Ward
                  </label>
                  <input
                    type="text"
                    name="addr_villageOrWard"
                    value={formData.address.villageOrWard}
                    onChange={handleChange}
                    placeholder="Village or Ward No."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Panchayat / Block
                  </label>
                  <input
                    type="text"
                    name="addr_panchayatOrBlock"
                    value={formData.address.panchayatOrBlock}
                    onChange={handleChange}
                    placeholder="Panchayat or Block"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District *
                  </label>
                  <select
                    name="addr_district"
                    value={formData.address.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white font-medium"
                  >
                    <option value="Kishanganj">Kishanganj</option>
                    <option value="Purnea">Purnea</option>
                    <option value="Katihar">Katihar</option>
                    <option value="Araria">Araria</option>
                    <option value="Patna">Patna</option>
                    <option value="New Delhi">New Delhi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Bio */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-red-600 pl-2">
                3. Brief Profile & Qualifications
              </h3>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Mention your academic background, public service experience, or dedication to the community..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>

            {/* Mandatory Membership Policy Acceptance & Declaration */}
            <div className="pt-4 border-t border-slate-200">
              <div className="bg-red-50/80 border border-red-200 p-4 rounded-xl space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="applyMemberPolicyAcceptance"
                    required
                    checked={formData.policyAccepted !== false}
                    onChange={(e) => setFormData({ ...formData, policyAccepted: e.target.checked })}
                    className="mt-1 rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4"
                  />
                  <div className="flex-1 text-xs text-slate-800">
                    <label htmlFor="applyMemberPolicyAcceptance" className="font-bold flex items-center gap-1.5 cursor-pointer text-slate-900">
                      <Scale className="w-4 h-4 text-red-600" />
                      <span>संगठनात्मक नियमावली एवं विधिक नीति स्वीकृति (Mandatory Acceptance) *</span>
                    </label>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      मैं पुष्टि करता हूँ कि मैंने संगठन की नीतियों को पढ़ लिया है। मैं सदस्यता आवेदन के साथ इन अनिवार्य नीतियों को डिजिटल रूप से स्वीकार करता हूँ:
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link
                        href="/legal/membership-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-red-50 border border-red-300 rounded text-[11px] font-bold text-red-700 inline-flex items-center gap-1"
                      >
                        <span>Membership Policy (सदस्यता नीति)</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Link
                        href="/legal/member-code-of-conduct"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-red-50 border border-red-300 rounded text-[11px] font-bold text-red-700 inline-flex items-center gap-1"
                      >
                        <span>Code of Conduct (आचार संहिता)</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Link
                        href="/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-red-50 border border-red-300 rounded text-[11px] font-bold text-red-700 inline-flex items-center gap-1"
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
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                {loading ? 'Submitting Application...' : 'Submit Membership Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
