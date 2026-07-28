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
import { FileUpload } from '@/components/ui/FileUpload';
import { FormSection } from '@/components/ui/FormSection';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { fetchApi } from '@/lib/api';
import { Employee, Department, Position, EmployeeDocument, EmployeeStatus } from '@/types';

const EMPLOYMENT_TYPES = [
  { label: 'Full-Time', value: 'Full-Time' },
  { label: 'Part-Time', value: 'Part-Time' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Internship', value: 'Internship' },
];
const EMPLOYEE_STATUSES = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
  { label: 'ONBOARDING', value: 'ONBOARDING' },
  { label: 'TERMINATED', value: 'TERMINATED' },
];

const AVATAR_PALETTE = [
  'bg-blue-50 text-[#2563eb]',
  'bg-slate-100 text-slate-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-purple-50 text-purple-700',
  'bg-cyan-50 text-cyan-700',
];

function avatarColor(id: number) { return AVATAR_PALETTE[id % AVATAR_PALETTE.length]; }
function initials(e: Employee) { return `${e.first_name.charAt(0)}${e.last_name.charAt(0)}`.toUpperCase(); }
function fmtMoney(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

export default function EmployeesPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Employee form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [positionId, setPositionId] = useState<number | ''>('');
  const [joiningDate, setJoiningDate] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [basicSalary, setBasicSalary] = useState<number | ''>('');
  const [status, setStatus] = useState<EmployeeStatus>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState('');

  // Documents
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Confirm
  const [deletingEmp, setDeletingEmp] = useState<Employee | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<EmployeeDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [empData, deptData, posData] = await Promise.all([
        fetchApi<Employee[]>('/employees'),
        fetchApi<Department[]>('/departments'),
        fetchApi<Position[]>('/positions'),
      ]);
      setEmployees(empData); setDepartments(deptData); setPositions(posData);
    } catch (err: any) { setError(err.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (departmentId) {
      const f = positions.filter((p) => p.department_id === Number(departmentId));
      setFilteredPositions(f);
      if (f.length > 0 && !f.some((p) => p.id === Number(positionId))) setPositionId(f[0].id);
      else if (f.length === 0) setPositionId('');
    } else { setFilteredPositions([]); setPositionId(''); }
  }, [departmentId, positions]);

  const openCreate = () => {
    setEditingEmp(null);
    setEmployeeCode(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setAddress('');
    const dd = departments.length > 0 ? departments[0].id : '';
    setDepartmentId(dd);
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setEmploymentType('Full-Time'); setBasicSalary(3000); setStatus('ACTIVE');
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEmployeeCode(emp.employee_code); setFirstName(emp.first_name); setLastName(emp.last_name);
    setEmail(emp.email); setPhone(emp.phone ?? ''); setAddress(emp.address ?? '');
    setDepartmentId(emp.department_id); setPositionId(emp.position_id);
    setJoiningDate(emp.joining_date); setEmploymentType(emp.employment_type);
    setBasicSalary(emp.basic_salary); setStatus(emp.status);
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const handleDeleteEmp = async () => {
    if (!deletingEmp) return;
    setDeleting(true);
    try {
      await fetchApi(`/employees/${deletingEmp.id}`, { method: 'DELETE' });
      showToast('Employee deleted', 'success');
      setDeletingEmp(null); load();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    finally { setDeleting(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!employeeCode.trim()) errs.employee_code = 'Employee code is required';
    if (!firstName.trim() || firstName.trim().length < 2) errs.first_name = 'First name must be at least 2 characters';
    if (!lastName.trim()) errs.last_name = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address';
    if (phone.trim() && !/^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(phone.trim())) errs.phone = 'Enter a valid phone number';
    if (!departmentId) errs.department_id = 'Department is required';
    if (!positionId) errs.position_id = 'Position is required';
    if (!joiningDate) errs.joining_date = 'Joining date is required';
    if (basicSalary === '' || Number(basicSalary) < 0) errs.basic_salary = 'Valid salary required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError('');
    if (!validate()) return;
    setSubmitting(true);
    const body = {
      employee_code: employeeCode.trim(), first_name: firstName.trim(), last_name: lastName.trim(),
      email: email.trim(), phone: phone.trim(), address: address.trim(),
      department_id: Number(departmentId), position_id: Number(positionId),
      joining_date: joiningDate, employment_type: employmentType,
      basic_salary: Number(basicSalary), status,
    };
    try {
      if (editingEmp) {
        await fetchApi(`/employees/${editingEmp.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        showToast('Employee updated', 'success');
      } else {
        await fetchApi('/employees', { method: 'POST', body: JSON.stringify(body) });
        showToast('Employee onboarded', 'success');
      }
      setIsModalOpen(false); load();
    } catch (err: any) { setModalError(err.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const openDocs = async (emp: Employee) => {
    setSelectedEmp(emp); setLoadingDocs(true);
    try {
      const docs = await fetchApi<EmployeeDocument[]>(`/employees/${emp.id}/documents`);
      setDocuments(docs);
    } catch (err: any) { showToast(err.message || 'Failed to load documents', 'error'); }
    finally { setLoadingDocs(false); }
  };

  const handleUpload = async (docType: string, file: File) => {
    if (!selectedEmp) return;
    setUploadingDoc(true);
    const fd = new FormData();
    fd.append('document_type', docType); fd.append('file', file);
    try {
      await fetchApi(`/employees/${selectedEmp.id}/documents`, { method: 'POST', body: fd });
      showToast('Document uploaded', 'success');
      const docs = await fetchApi<EmployeeDocument[]>(`/employees/${selectedEmp.id}/documents`);
      setDocuments(docs);
    } catch (err: any) { showToast(err.message || 'Upload failed', 'error'); }
    finally { setUploadingDoc(false); }
  };

  const handleDeleteDoc = async () => {
    if (!deletingDoc) return;
    setDeleting(true);
    try {
      await fetchApi(`/employees/documents/${deletingDoc.id}`, { method: 'DELETE' });
      showToast('Document deleted', 'success');
      setDeletingDoc(null);
      if (selectedEmp) {
        const docs = await fetchApi<EmployeeDocument[]>(`/employees/${selectedEmp.id}/documents`);
        setDocuments(docs);
      }
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    finally { setDeleting(false); }
  };

  const handleDownload = async (docId: number, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/employees/documents/${docId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      showToast('Document downloaded', 'success');
    } catch (err: any) { showToast(err.message || 'Failed to download', 'error'); }
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employee',
      accessor: (e) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(e.id)}`}>
            {initials(e)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{e.first_name} {e.last_name}</p>
            <p className="text-xs text-slate-400 truncate">{e.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Code', accessor: (e) => <span className="text-xs font-mono text-slate-500 font-semibold">{e.employee_code}</span> },
    {
      header: 'Department / Role',
      accessor: (e) => (
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{e.department?.name ?? '—'}</p>
          <p className="text-xs text-slate-400">{e.position?.title ?? '—'}</p>
        </div>
      ),
    },
    { header: 'Type', accessor: (e) => <span className="text-sm text-slate-600 font-medium">{e.employment_type}</span> },
    {
      header: 'Salary',
      align: 'right',
      accessor: (e) => <span className="text-sm font-mono font-bold text-slate-800">${fmtMoney(e.basic_salary)}</span>,
    },
    { header: 'Status', accessor: (e) => <StatusBadge status={e.status} /> },
    {
      header: 'Actions',
      align: 'right',
      accessor: (e) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" onClick={() => openDocs(e)}
            aria-label="Documents" className="text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Button>
          <Button size="xs" variant="ghost" onClick={() => openEdit(e)}
            aria-label="Edit employee" className="text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setDeletingEmp(e)}
            aria-label="Delete employee" className="text-slate-400 hover:text-red-600 hover:bg-rose-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  const docColumns: Column<EmployeeDocument>[] = [
    {
      header: 'Document',
      accessor: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{d.document_type}</p>
            <p className="text-xs text-slate-400 truncate">{d.original_file_name}</p>
          </div>
        </div>
      ),
    },
    { header: 'Size', accessor: (d) => <span className="text-xs font-mono text-slate-500">{(d.file_size / 1024).toFixed(1)} KB</span> },
    { header: 'Uploaded', accessor: (d) => <span className="text-xs text-slate-500">{new Date(d.uploaded_at).toLocaleDateString()}</span> },
    {
      header: 'Actions',
      align: 'right',
      accessor: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" onClick={() => handleDownload(d.id, d.original_file_name)}
            aria-label="Download" className="text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setDeletingDoc(d)}
            aria-label="Delete document" className="text-slate-400 hover:text-red-600 hover:bg-rose-50">
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
        context="People Directory"
        title="Employees"
        description="Manage employee profiles, onboarding, documents, and compensation."
        action={<Button onClick={openCreate}>+ Add Employee</Button>}
      />

      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline text-xs">Retry</button>
        </div>
      )}

      <Table
        columns={columns}
        data={employees}
        keyExtractor={(e) => e.id}
        isLoading={loading}
        emptyTitle="No employees onboarded"
        emptyMessage="Add your first employee to start building your people directory."
        emptyActionText="Add Employee"
        onEmptyAction={openCreate}
        emptyIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />

      {/* Employee Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? 'Edit Employee' : 'Onboard Employee'}
        subtitle={editingEmp ? `Editing ${editingEmp.first_name} ${editingEmp.last_name}` : 'Fill in the employee profile details below'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-7">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{modalError}</div>
          )}

          <FormSection number="01" title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Jane"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); if (formErrors.first_name) setFormErrors({ ...formErrors, first_name: '' }); }}
                error={formErrors.first_name} required />
              <Input label="Last Name" placeholder="Smith"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); if (formErrors.last_name) setFormErrors({ ...formErrors, last_name: '' }); }}
                error={formErrors.last_name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email Address" type="email" placeholder="jane@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); }}
                error={formErrors.email} required />
              <Input label="Phone Number" placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' }); }}
                error={formErrors.phone} />
            </div>
            <Input label="Address" placeholder="123 Main Street, City"
              value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormSection>

          <FormSection number="02" title="Employment Details">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Employee Code"
                value={employeeCode}
                onChange={(e) => { setEmployeeCode(e.target.value); if (formErrors.employee_code) setFormErrors({ ...formErrors, employee_code: '' }); }}
                error={formErrors.employee_code} required />
              <Select label="Status" options={EMPLOYEE_STATUSES} value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Department"
                options={departments.map((d) => ({ label: d.name, value: d.id }))}
                value={departmentId}
                onChange={(e) => { setDepartmentId(Number(e.target.value)); if (formErrors.department_id) setFormErrors({ ...formErrors, department_id: '' }); }}
                error={formErrors.department_id} required />
              <Select label="Position"
                options={filteredPositions.map((p) => ({ label: p.title, value: p.id }))}
                value={positionId}
                onChange={(e) => { setPositionId(Number(e.target.value)); if (formErrors.position_id) setFormErrors({ ...formErrors, position_id: '' }); }}
                error={formErrors.position_id} required
                disabled={filteredPositions.length === 0}
                helperText={filteredPositions.length === 0 ? 'No positions in this department' : undefined} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Joining Date" type="date" value={joiningDate}
                onChange={(e) => { setJoiningDate(e.target.value); if (formErrors.joining_date) setFormErrors({ ...formErrors, joining_date: '' }); }}
                error={formErrors.joining_date} required />
              <Select label="Employment Type" options={EMPLOYMENT_TYPES}
                value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required />
            </div>
          </FormSection>

          <FormSection number="03" title="Compensation">
            <Input label="Basic Salary (USD)" type="number" min="0" placeholder="0.00"
              value={basicSalary}
              onChange={(e) => { setBasicSalary(e.target.value ? Number(e.target.value) : ''); if (formErrors.basic_salary) setFormErrors({ ...formErrors, basic_salary: '' }); }}
              error={formErrors.basic_salary} required />
          </FormSection>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>
              {editingEmp ? 'Save Changes' : 'Onboard Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Documents Modal */}
      <Modal
        isOpen={Boolean(selectedEmp)}
        onClose={() => setSelectedEmp(null)}
        title="Employee Documents"
        subtitle={selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name} · ${selectedEmp.employee_code}` : ''}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <FileUpload onUpload={handleUpload} isLoading={uploadingDoc} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Stored Documents
            </p>
            <Table
              columns={docColumns}
              data={documents}
              keyExtractor={(d) => d.id}
              isLoading={loadingDocs}
              emptyTitle="No documents stored"
              emptyMessage="Upload employee files using the upload area above."
              emptyIcon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingEmp)}
        title="Delete Employee"
        message={`Permanently delete ${deletingEmp?.first_name} ${deletingEmp?.last_name}? All associated data will be removed.`}
        confirmText="Delete Employee"
        isLoading={deleting}
        onConfirm={handleDeleteEmp}
        onCancel={() => setDeletingEmp(null)}
      />
      <ConfirmModal
        isOpen={Boolean(deletingDoc)}
        title="Delete Document"
        message={`Delete "${deletingDoc?.original_file_name}"? This cannot be undone.`}
        confirmText="Delete Document"
        isLoading={deleting}
        onConfirm={handleDeleteDoc}
        onCancel={() => setDeletingDoc(null)}
      />
    </DashboardLayout>
  );
}
