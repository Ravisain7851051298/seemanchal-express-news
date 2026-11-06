'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MessageSquare,
  Search,
  Trash2,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../lib/api';
import { setInquiries, removeInquiryItem } from '../../store/slices/adminSlice';

export default function InquiriesSection() {
  const dispatch = useDispatch();
  const { inquiries } = useSelector((state) => state.admin);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contact');
      if (res.data?.success) {
        dispatch(setInquiries(res.data.inquiries));
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await api.delete(`/contact/${id}`);
      if (res.data?.success) {
        dispatch(removeInquiryItem(id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = inq.name?.toLowerCase().includes(q);
      const matchEmail = inq.email?.toLowerCase().includes(q);
      const matchSub = inq.subject?.toLowerCase().includes(q);
      const matchMsg = inq.message?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSub && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Incoming Inquiries & Whistleblower Tips
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Public messages, editorial story suggestions, and grievance tips sent via the contact desk.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search message text, sender, email..."
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 w-64 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading messages...</div>
        ) : filteredInquiries.length > 0 ? (
          <div className="space-y-3">
            {filteredInquiries.map((inq) => (
              <div
                key={inq._id || inq.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <strong className="text-white text-sm block">{inq.name}</strong>
                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-sky-400" />
                        <a href={`mailto:${inq.email}`} className="hover:underline text-slate-300">
                          {inq.email}
                        </a>
                      </span>
                      {inq.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <a href={`tel:${inq.phone}`} className="hover:underline text-slate-300">
                            {inq.phone}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ''}
                    </span>
                    <button
                      onClick={() => handleDeleteInquiry(inq._id || inq.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/50"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-bold text-red-400 mb-1.5 text-xs">
                  Subject: <span className="text-white">{inq.subject}</span>
                </div>

                <p className="text-slate-300 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700 font-sans whitespace-pre-wrap">
                  {inq.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No inquiries or messages found.
          </div>
        )}
      </div>
    </div>
  );
}
