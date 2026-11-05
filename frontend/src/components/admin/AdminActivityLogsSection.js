'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import api from '../../lib/api';

const MODULES = [
  { value: 'all', label: 'All Modules' },
  { value: 'legal', label: 'Legal & Policies' },
  { value: 'reporter', label: 'Reporter Desk' },
  { value: 'membership', label: 'Membership' },
  { value: 'complaint', label: 'Grievance Desk' },
  { value: 'news', label: 'News Editorial' },
  { value: 'user', label: 'User Admin' },
];

export default function AdminActivityLogsSection() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs(page);
  }, [moduleFilter, page]);

  const fetchLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 25,
      });
      if (moduleFilter !== 'all') params.append('module', moduleFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/admin/activity-logs?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setPage(res.data.page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action = '', mod = '') => {
    if (action.includes('SUSPEND') || action.includes('DELETE') || action.includes('REJECT')) {
      return 'bg-red-950 text-red-400 border-red-800';
    }
    if (action.includes('RENEW') || action.includes('RESOLVE') || action.includes('CREATE') || action.includes('ACTIVATE')) {
      return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
    if (action.includes('UPDATE') || action.includes('REVIEW')) {
      return 'bg-amber-950 text-amber-400 border-amber-800';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Administrative Activity Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of sensitive actions across legal policies, journalist suspensions, membership renewals, and grievance resolutions.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Logged Events
          </span>
          <span className="text-2xl font-black text-white">{total}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-1 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
          >
            {MODULES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, administrator, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  fetchLogs(1);
                }
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setPage(1);
            fetchLogs(1);
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
        >
          Filter Logs
        </button>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No activity logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Details / Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Admin */}
                    <td className="py-3 px-4 font-sans">
                      <span className="font-bold text-white block">{log.adminName || 'Admin'}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {log.adminEmail}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadgeColor(
                          log.action,
                          log.module
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="py-3 px-4 uppercase text-slate-400 font-bold font-sans">
                      {log.module}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-md">
                      {log.details ? (
                        <div className="text-[11px] leading-relaxed truncate">
                          {Object.entries(log.details)
                            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                            .join(' • ')}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages} ({total} total records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

