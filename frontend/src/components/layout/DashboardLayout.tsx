'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { fetchApi } from '@/lib/api';
import { User } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchApi<User>('/auth/me')
      .then(setUser)
      .catch(() => {});
  }, []);

  // Map route to title & subtitle
  const getHeaderInfo = () => {
    if (pathname.startsWith('/dashboard')) {
      return { title: 'Dashboard Overview', subtitle: 'Workforce statistics and organization summary' };
    }
    if (pathname.startsWith('/employees')) {
      return { title: 'People Directory', subtitle: 'Manage active workforce profiles and documents' };
    }
    if (pathname.startsWith('/departments')) {
      return { title: 'Departments', subtitle: 'Organizational units and department structures' };
    }
    if (pathname.startsWith('/positions')) {
      return { title: 'Positions', subtitle: 'Job roles, ranks, and hierarchy mappings' };
    }
    if (pathname.startsWith('/payroll')) {
      return { title: 'Payroll Workspace', subtitle: 'Disbursements, compensation, and summary logs' };
    }
    return { title: 'HRM System', subtitle: 'Human Resource Management' };
  };

  const { title, subtitle } = getHeaderInfo();

  // Get current date string: "Friday, December 15th 2023" style
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const userInitials = user ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'HR';

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#f3f5f9] p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 lg:h-full lg:overflow-y-auto pr-1">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-800 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {getFormattedDate()}
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Search Icon button */}
            <button aria-label="Search" className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notification Badge button */}
            <button aria-label="Notifications" className="relative w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User profile dropdown container */}
            {user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center text-sm font-extrabold shadow-inner shrink-0">
                  {userInitials}
                </div>
                <div className="hidden md:block min-w-0 text-left">
                  <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mt-0.5">
                    {user.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 flex flex-col min-w-0 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};
