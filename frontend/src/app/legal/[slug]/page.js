import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  Shield,
  Calendar,
  Clock,
  Printer,
  ChevronLeft,
  List,
  AlertCircle,
  ExternalLink,
  Scale,
  FileCheck,
} from 'lucide-react';
import PrintButton from './PrintButton';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005').replace(/\/api\/?$/, '');

export const dynamic = 'force-dynamic';

// Dynamic SEO metadata
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_BASE}/api/legal/view/${params.slug}`, {
      cache: 'no-store',
    });
    const data = await res.json();

    if (!data.success || !data.document) {
      return {
        title: 'Document Not Found | Seemanchal Express',
        description: 'The requested legal document could not be found or is not published.',
      };
    }

    const doc = data.document;
    const title = `${doc.title} | Seemanchal Express Legal`;
    const description = doc.summary || `${doc.title} policy and guidelines for Seemanchal Express.`;
    const canonicalUrl = `https://seemanchalexpress.in/legal/${doc.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'article',
        publishedTime: doc.publishedAt,
        modifiedTime: doc.lastUpdated,
      },
    };
  } catch (e) {
    return {
      title: 'Legal Policy | Seemanchal Express',
    };
  }
}

// Extract Table of Contents from markdown text
const extractHeadings = (markdownText) => {
  if (!markdownText) return [];
  const lines = markdownText.split('\n');
  const headings = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length; // 2 for h2, 3 for h3
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[\*_`]/g, '');
      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      headings.push({ level, text: cleanText, id });
    }
  });

  return headings;
};

export default async function LegalDocumentPage({ params }) {
  let doc = null;

  try {
    const res = await fetch(`${API_BASE}/api/legal/view/${params.slug}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.success && data.document) {
      doc = data.document;
    }
  } catch (err) {
    console.error('Error fetching legal document:', err);
  }

  if (!doc) {
    notFound();
  }

  const headings = extractHeadings(doc.content);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          nav, footer, .no-print {
            display: none !important;
          }
          .print-full-width {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .legal-content h1, .legal-content h2, .legal-content h3 {
            color: #000000 !important;
          }
          .legal-content p, .legal-content li, .legal-content td {
            color: #111111 !important;
          }
          .legal-content table {
            border-color: #333333 !important;
          }
          .legal-content th, .legal-content td {
            border-color: #666666 !important;
            color: #000000 !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8 print-full-width">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="no-print flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/legal" className="hover:text-white transition-colors">
              Legal & Policies
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-none">
              {doc.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <PrintButton />
            <Link
              href="/legal"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Policies
            </Link>
          </div>
        </div>

        {/* Document Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60">
              {doc.category} Policy
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Version {doc.version || 1}.0
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Active Legal Record
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {doc.title}
          </h1>

          {doc.summary && (
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed border-l-2 border-red-600 pl-4 py-0.5">
              {doc.summary}
            </p>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Effective Date:{' '}
                <strong className="text-slate-200 font-medium">
                  {new Date(doc.effectiveDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Last Updated:{' '}
                <strong className="text-slate-200 font-medium">
                  {new Date(doc.lastUpdated || doc.effectiveDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar TOC (Desktop) + Main Document Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents Sticky Sidebar */}
          {headings.length > 0 && (
            <aside className="no-print lg:col-span-1 hidden lg:block">
              <div className="sticky top-6 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                  <List className="w-4 h-4 text-red-500" />
                  Table of Contents
                </div>
                <nav className="space-y-1 text-xs">
                  {headings.map((h, idx) => (
                    <a
                      key={idx}
                      href={`#${h.id}`}
                      className={`block py-1 hover:text-red-400 transition-colors truncate ${
                        h.level === 3
                          ? 'pl-3 text-slate-400 hover:text-slate-200 text-[11px]'
                          : 'text-slate-300 font-medium'
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Markdown Content Area */}
          <main
            className={`${
              headings.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'
            } p-6 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl legal-content`}
          >
            {/* Inline Table of Contents for Mobile */}
            {headings.length > 0 && (
              <div className="no-print lg:hidden mb-8 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <List className="w-3.5 h-3.5 text-red-400" /> On This Page
                </span>
                <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc">
                  {headings.slice(0, 8).map((h, idx) => (
                    <li key={idx}>
                      <a href={`#${h.id}`} className="hover:text-red-400 transition-colors">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Markdown Body */}
            <article className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl sm:text-3xl font-black text-white mt-8 mb-4 border-b border-slate-800 pb-3" {...props} />
                  ),
                  h2: ({ node, ...props }) => {
                    const text = props.children?.toString() || '';
                    const id = text
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h2
                        id={id}
                        className="text-xl sm:text-2xl font-bold text-white mt-8 mb-3 scroll-mt-6 border-l-4 border-red-600 pl-3"
                        {...props}
                      />
                    );
                  },
                  h3: ({ node, ...props }) => {
                    const text = props.children?.toString() || '';
                    const id = text
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h3
                        id={id}
                        className="text-lg font-bold text-slate-100 mt-6 mb-2 scroll-mt-6"
                        {...props}
                      />
                    );
                  },
                  p: ({ node, ...props }) => (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-300 mb-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-slate-300 mb-4" {...props} />
                  ),
                  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-red-600 pl-4 py-1 italic bg-slate-950/60 rounded-r-lg text-slate-300 my-4"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6 rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-300 divide-y divide-slate-800" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-slate-950 text-white font-bold uppercase tracking-wider text-[11px]" {...props} />
                  ),
                  th: ({ node, ...props }) => <th className="p-3 sm:p-4 font-bold" {...props} />,
                  td: ({ node, ...props }) => <td className="p-3 sm:p-4 border-t border-slate-800" {...props} />,
                  a: ({ node, ...props }) => (
                    <a className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors font-medium" {...props} />
                  ),
                  strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-6 border-slate-800" {...props} />,
                }}
              >
                {doc.content}
              </ReactMarkdown>
            </article>

            {/* Bottom Inquiries / Grievance Redressal Banner */}
            <div className="no-print mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Scale className="w-4 h-4 text-red-500" />
                  Questions or Grievances regarding this policy?
                </h4>
                <p className="text-xs text-slate-400">
                  Contact our Institutional Grievance Redressal Desk or submit a verified inquiry.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/complaint"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow"
                >
                  File a Grievance
                </Link>
                <Link
                  href="/legal"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700"
                >
                  All Policies
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

