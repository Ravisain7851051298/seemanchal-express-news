'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import api from '../../lib/api';

export default function LegalAgreementAcceptanceModal({ token, userRole = 'reporter', onAllAccepted, onClose }) {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [fullDoc, setFullDoc] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkPendingAgreements();
  }, []);

  const checkPendingAgreements = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/legal/acceptance/my-pending');
      const data = res.data;
      if (data.success && data.pendingDocuments && data.pendingDocuments.length > 0) {
        setPendingDocs(data.pendingDocuments);
        loadDocDetails(data.pendingDocuments[0].slug);
      } else {
        setPendingDocs([]);
        if (onAllAccepted) onAllAccepted();
      }
    } catch (err) {
      console.error('Failed to check mandatory agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocDetails = async (slug) => {
    try {
      const res = await api.get(`/legal/view/${slug}`);
      const data = res.data;
      if (data.success && data.document) {
        setFullDoc(data.document);
      }
    } catch (err) {
      console.error('Failed to load document content:', err);
    }
  };

  const handleAccept = async (docId) => {
    try {
      setAccepting(true);
      setError('');
      const res = await api.post(`/legal/acceptance/${docId}`);
      const data = res.data;
      if (data.success) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < pendingDocs.length) {
          setCurrentIndex(nextIndex);
          loadDocDetails(pendingDocs[nextIndex].slug);
        } else {
          setPendingDocs([]);
          if (onAllAccepted) onAllAccepted();
        }
      } else {
        setError(data.message || 'Failed to record acceptance.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error while recording acceptance.');
    } finally {
      setAccepting(false);
    }
  };

  if (dismissed || loading || pendingDocs.length === 0) {
    return null;
  }

  const currentDoc = pendingDocs[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-red-600/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> Mandatory Legal Compliance
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Action Required: Review & Accept Agreement
            </h3>
            <p className="text-xs text-slate-400">
              Document {currentIndex + 1} of {pendingDocs.length} required for your {userRole} role.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              if (onClose) onClose();
            }}
            title="Review Later in Profile"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Document Review */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-300 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-bold text-white">{currentDoc.title}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={`/legal/${currentDoc.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Open and read full policy page in a new window"
                >
                  <span>Open Full Policy (नीति पढ़ें)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">
                  Version {currentDoc.version || 1}.0
                </span>
              </div>
            </div>
            {currentDoc.summary && (
              <p className="text-xs text-slate-400 leading-relaxed">{currentDoc.summary}</p>
            )}
            <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 border-t border-slate-900">
              <span>Related Essential Links:</span>
              <a
                href="/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline font-semibold inline-flex items-center gap-1"
              >
                <span>Privacy Policy (गोपनीयता नीति)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href="/legal/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline font-semibold inline-flex items-center gap-1"
              >
                <span>Terms &amp; Conditions (नियम व शर्तें)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Full content if loaded */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 max-h-72 overflow-y-auto space-y-3 prose prose-invert max-w-none text-xs leading-relaxed">
            {fullDoc ? (
              <ReactMarkdown>{fullDoc.content}</ReactMarkdown>
            ) : (
              <div className="py-8 text-center text-slate-500 animate-pulse">
                Loading document content...
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/50 text-[11px] text-slate-400 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              By clicking <strong className="text-white">"I Accept this Agreement"</strong>, you acknowledge that you have read, understood, and agreed to adhere strictly to all provisions set forth herein. Your digital acceptance will be recorded in compliance with IT Act Section 10A.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <span className="text-[11px] text-slate-500">
            Acceptance is mandatory to access panel tools.
          </span>
          <button
            type="button"
            disabled={accepting}
            onClick={() => handleAccept(currentDoc._id)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/60 flex items-center gap-2 disabled:opacity-50"
          >
            {accepting ? (
              'Recording Acceptance...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> I Accept this Agreement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

