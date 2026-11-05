'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Shield,
  FileText,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const COMPLAINT_CATEGORIES = [
  'Incorrect News',
  'Content Removal Request',
  'Copyright Complaint',
  'Privacy Complaint',
  'Reporter Misconduct',
  'Membership Issue',
  'Technical Issue',
  'General Complaint',
  'Other',
];

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005').replace(/\/api\/?$/, '');

export default function ComplaintSubmissionPage() {
  const { user } = useSelector((state) => state.auth || {});

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: 'Incorrect News',
    subject: '',
    description: '',
    relatedNewsUrl: '',
    attachmentUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Please provide a subject for your complaint.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      setError('Please provide a detailed description (at least 15 characters).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user?._id || user?.id || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessData({
          referenceNumber: data.referenceNumber,
          email: formData.email,
          createdAt: data.createdAt,
        });
      } else {
        setError(data.message || 'Failed to submit complaint. Please try again.');
      }
    } catch (err) {
      setError('Network error: Unable to contact the Grievance Redressal server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (successData?.referenceNumber) {
      navigator.clipboard.writeText(successData.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/complaint/track"
            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            Already have a Reference Number? Track Status &rarr;
          </Link>
        </div>

        {/* Title Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Institutional Grievance Redressal Cell
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Submit a Formal Complaint / Grievance
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            In accordance with Rule 11 of the Information Technology (Intermediary Guidelines & Digital Media Ethics Code) Rules, 2021, all complaints are logged and examined under strict oversight.
          </p>
        </div>

        {/* Success Confirmation State */}
        {successData ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-emerald-800/60 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Grievance Registered Successfully</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your complaint has been logged in our secure database and routed to the Grievance Officer.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Unique Tracking Reference
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-black text-red-400 tracking-wider">
                  {successData.referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Reference"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                A verification link has also been registered under{' '}
                <strong className="text-slate-300">{successData.email}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/complaint/track?ref=${encodeURIComponent(successData.referenceNumber)}&email=${encodeURIComponent(successData.email)}`}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-2"
              >
                Track Status Now <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setFormData({
                    fullName: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    category: 'Incorrect News',
                    subject: '',
                    description: '',
                    relatedNewsUrl: '',
                    attachmentUrl: '',
                  });
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all border border-slate-700"
              >
                Submit Another Grievance
              </button>
            </div>
          </div>
        ) : (
          /* Complaint Form */
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6"
          >
            {error && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            {/* Row 2: Phone & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Phone Contact (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  autoComplete="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  Complaint Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                Subject / Issue Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                placeholder="Brief summary of the issue (e.g., Factual error in Article published on Oct 30)"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Row 4: Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  Detailed Description & Facts <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {formData.description.length} chars
                </span>
              </div>
              <textarea
                name="description"
                rows={5}
                required
                placeholder="Explain the grievance clearly, including dates, names, specific sentences or claims being disputed, and expected correction/remedy..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Row 5: Related News URL & Attachment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Related News Article URL (Optional)
                </label>
                <input
                  type="url"
                  name="relatedNewsUrl"
                  placeholder="https://seemanchalexpress.in/news/..."
                  value={formData.relatedNewsUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Supporting Document Link (Drive/Cloud URL, Optional)
                </label>
                <input
                  type="url"
                  name="attachmentUrl"
                  placeholder="https://drive.google.com/... or public doc link"
                  value={formData.attachmentUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <p className="leading-relaxed">
                <strong className="text-slate-300 font-semibold">Statutory Declaration:</strong> I hereby declare that the facts stated in this grievance are true to the best of my knowledge and that this submission is made in good faith without frivolous or malicious intent.
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-slate-500">
                Expected resolution timeframe: 7 to 15 working days.
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>Logging Grievance...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Register Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

