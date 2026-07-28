'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { fetchApi } from '@/lib/api';
import { DashboardStats, Employee, Department } from '@/types';

// Palette mapping
const AVATAR_COLORS = [
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-rose-50 text-rose-600 border-rose-100',
];

function initials(e: Employee) {
  return `${e.first_name.charAt(0)}${e.last_name.charAt(0)}`.toUpperCase();
}

function getAvatarColor(idx: number) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

function formatCurrency(val: number) {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, empsRes, deptsRes] = await Promise.all([
        fetchApi<DashboardStats>('/dashboard/stats'),
        fetchApi<Employee[]>('/employees'),
        fetchApi<Department[]>('/departments'),
      ]);
      setStats(statsRes);
      setEmployees(empsRes);
      setDepartments(deptsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <svg className="animate-spin w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Syncing dashboard details…
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex justify-between items-center shadow-xs">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-bold text-xs">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const recent = stats?.recent_employees ?? [];

  // Compute actual metrics from live API data
  const totalEmployeesCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const onboardingCount = employees.filter((e) => e.status === 'ONBOARDING').length;
  const inactiveCount = employees.filter((e) => e.status === 'INACTIVE' || e.status === 'TERMINATED').length;

  // Department distribution calculation
  const deptCountMap: Record<string, number> = {};
  departments.forEach((d) => {
    deptCountMap[d.name] = 0;
  });
  employees.forEach((emp) => {
    if (emp.department?.name) {
      deptCountMap[emp.department.name] = (deptCountMap[emp.department.name] || 0) + 1;
    }
  });

  const departmentDistribution = Object.entries(deptCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxDeptEmployees = Math.max(...departmentDistribution.map((d) => d.count), 1);

  // Employment Type distribution calculation for the radial concentric ring
  const typeMap: Record<string, number> = { 'Full-Time': 0, 'Part-Time': 0, 'Contract': 0 };
  employees.forEach((emp) => {
    const type = emp.employment_type || 'Full-Time';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  const totalTypes = Object.values(typeMap).reduce((s, v) => s + v, 0) || 1;

  // Concentric ring rendering helper math (r values: 36, 28, 20)
  const ringConfigs = [
    { label: 'Full-Time', count: typeMap['Full-Time'], stroke: '#2563eb', r: 36 },
    { label: 'Part-Time', count: typeMap['Part-Time'], stroke: '#10b981', r: 28 },
    { label: 'Contract', count: typeMap['Contract'], stroke: '#f59e0b', r: 20 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Metric Cards Grid - Asymmetric Composition */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Primary High-Emphasis Metric (Total Employees) - Matches Total Sales card */}
          <div className="bg-[#2563eb] text-white rounded-[24px] p-6 shadow-lg shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden h-40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100">
                Workforce Hero
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-blue-100 font-semibold leading-none">Total Employees</p>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1">
                {totalEmployeesCount}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                  Active
                </span>
                <span className="text-[10px] text-blue-100 font-medium">
                  {activeCount} profiles fully operational
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Metric: Monthly Payroll */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-40 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Compensation
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16a34a] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Monthly Payroll</p>
              <h3 className="text-2xl font-extrabold tracking-tight mt-1 font-mono text-slate-800">
                ${formatCurrency(stats?.monthly_payroll_total ?? 0)}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[9px] font-bold bg-emerald-50 text-[#16a34a] px-1.5 py-0.5 rounded-md">
                  Real
                </span>
                <span className="text-[10px] text-slate-400 font-medium">calculated from current wages</span>
              </div>
            </div>
          </div>

          {/* Secondary Metric: Total Departments */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-40 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Business Units
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Departments</p>
              <h3 className="text-2xl font-extrabold tracking-tight mt-1 text-slate-800">
                {stats?.total_departments ?? 0}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[9px] font-bold bg-blue-50 text-[#2563eb] px-1.5 py-0.5 rounded-md">
                  Active
                </span>
                <span className="text-[10px] text-slate-400 font-medium">operational business segments</span>
              </div>
            </div>
          </div>

          {/* Secondary Metric: Total Positions */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-40 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Rank Hierarchy
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#f59e0b] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none">Job Positions</p>
              <h3 className="text-2xl font-extrabold tracking-tight mt-1 text-slate-800">
                {stats?.total_positions ?? 0}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[9px] font-bold bg-amber-50 text-[#f59e0b] px-1.5 py-0.5 rounded-md">
                  Active
                </span>
                <span className="text-[10px] text-slate-400 font-medium">defined roles and ranks</span>
              </div>
            </div>
          </div>

        </div>

        {/* Visual Charts Grid - Matching Composition layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visual: Department employee levels (Horizontal Bar chart style) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Staffing Ratios
                  </p>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">Employees by Department</h3>
                </div>
                <span className="text-[11px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md border border-slate-100">
                  Full Count
                </span>
              </div>

              {departmentDistribution.length > 0 ? (
                <div className="space-y-4 py-2">
                  {departmentDistribution.slice(0, 5).map((d) => {
                    const widthPct = (d.count / maxDeptEmployees) * 100;
                    return (
                      <div key={d.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700">{d.name}</span>
                          <span className="text-slate-400 font-bold">{d.count} {d.count === 1 ? 'employee' : 'employees'}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-50 border border-slate-100/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2563eb] to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No department assignments registered.
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Primary operational segments</span>
              <span className="text-[#2563eb]">Total: {departments.length} units</span>
            </div>
          </div>

          {/* Radial Concentric Ring Visual - Matches Product Statistic concentric arcs */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Workforce Types
              </p>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5 mb-6">Employment Allocation</h3>
              
              <div className="flex flex-col items-center justify-center relative my-2">
                <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Background tracks */}
                  <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f8fafc" strokeWidth="6" />
                  <circle cx="50" cy="50" r="28" fill="transparent" stroke="#f8fafc" strokeWidth="6" />
                  <circle cx="50" cy="50" r="20" fill="transparent" stroke="#f8fafc" strokeWidth="6" />

                  {/* Dynamic Arcs */}
                  {ringConfigs.map((ring, idx) => {
                    const pct = ring.count / totalTypes;
                    const ringCirc = 2 * Math.PI * ring.r;
                    const strokeDashoffset = ringCirc * (1 - pct);
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={ring.r}
                        fill="transparent"
                        stroke={ring.stroke}
                        strokeWidth="6"
                        strokeDasharray={ringCirc}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>

                {/* Center Stats overlay */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-800 leading-none">
                    {totalEmployeesCount}
                  </span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
                    Staff
                  </span>
                </div>
              </div>
            </div>

            {/* List breakdown legend below the concentric ring */}
            <div className="space-y-2.5 pt-4 border-t border-slate-50">
              {ringConfigs.map((ring) => {
                const pctVal = Math.round((ring.count / totalTypes) * 100);
                return (
                  <div key={ring.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ring.stroke }} />
                      <span className="text-slate-600 font-semibold">{ring.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 font-bold font-mono">{ring.count}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({pctVal}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Bottom row: Recent Employee entries + status metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recently Onboarded Employees */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Recently Onboarded
            </p>
            {recent.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recent.slice(0, 4).map((emp, idx) => (
                  <div key={emp.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl px-2 transition-all">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${getAvatarColor(idx)}`}>
                      {initials(emp)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {emp.department?.name ?? '—'} · {emp.position?.title ?? '—'}
                      </p>
                    </div>
                    <StatusBadge status={emp.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No onboarded employees currently registered.
              </div>
            )}
          </div>

          {/* Detailed status indicator card */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Operational Status
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Active Duty</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{activeCount} / {totalEmployeesCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(activeCount / totalEmployeesCount) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Onboarding Phase</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{onboardingCount} / {totalEmployeesCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(onboardingCount / totalEmployeesCount) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Inactive/Suspended</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{inactiveCount} / {totalEmployeesCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(inactiveCount / totalEmployeesCount) * 100}%` }} />
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live update complete
              </span>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
