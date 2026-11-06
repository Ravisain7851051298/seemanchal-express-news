'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Shield,
  BarChart3,
  FileCheck,
  Users,
  Award,
  MessageSquare,
  Newspaper,
  FolderPlus,
  Layers,
  History,
  Lock,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../lib/api';
import {
  setStats,
  setApplications,
  setUsers,
  setPositions,
  setAdminCategories,
  setAdminNewsList,
  setInquiries,
  setAdminLoading,
} from '../../store/slices/adminSlice';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { stats, applications, users, newsList, inquiries } = useSelector((state) => state.admin);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Access Control: Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.replace('/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Load all initial admin data
  useEffect(() => {
    if (user && user.role === 'admin') {
      const loadAdminData = async () => {
        dispatch(setAdminLoading(true));
        try {
          const [statsRes, appsRes, usersRes, posRes, catRes, newsRes, inqRes] = await Promise.allSettled([
            api.get('/admin/stats'),
            api.get('/admin/applications?status=pending'),
            api.get('/admin/users'),
            api.get('/positions'),
            api.get('/categories'),
            api.get('/admin/news'),
            api.get('/contact'),
          ]);

          if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
            dispatch(setStats(statsRes.value.data.stats));
          }
          if (appsRes.status === 'fulfilled' && appsRes.value.data?.success) {
            dispatch(setApplications(appsRes.value.data.applications));
          }
          if (usersRes.status === 'fulfilled' && usersRes.value.data?.success) {
            dispatch(setUsers(usersRes.value.data.users));
          }
          if (posRes.status === 'fulfilled' && posRes.value.data?.success) {
            dispatch(setPositions(posRes.value.data.positions));
          }
          if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
            dispatch(setAdminCategories(catRes.value.data.categories));
          }
          if (newsRes.status === 'fulfilled' && newsRes.value.data?.success) {
            dispatch(setAdminNewsList(newsRes.value.data.news));
          }
          if (inqRes.status === 'fulfilled' && inqRes.value.data?.success) {
            dispatch(setInquiries(inqRes.value.data.inquiries));
          }
        } catch (err) {
          console.error('Error fetching admin data:', err);
        } finally {
          dispatch(setAdminLoading(false));
        }
      };

      loadAdminData();
    }
  }, [user, dispatch]);

  if (authLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Verifying Administrative Access...</p>
      </div>
    );
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard Analytics',
      icon: BarChart3,
      iconColor: 'text-sky-400',
      badge: 'Graphs',
      badgeColor: 'bg-sky-500/20 text-sky-300 font-mono',
      exact: true,
    },
    {
      href: '/admin/applications',
      label: 'Application Reviews',
      icon: FileCheck,
      iconColor: 'text-emerald-400',
      badge: stats.totalPendingApplications > 0 ? stats.totalPendingApplications : null,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    },
    {
      href: '/admin/reporters',
      label: 'Reporter Management',
      icon: Users,
      iconColor: 'text-amber-400',
      badge: stats.suspendedReporters > 0 ? `${stats.suspendedReporters} susp` : null,
      badgeColor: 'bg-red-950 text-red-400 border border-red-800',
    },
    {
      href: '/admin/membership',
      label: 'Membership Control',
      icon: Award,
      iconColor: 'text-blue-400',
      badge: stats.expiredMemberships > 0 ? `${stats.expiredMemberships} exp` : null,
      badgeColor: 'bg-amber-950 text-amber-400 border border-amber-800',
    },
    {
      href: '/admin/complaints',
      label: 'Grievances & Complaints',
      icon: MessageSquare,
      iconColor: 'text-emerald-400',
      badge: stats.pendingComplaints > 0 ? stats.pendingComplaints : null,
      badgeColor: 'bg-red-600 text-white animate-pulse',
    },
    {
      href: '/admin/legal',
      label: 'Legal Documents',
      icon: FileCheck,
      iconColor: 'text-purple-400',
      badge: stats.totalLegalDocs || 15,
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      href: '/admin/news',
      label: 'Editorial & Submissions',
      icon: Newspaper,
      iconColor: 'text-red-400',
      badge: newsList.length,
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      href: '/admin/members',
      label: 'Team & Public Directory',
      icon: Users,
      iconColor: 'text-indigo-400',
      badge: users.filter((u) => u.role !== 'admin').length,
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      href: '/admin/categories',
      label: 'News Categories',
      icon: FolderPlus,
      iconColor: 'text-orange-400',
    },
    {
      href: '/admin/positions',
      label: 'Committee Positions',
      icon: Layers,
      iconColor: 'text-cyan-400',
    },
    {
      href: '/admin/inquiries',
      label: 'Public Inquiries',
      icon: MessageSquare,
      iconColor: 'text-teal-400',
      badge: inquiries.length,
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      href: '/admin/activity-logs',
      label: 'Activity Audit Logs',
      icon: History,
      iconColor: 'text-sky-400',
    },
    {
      href: '/admin/settings',
      label: 'Seal, Signature & Settings',
      icon: Award,
      iconColor: 'text-amber-400',
    },
    {
      href: '/admin/security',
      label: 'Admin Security',
      icon: Lock,
      iconColor: 'text-rose-400',
    },
  ];

  // Derive current page title
  const currentItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const pageTitle = currentItem?.label || 'Administration Control';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      {/* 1. Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800 z-50">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="Logo" className="h-8 w-auto rounded bg-white p-0.5" />
          <span className="font-bold text-xs text-white">Admin Desk</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. Admin Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 overflow-y-auto max-h-screen`}
      >
        <div>
          {/* Brand Logo */}
          <div className="pb-5 border-b border-slate-800 mb-6">
            <Link href="/" className="block p-0 m-0">
              <img
                src="/logo.jpeg"
                alt="Seemanchal Express"
                className="w-full h-auto max-h-20 object-contain rounded-lg bg-white p-1 block shadow-sm hover:opacity-95 transition-opacity"
              />
            </Link>
          </div>

          {/* Admin Identity Badge */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center font-bold text-sm shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-white truncate">{user?.name}</h3>
              <span className="text-[10px] text-red-400 font-bold block uppercase tracking-wide">
                Master Administrator
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.iconColor}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'bg-white/20 text-white font-bold' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 mt-6 border-t border-slate-800 space-y-2 text-xs shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Public News Portal</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content View Area */}
      <main className="flex-1 min-h-screen overflow-y-auto p-3 sm:p-5 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link href="/admin" className="hover:text-white">Admin</Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-white font-semibold">{pageTitle}</span>
            </div>
            <h1 className="text-xl font-black text-white">{pageTitle}</h1>
          </div>

          {/* Quick Jump Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pathname === '/admin'
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/reporters"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pathname.startsWith('/admin/reporters')
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Reporters</span>
            </Link>

            <Link
              href="/admin/membership"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pathname.startsWith('/admin/membership')
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Members</span>
            </Link>

            <Link
              href="/admin/complaints"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pathname.startsWith('/admin/complaints')
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Complaints</span>
            </Link>

            <Link
              href="/admin/legal"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pathname.startsWith('/admin/legal')
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Legal</span>
            </Link>

            <Link
              href="/admin/news"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pathname.startsWith('/admin/news')
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-red-500" />
              <span>News</span>
            </Link>
          </div>
        </div>

        {/* Content of Subroute */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}

