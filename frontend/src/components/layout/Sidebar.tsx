'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { User } from '@/types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Employees',
    path: '/employees',
    icon: (
      <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Departments',
    path: '/departments',
    icon: (
      <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
      </svg>
    ),
  },
  {
    name: 'Positions',
    path: '/positions',
    icon: (
      <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const FINANCIAL_ITEMS: NavItem[] = [
  {
    name: 'Payroll',
    path: '/payroll',
    icon: (
      <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [totalEmps, setTotalEmps] = useState<number>(0);

  useEffect(() => {
    // Fetch total employees count to update active workspace stats at the bottom sidebar
    fetchApi<{ total_employees?: number }>('/dashboard/stats')
      .then((res) => {
        if (res.total_employees !== undefined) {
          setTotalEmps(res.total_employees);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const renderLink = (item: NavItem) => {
    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 py-3 text-sm font-semibold tracking-tight transition-all ${
          isActive
            ? 'bg-blue-50/50 text-[#2563eb] border-l-4 border-[#2563eb] pl-3 pr-4 rounded-r-xl'
            : 'text-slate-400 hover:bg-slate-50/50 hover:text-slate-700 px-4 rounded-xl'
        }`}
      >
        <span className={isActive ? 'text-[#2563eb]' : 'text-slate-400 shrink-0'}>
          {item.icon}
        </span>
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white px-4 py-6">
      {/* Brand area matching DealDeck style */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563eb] to-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20 shrink-0">
          H
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-800 leading-tight tracking-tight">HRM Workspace</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Admin Store</p>
        </div>
      </div>

      {/* Nav Lists */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Menu category */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400/80 px-2 mb-2.5">
            Menu
          </p>
          <div className="space-y-1">
            {MENU_ITEMS.map(renderLink)}
          </div>
        </div>

        {/* Financial category */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400/80 px-2 mb-2.5">
            Financial
          </p>
          <div className="space-y-1">
            {FINANCIAL_ITEMS.map(renderLink)}
          </div>
        </div>
      </div>

      {/* Workspace active panel at bottom (matches Upgrade Pro look) */}
      <div className="mt-auto pt-6">
        <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-600/10 pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-500 text-white font-bold text-xs mb-2">
              i
            </span>
            <h4 className="text-xs font-bold text-white tracking-tight">Workspace Active</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Monitoring {totalEmps} employee profiles end-to-end.
            </p>
            <button
              onClick={handleLogout}
              className="w-full mt-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 px-3 rounded-lg shadow-sm shadow-blue-500/25 transition-all text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile navigation toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar drawer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Drawer backdrop and drawer content for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-slate-100 shadow-2xl overflow-hidden rounded-r-[24px]">
            {navContent}
          </aside>
        </div>
      )}

      {/* Sidebar for desktop, styled exactly like a nested panel card */}
      <aside className="hidden lg:block w-56 border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] shrink-0 overflow-hidden rounded-[24px] lg:h-full">
        {navContent}
      </aside>
    </>
  );
};
