'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { fetchApi } from '@/lib/api';
import { Payroll, Employee, PaymentStatus } from '@/types';

const MONTHS = [
  { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
  { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
  { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
  { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 },
];
const PAYMENT_STATUSES = [
  { label: 'PENDING', value: 'PENDING' },
  { label: 'PAID', value: 'PAID' },
  { label: 'FAILED', value: 'FAILED' },
];

function fmtMoney(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }
function monthName(n: number) { return MONTHS.find((m) => m.value === n)?.label ?? n; }

export default function PayrollPage() {
  const { showToast } = useToast();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [basicSalary, setBasicSalary] = useState<number | ''>('');
  const [allowances, setAllowances] = useState<number | ''>(0);
  const [deductions, setDeductions] = useState<number | ''>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState('');

  const [deletingPayroll, setDeletingPayroll] = useState<Payroll | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pData, eData] = await Promise.all([
        fetchApi<Payroll[]>('/payrolls'),
        fetchApi<Employee[]>('/employees'),
      ]);
      setPayrolls(pData); setEmployees(eData);
    } catch (err: any) { setError(err.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleEmpChange = (id: number) => {
    setEmployeeId(id);
    if (formErrors.employee_id) setFormErrors({ ...formErrors, employee_id: '' });
    const emp = employees.find((e) => e.id === id);
    if (emp) setBasicSalary(emp.basic_salary);
  };

  const openCreate = () => {
    setEditingPayroll(null);
    const firstId = employees.length > 0 ? employees[0].id : '';
    setEmployeeId(firstId);
    if (firstId) handleEmpChange(Number(firstId));
    else setBasicSalary(0);
    setMonth(new Date().getMonth() + 1); setYear(new Date().getFullYear());
    setAllowances(0); setDeductions(0); setPaymentStatus('PENDING');
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const openEdit = (p: Payroll) => {
    setEditingPayroll(p); setEmployeeId(p.employee_id); setMonth(p.month); setYear(p.year);
    setBasicSalary(p.basic_salary); setAllowances(p.allowances); setDeductions(p.deductions);
    setPaymentStatus(p.payment_status);
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPayroll) return;
    setDeleting(true);
    try {
      await fetchApi(`/payrolls/${deletingPayroll.id}`, { method: 'DELETE' });
      showToast('Payroll record deleted', 'success');
      setDeletingPayroll(null); load();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    finally { setDeleting(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!employeeId) errs.employee_id = 'Employee is required';
    if (basicSalary === '' || Number(basicSalary) < 0) errs.basic_salary = 'Valid salary required';
    if (allowances === '' || Number(allowances) < 0) errs.allowances = 'Valid allowances required';
    if (deductions === '' || Number(deductions) < 0) errs.deductions = 'Valid deductions required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError('');
    if (!validate()) return;
    setSubmitting(true);
    const body = {
      employee_id: Number(employeeId), month: Number(month), year: Number(year),
      basic_salary: Number(basicSalary), allowances: Number(allowances), deductions: Number(deductions),
      payment_status: paymentStatus,
    };
    try {
      if (editingPayroll) {
        await fetchApi(`/payrolls/${editingPayroll.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        showToast('Payroll updated', 'success');
      } else {
        await fetchApi('/payrolls', { method: 'POST', body: JSON.stringify(body) });
        showToast('Payroll record created', 'success');
      }
      setIsModalOpen(false); load();
    } catch (err: any) { setModalError(err.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const calcNet = (Number(basicSalary) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0);

  // Summary bar derived from data
  const totalNetPaid = payrolls.filter((p) => p.payment_status === 'PAID').reduce((s, p) => s + p.net_salary, 0);
  const pendingCount = payrolls.filter((p) => p.payment_status === 'PENDING').length;

  const columns: Column<Payroll>[] = [
    {
      header: 'Employee',
      accessor: (p) =>
        p.employee ? (
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{p.employee.first_name} {p.employee.last_name}</p>
            <p className="text-xs text-slate-400 font-mono">{p.employee.employee_code}</p>
          </div>
        ) : <span className="text-slate-400">—</span>,
    },
    {
      header: 'Period',
      accessor: (p) => <span className="text-sm text-slate-600 font-semibold">{monthName(p.month)} {p.year}</span>,
    },
    {
      header: 'Basic',
      align: 'right',
      accessor: (p) => <span className="text-sm font-mono text-slate-500">${fmtMoney(p.basic_salary)}</span>,
    },
    {
      header: 'Allowances',
      align: 'right',
      accessor: (p) => <span className="text-sm font-mono text-[#16a34a] font-semibold">+${fmtMoney(p.allowances)}</span>,
    },
    {
      header: 'Deductions',
      align: 'right',
      accessor: (p) => <span className="text-sm font-mono text-[#dc2626] font-semibold">−${fmtMoney(p.deductions)}</span>,
    },
    {
      header: 'Net Salary',
      align: 'right',
      accessor: (p) => <span className="text-sm font-mono font-bold text-slate-800">${fmtMoney(p.net_salary)}</span>,
    },
    { header: 'Status', accessor: (p) => <StatusBadge status={p.payment_status} /> },
    {
      header: 'Actions',
      align: 'right',
      accessor: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" onClick={() => openEdit(p)}
            aria-label="Edit" className="text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setDeletingPayroll(p)}
            aria-label="Delete" className="text-slate-400 hover:text-red-600 hover:bg-rose-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        context="Finance"
        title="Payroll Register"
        description="Calculate and track monthly compensation, allowances, deductions and disbursements."
        action={<Button onClick={openCreate}>+ Process Payroll</Button>}
      />

      {/* Summary bar */}
      {!loading && payrolls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Records</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{payrolls.length}</p>
          </div>
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Paid Out</p>
            <p className="text-2xl font-extrabold text-[#16a34a] mt-1 font-mono">${fmtMoney(totalNetPaid)}</p>
          </div>
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending</p>
            <p className={`text-2xl font-extrabold mt-1 ${pendingCount > 0 ? 'text-[#f59e0b]' : 'text-slate-400'}`}>{pendingCount}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline text-xs">Retry</button>
        </div>
      )}

      <Table
        columns={columns}
        data={payrolls}
        keyExtractor={(p) => p.id}
        isLoading={loading}
        emptyTitle="No payroll records"
        emptyMessage="Process your first payroll to start tracking compensation disbursements."
        emptyActionText="Process Payroll"
        onEmptyAction={openCreate}
        emptyIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayroll ? 'Edit Payroll Record' : 'Process Payroll'}
        subtitle="Calculate net compensation for the selected employee and period"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{modalError}</div>
          )}

          <Select
            label="Employee"
            options={employees.map((e) => ({ label: `${e.first_name} ${e.last_name} (${e.employee_code})`, value: e.id }))}
            value={employeeId}
            onChange={(e) => handleEmpChange(Number(e.target.value))}
            error={formErrors.employee_id}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Month" options={MONTHS} value={month}
              onChange={(e) => setMonth(Number(e.target.value))} required />
            <Input label="Year" type="number" value={year}
              onChange={(e) => setYear(Number(e.target.value))} required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Basic ($)" type="number" min="0" value={basicSalary}
              onChange={(e) => { setBasicSalary(e.target.value ? Number(e.target.value) : ''); if (formErrors.basic_salary) setFormErrors({ ...formErrors, basic_salary: '' }); }}
              error={formErrors.basic_salary} required />
            <Input label="Allowances ($)" type="number" min="0" value={allowances}
              onChange={(e) => { setAllowances(e.target.value ? Number(e.target.value) : ''); if (formErrors.allowances) setFormErrors({ ...formErrors, allowances: '' }); }}
              error={formErrors.allowances} required />
            <Input label="Deductions ($)" type="number" min="0" value={deductions}
              onChange={(e) => { setDeductions(e.target.value ? Number(e.target.value) : ''); if (formErrors.deductions) setFormErrors({ ...formErrors, deductions: '' }); }}
              error={formErrors.deductions} required />
          </div>

          {/* Net Salary Preview */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-blue-50/50 border border-blue-100/50 rounded-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">Net Disbursement</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Basic + Allowances − Deductions</p>
            </div>
            <span className="text-2xl font-bold text-[#2563eb] font-mono">${fmtMoney(calcNet)}</span>
          </div>

          <Select label="Payment Status" options={PAYMENT_STATUSES}
            value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} required />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>Save Record</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingPayroll)}
        title="Delete Payroll Record"
        message={`Delete this payroll record for ${deletingPayroll?.employee ? `${deletingPayroll.employee.first_name} ${deletingPayroll.employee.last_name}` : 'this employee'} (${deletingPayroll?.month}/${deletingPayroll?.year})? This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPayroll(null)}
      />
    </DashboardLayout>
  );
}
