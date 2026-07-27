'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  { label: 'January (1)', value: 1 },
  { label: 'February (2)', value: 2 },
  { label: 'March (3)', value: 3 },
  { label: 'April (4)', value: 4 },
  { label: 'May (5)', value: 5 },
  { label: 'June (6)', value: 6 },
  { label: 'July (7)', value: 7 },
  { label: 'August (8)', value: 8 },
  { label: 'September (9)', value: 9 },
  { label: 'October (10)', value: 10 },
  { label: 'November (11)', value: 11 },
  { label: 'December (12)', value: 12 },
];

const PAYMENT_STATUSES = [
  { label: 'PENDING', value: 'PENDING' },
  { label: 'PAID', value: 'PAID' },
  { label: 'FAILED', value: 'FAILED' },
];

export default function PayrollPage() {
  const { showToast } = useToast();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
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

  // Confirm Modal State
  const [deletingPayroll, setDeletingPayroll] = useState<Payroll | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [payrollData, empData] = await Promise.all([
        fetchApi<Payroll[]>('/payrolls'),
        fetchApi<Employee[]>('/employees'),
      ]);
      setPayrolls(payrollData);
      setEmployees(empData);
    } catch (err: any) {
      setError(err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEmployeeChange = (empId: number) => {
    setEmployeeId(empId);
    if (formErrors.employee_id) setFormErrors({ ...formErrors, employee_id: '' });
    const selectedEmp = employees.find((e) => e.id === empId);
    if (selectedEmp) {
      setBasicSalary(selectedEmp.basic_salary);
    }
  };

  const handleOpenCreate = () => {
    setEditingPayroll(null);
    const firstEmpId = employees.length > 0 ? employees[0].id : '';
    setEmployeeId(firstEmpId);
    if (firstEmpId) {
      handleEmployeeChange(Number(firstEmpId));
    } else {
      setBasicSalary(0);
    }
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setAllowances(0);
    setDeductions(0);
    setPaymentStatus('PENDING');
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Payroll) => {
    setEditingPayroll(p);
    setEmployeeId(p.employee_id);
    setMonth(p.month);
    setYear(p.year);
    setBasicSalary(p.basic_salary);
    setAllowances(p.allowances);
    setDeductions(p.deductions);
    setPaymentStatus(p.payment_status);
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPayroll) return;
    setDeleting(true);
    try {
      await fetchApi(`/payrolls/${deletingPayroll.id}`, { method: 'DELETE' });
      showToast('Payroll record deleted successfully', 'success');
      setDeletingPayroll(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete payroll record', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!employeeId) {
      errors.employee_id = 'Employee selection is required';
    }

    if (basicSalary === '' || isNaN(Number(basicSalary)) || Number(basicSalary) < 0) {
      errors.basic_salary = 'Basic salary must be a number >= 0';
    }

    if (allowances === '' || isNaN(Number(allowances)) || Number(allowances) < 0) {
      errors.allowances = 'Allowances must be a number >= 0';
    }

    if (deductions === '' || isNaN(Number(deductions)) || Number(deductions) < 0) {
      errors.deductions = 'Deductions must be a number >= 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!validateForm()) return;

    setSubmitting(true);
    const body = {
      employee_id: Number(employeeId),
      month: Number(month),
      year: Number(year),
      basic_salary: Number(basicSalary),
      allowances: Number(allowances),
      deductions: Number(deductions),
      payment_status: paymentStatus,
    };

    try {
      if (editingPayroll) {
        await fetchApi(`/payrolls/${editingPayroll.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Payroll record updated successfully', 'success');
      } else {
        await fetchApi('/payrolls', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showToast('Payroll record created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save payroll record');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedNetSalary =
    (Number(basicSalary) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0);

  const columns: Column<Payroll>[] = [
    {
      header: 'Employee',
      accessor: (p) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">
            {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : '-'}
          </p>
          {p.employee && <p className="text-[11px] text-slate-500 font-mono">{p.employee.employee_code}</p>}
        </div>
      ),
    },
    { header: 'Period', accessor: (p) => `${p.month}/${p.year}` },
    { header: 'Basic Salary', accessor: (p) => `$${p.basic_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { header: 'Allowances', accessor: (p) => `$${p.allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { header: 'Deductions', accessor: (p) => `$${p.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    {
      header: 'Net Salary',
      accessor: (p) => <span className="font-bold text-slate-900">${p.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    {
      header: 'Status',
      accessor: (p) => <StatusBadge status={p.payment_status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (p) => (
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(p)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeletingPayroll(p)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Payroll Processing">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Payroll Records</h1>
          <p className="text-xs text-slate-500">Calculate net salaries and track disbursements</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Process Payroll</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="underline hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      <Table
        columns={columns}
        data={payrolls}
        keyExtractor={(p) => p.id}
        isLoading={loading}
        emptyMessage="No payroll records found. Click '+ Process Payroll' to issue one."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayroll ? 'Edit Payroll Record' : 'Process Payroll Record'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium">
              {modalError}
            </div>
          )}

          <Select
            label="Employee"
            options={employees.map((e) => ({
              label: `${e.first_name} ${e.last_name} (${e.employee_code})`,
              value: e.id,
            }))}
            value={employeeId}
            onChange={(e) => handleEmployeeChange(Number(e.target.value))}
            error={formErrors.employee_id}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Month"
              options={MONTHS}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              required
            />
            <Input
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Basic Salary ($)"
              type="number"
              min="0"
              value={basicSalary}
              onChange={(e) => {
                setBasicSalary(e.target.value ? Number(e.target.value) : '');
                if (formErrors.basic_salary) setFormErrors({ ...formErrors, basic_salary: '' });
              }}
              error={formErrors.basic_salary}
              required
            />
            <Input
              label="Allowances ($)"
              type="number"
              min="0"
              value={allowances}
              onChange={(e) => {
                setAllowances(e.target.value ? Number(e.target.value) : '');
                if (formErrors.allowances) setFormErrors({ ...formErrors, allowances: '' });
              }}
              error={formErrors.allowances}
              required
            />
            <Input
              label="Deductions ($)"
              type="number"
              min="0"
              value={deductions}
              onChange={(e) => {
                setDeductions(e.target.value ? Number(e.target.value) : '');
                if (formErrors.deductions) setFormErrors({ ...formErrors, deductions: '' });
              }}
              error={formErrors.deductions}
              required
            />
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-md flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Calculated Net Salary</span>
            <span className="text-base font-bold text-blue-700">${calculatedNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <Select
            label="Payment Status"
            options={PAYMENT_STATUSES}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            required
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Payroll
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingPayroll)}
        title="Delete Payroll Record"
        message={`Are you sure you want to delete this payroll record for ${deletingPayroll?.employee ? `${deletingPayroll.employee.first_name} ${deletingPayroll.employee.last_name}` : 'this employee'} (${deletingPayroll?.month}/${deletingPayroll?.year})? This action cannot be undone.`}
        confirmText="Delete Payroll"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPayroll(null)}
      />
    </DashboardLayout>
  );
}
