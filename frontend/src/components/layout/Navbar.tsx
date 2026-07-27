'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { fetchApi } from '@/lib/api';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchApi<User>('/auth/me')
      .then(setUser)
      .catch(() => {
        // Auth redirect handles failures
      });
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      {user && (
        <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-2xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left pr-1">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize leading-tight">{user.role} &bull; {user.email}</p>
          </div>
        </div>
      )}
    </header>
  );
};
