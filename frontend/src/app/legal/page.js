'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  FileText,
  Scale,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_LABELS = {
  all: 'All Policies',
  editorial: 'Editorial & Reporting',
  compliance: 'Legal & Compliance',
  agreements: 'Agreements & Terms',
  conduct: 'Codes of Conduct',
  commercial: 'Commercial & Ads',
  general: 'General Policies',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005').replace(/\/api\/?$/, '');

export default function LegalHubPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`${API_BASE}/api/legal?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setError(data.message || 'Failed to fetch legal documents');
      }
    } catch (err) {
      setError('Could not connect to the document server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.summary && doc.summary.toLowerCase().includes(q)) ||
      doc.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Institutional Governance & Legal Standards
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Legal, Editorial & Policy Framework
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Seemanchal Express operates under strict journalistic ethics, statutory digital media regulations, and transparent member-reporter governance. Explore all official policies, codes of conduct, and grievance protocols below.
          </p>
        </div>

        {/* Grievance & Tracking Quick Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600/20 rounded-xl text-red-400 shrink-0 mt-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Have a Complaint or Grievance?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Submit editorial complaints, copyright inquiries, or content removal requests directly to our Legal Redressal Cell.
              </p>
              <Link
                href="/complaint"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 mt-2.5 transition-colors"
              >
                Submit Grievance Form <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 shrink-0 mt-1">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Track Existing Grievance</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Check real-time review status, ombudsman remarks, and official decisions using your unique Reference Number.
              </p>
              <Link
                href="/complaint/track"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 mt-2.5 transition-colors"
              >
                Track Status Online <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policies by keyword (e.g., privacy, reporter, copyright)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow"
            >
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === key
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-slate-900 border border-slate-800 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 w-24 bg-slate-800 rounded"></div>
                <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-3 w-full bg-slate-800 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-950/40 border border-red-800/60 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-300 font-medium">{error}</p>
            <button
              onClick={fetchDocuments}
              className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No documents match your query</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your search terms or selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <Link
                key={doc._id}
                href={`/legal/${doc.slug}`}
                className="group p-6 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/60 group-hover:bg-red-950/60 group-hover:text-red-400 group-hover:border-red-800/40 transition-colors">
                      {doc.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      v{doc.version || 1}.0
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                    <span>{doc.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {doc.summary || 'Read full terms, conditions, and operational framework.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Updated:{' '}
                    {new Date(doc.lastUpdated || doc.effectiveDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-red-400 font-bold group-hover:underline">
                    Read Document &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Institutional Contact Footnote */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              All documents are legally binding under the Information Technology Act, 2000 & the Digital Media Ethics Code.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/about" className="hover:text-white transition-colors">
              About Us
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Desk
            </Link>
            <span>•</span>
            <Link href="/verify" className="hover:text-white transition-colors">
              ID Card Verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

