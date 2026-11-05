'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Award,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

const COMMITTEE_STRUCTURE = [
  {
    key: 'National',
    badge: 'Tier A',
    title: 'A. National Executive Committee',
    description: 'Apex national leadership steering strategic vision, institutional policies, and nationwide governance.',
    standardPositions: [
      { role: 'Nation Correspondence', seats: '1' },
      { role: 'National Vice Presidents', seats: '2' },
      { role: 'National General Secretary', seats: '1' },
      { role: 'National Joint Secretaries', seats: '2' },
      { role: 'National Organization Secretary', seats: '1' },
      { role: 'National Treasurer', seats: '1' },
      { role: 'National Program Coordinator', seats: '1' },
      { role: 'National Membership Coordinator', seats: '1' },
      { role: 'National Media & Communication Coordinator', seats: '1' },
      { role: 'National Women’s Coordinator', seats: '1' },
      { role: 'National Youth Coordinator', seats: '1' },
      { role: 'National Executive Members', seats: '5–11' },
      { role: 'Advisory Board', seats: 'As needed' },
    ],
  },
  {
    key: 'State',
    badge: 'Tier B',
    title: 'B. State Executive Committee (Bihar)',
    description: 'State leadership managing regional operations, chapter coordination, and provincial representation.',
    standardPositions: [
      { role: 'State President', seats: '1' },
      { role: 'State Vice President', seats: '1–2' },
      { role: 'State General Secretary', seats: '1' },
      { role: 'State Joint Secretary', seats: '1–2' },
      { role: 'State Organization Secretary', seats: '1' },
      { role: 'State Treasurer', seats: '1' },
      { role: 'State Program Coordinator', seats: '1' },
      { role: 'State Membership Coordinator', seats: '1' },
      { role: 'State Women’s Coordinator', seats: '1' },
      { role: 'State Youth Coordinator', seats: '1' },
      { role: 'State Media Coordinator', seats: '1' },
      { role: 'State Executive Members', seats: '5–9' },
    ],
  },
  {
    key: 'District',
    badge: 'Tier C',
    title: 'C. District Executive Committee',
    description: 'District level committees driving grassroots engagement across Kishanganj, Purnea, Katihar, and Araria.',
    standardPositions: [
      { role: 'District President', seats: '1' },
      { role: 'District Vice President', seats: '1' },
      { role: 'District General Secretary', seats: '1' },
      { role: 'District Joint Secretary', seats: '1' },
      { role: 'District Organization Secretary', seats: '1' },
      { role: 'District Treasurer', seats: '1' },
      { role: 'District Program Coordinator', seats: '1' },
      { role: 'District Membership Coordinator', seats: '1' },
      { role: 'District Women’s Coordinator', seats: '1' },
      { role: 'District Youth Coordinator', seats: '1' },
      { role: 'District Executive Members', seats: '3–7' },
    ],
  },
  {
    key: 'Block',
    badge: 'Tier D',
    title: 'D. Block / Taluka Committee',
    description: 'Block coordinators facilitating public outreach, civic monitoring, and block-level administration.',
    standardPositions: [
      { role: 'Block President', seats: '1' },
      { role: 'Block Vice President', seats: '1' },
      { role: 'Block Secretary', seats: '1' },
      { role: 'Block Joint Secretary', seats: '1' },
      { role: 'Block Treasurer', seats: '1, if needed' },
      { role: 'Block Organization Coordinator', seats: '1' },
      { role: 'Block Program Coordinator', seats: '1' },
      { role: 'Block Membership Coordinator', seats: '1' },
      { role: 'Women’s / Youth Coordinators', seats: '1 each' },
      { role: 'Block Executive Members', seats: '3–5' },
    ],
  },
  {
    key: 'Panchayat',
    badge: 'Tier E',
    title: 'E. Gram Panchayat Committee',
    description: 'Panchayat leaders and youth coordinators connecting village communities and local civic works.',
    standardPositions: [
      { role: 'Panchayat President / Coordinator', seats: '1' },
      { role: 'Deputy Coordinator', seats: '1' },
      { role: 'Panchayat Secretary', seats: '1' },
      { role: 'Assistant Secretary', seats: '1' },
      { role: 'Treasurer', seats: '1, if needed' },
      { role: 'Education & Health Coordinator', seats: '1' },
      { role: 'Women’s Coordinator', seats: '1' },
      { role: 'Youth Coordinator', seats: '1' },
      { role: 'Executive Members', seats: '3–5' },
      { role: 'Volunteers', seats: 'As required' },
    ],
  },
  {
    key: 'Ward',
    badge: 'Tier F',
    title: 'F. Ward Committee',
    description: 'Ward representatives and neighborhood coordinators active at the urban ward and mohalla level.',
    standardPositions: [
      { role: 'Ward In-charge / President', seats: '1' },
      { role: 'Ward Secretary', seats: '1' },
      { role: 'Assistant Secretary', seats: '1, if needed' },
      { role: 'Membership Coordinator', seats: '1' },
      { role: 'Women’s / Youth Coordinator', seats: 'As needed' },
      { role: 'Executive Members', seats: '2–5' },
      { role: 'Volunteers', seats: 'As required' },
    ],
  },
  {
    key: 'Press',
    badge: 'Press Corps',
    title: 'Editorial & Field Reporting Team',
    description: 'Accredited journalists, bureau chiefs, and ground correspondents of Seemanchal Express.',
    standardPositions: [
      { role: 'Chief Bureau / Senior Reporter', seats: 'Open' },
      { role: 'District Bureau Chief', seats: 'Open' },
      { role: 'Special Correspondent', seats: 'Open' },
      { role: 'Field Reporter / Correspondent', seats: 'Open' },
    ],
  },
];

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [teamData, setTeamData] = useState({ hierarchy: {}, allMembers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/team');
        if (res.data.success) {
          setTeamData(res.data);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const displayedCommittees =
    activeTab === 'All'
      ? COMMITTEE_STRUCTURE
      : COMMITTEE_STRUCTURE.filter((c) => c.key === activeTab);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white py-12 px-4 sm:px-8 border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-amber-300 border border-red-500/40 text-xs font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            Executive Leadership & Committees
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Organizational Committees & Appointed Officers
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto">
            The organizational framework of Seemanchal Express spans from National apex governance to State, District, Block, Panchayat, and Ward levels. Only officially appointed and verified officers are displayed here.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/apply-member"
              className="text-xs font-bold px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors"
            >
              Apply for Membership
            </Link>
            <Link
              href="/verify"
              className="text-xs font-bold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg shadow transition-colors"
            >
              Verify Digital Credentials
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* Committee Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-200">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'All'
                ? 'bg-red-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            All Committees
          </button>
          {COMMITTEE_STRUCTURE.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveTab(c.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === c.key
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              {c.badge} - {c.key}
            </button>
          ))}
        </div>

        {/* Committee Sections */}
        <div className="space-y-12 mt-8">
          {displayedCommittees.map((comm) => {
            const appointedMembers = teamData.hierarchy[comm.key]?.members || [];

            return (
              <section
                key={comm.key}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Committee Header */}
                <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="inline-block bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase mb-2">
                      {comm.badge}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{comm.title}</h2>
                    <p className="text-xs text-slate-300 mt-1">{comm.description}</p>
                  </div>
                  <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300">
                    Active Members: <strong>{appointedMembers.length}</strong>
                  </div>
                </div>

                {/* Approved Members Cards Grid */}
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Appointed Officers & Representatives
                  </h3>

                  {appointedMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {appointedMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-red-400 hover:shadow-md transition-all flex flex-col items-center text-center group"
                        >
                          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-red-500 shadow-sm">
                            <img
                              src={getMediaUrl(m.photo)}
                              alt={m.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase mb-1">
                            {m.assignedDesignation || 'Member'}
                          </span>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {m.name}
                          </h4>

                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {m.assignedLocation || 'Seemanchal Region'}
                          </p>

                          {m.bio && (
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                              &ldquo;{m.bio}&rdquo;
                            </p>
                          )}

                          <div className="mt-3 pt-3 border-t border-slate-200 w-full flex items-center justify-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Official Verified Member
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Applications and vetting for this committee are currently in progress. Appointed leaders will be published here post-approval.
                      </span>
                    </div>
                  )}

                  {/* Standard Committee Structure Reference */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Sanctioned Committee Positions & Seats
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                      {comm.standardPositions.map((pos, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-2.5 rounded bg-slate-100/70 border border-slate-200 text-left"
                        >
                          <div className="font-semibold text-slate-800 leading-tight">
                            {pos.role}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Seats: <strong className="text-red-700">{pos.seats}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
