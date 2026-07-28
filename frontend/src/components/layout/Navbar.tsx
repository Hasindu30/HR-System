'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { fetchApi } from '@/lib/api';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchApi<User>('/auth/me')
      .then(setUser)
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {user && (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium capitalize leading-tight">{user.role}</p>
          </div>
        </div>
      )}
    </header>
  );
};
