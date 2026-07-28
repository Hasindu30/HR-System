'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const data = await fetchApi<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-600/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-slate-700/20 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-extrabold tracking-tight">PW</span>
            </div>
            <div>
              <p className="text-white font-extrabold leading-tight">HRM System</p>
              <p className="text-slate-400 text-xs mt-0.5">People Workspace</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Managing people,<br />
            <span className="text-blue-500">thoughtfully.</span>
          </h2>
          <p className="text-slate-400 text-sm mt-5 leading-relaxed max-w-xs">
            A clean, human-centered workspace for HR teams to manage employees, payroll, and organizational structure.
          </p>
        </div>

        <div className="relative z-10 space-y-3.5">
          {[
            'Employee directory & onboarding',
            'Department & position management',
            'Payroll calculation & tracking',
            'Secure document file management',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-slate-400 text-sm">
              <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">PW</span>
            </div>
            <p className="font-extrabold text-slate-800">HRM System</p>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb] mb-2">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sign In</h1>
            <p className="text-sm text-slate-400 mt-1.5">Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <svg className="w-4 h-4 shrink-0 mt-0.5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" type="email" label="Email address" placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" type="password" label="Password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#2563eb] hover:text-blue-700 font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
