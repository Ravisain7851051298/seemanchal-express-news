'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import AnalyticsDashboardGraphs from '../../components/admin/AnalyticsDashboardGraphs';

function AdminOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, newsList, categories } = useSelector((state) => state.admin);

  // Backward compatibility with legacy ?tab= query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== 'analytics' && tab !== 'overview') {
      const tabMap = {
        applications: '/admin/applications',
        reporters: '/admin/reporters',
        membership: '/admin/membership',
        members: '/admin/members',
        news: '/admin/news',
        categories: '/admin/categories',
        positions: '/admin/positions',
        complaints: '/admin/complaints',
        legal: '/admin/legal',
        inquiries: '/admin/inquiries',
        activity: '/admin/activity-logs',
        settings: '/admin/settings',
        security: '/admin/security',
      };
      if (tabMap[tab]) {
        router.replace(tabMap[tab]);
      }
    }
  }, [searchParams, router]);

  return (
    <div className="space-y-4">
      <AnalyticsDashboardGraphs
        stats={stats}
        newsList={newsList}
        categories={categories}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading overview...</div>}>
      <AdminOverviewContent />
    </Suspense>
  );
}
