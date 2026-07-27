'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
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

export default function EmployeesPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Employee Form state
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

  // Document Management state
  const [selectedEmpForDocs, setSelectedEmpForDocs] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Confirm Modal state for Employee & Document
  const [deletingEmp, setDeletingEmp] = useState<Employee | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<EmployeeDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [empData, deptData, posData] = await Promise.all([
        fetchApi<Employee[]>('/employees'),
        fetchApi<Department[]>('/departments'),
        fetchApi<Position[]>('/positions'),
      ]);
      setEmployees(empData);
      setDepartments(deptData);
      setPositions(posData);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter positions based on selected department
  useEffect(() => {
    if (departmentId) {
      const filtered = positions.filter((p) => p.department_id === Number(departmentId));
      setFilteredPositions(filtered);
      if (filtered.length > 0) {
        if (!filtered.some((p) => p.id === Number(positionId))) {
          setPositionId(filtered[0].id);
        }
      } else {
        setPositionId('');
      }
    } else {
      setFilteredPositions([]);
      setPositionId('');
    }
  }, [departmentId, positions]);

  const handleOpenCreate = () => {
    setEditingEmp(null);
    setEmployeeCode(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    const defaultDept = departments.length > 0 ? departments[0].id : '';
    setDepartmentId(defaultDept);
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setEmploymentType('Full-Time');
    setBasicSalary(3000);
    setStatus('ACTIVE');
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEmployeeCode(emp.employee_code);
    setFirstName(emp.first_name);
    setLastName(emp.last_name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setAddress(emp.address || '');
    setDepartmentId(emp.department_id);
    setPositionId(emp.position_id);
    setJoiningDate(emp.joining_date);
    setEmploymentType(emp.employment_type);
    setBasicSalary(emp.basic_salary);
    setStatus(emp.status);
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteEmployeeConfirm = async () => {
    if (!deletingEmp) return;
    setDeleting(true);
    try {
      await fetchApi(`/employees/${deletingEmp.id}`, { method: 'DELETE' });
      showToast('Employee deleted successfully', 'success');
      setDeletingEmp(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete employee', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!employeeCode.trim()) {
      errors.employee_code = 'Employee code is required';
    }

    if (!firstName.trim() || firstName.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      errors.last_name = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (phone.trim() && !/^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(phone.trim())) {
      errors.phone = 'Enter a valid phone number';
    }

    if (!departmentId) {
      errors.department_id = 'Department is required';
    }

    if (!positionId) {
      errors.position_id = 'Position is required';
    }

    if (!joiningDate) {
      errors.joining_date = 'Joining date is required';
    }

    if (basicSalary === '' || isNaN(Number(basicSalary)) || Number(basicSalary) < 0) {
      errors.basic_salary = 'Basic salary must be a number >= 0';
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
      employee_code: employeeCode.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      department_id: Number(departmentId),
      position_id: Number(positionId),
      joining_date: joiningDate,
      employment_type: employmentType,
      basic_salary: Number(basicSalary),
      status,
    };

    try {
      if (editingEmp) {
        await fetchApi(`/employees/${editingEmp.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Employee updated successfully', 'success');
      } else {
        await fetchApi('/employees', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showToast('Employee created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  // Document Management Methods
  const handleOpenDocuments = async (emp: Employee) => {
    setSelectedEmpForDocs(emp);
    setLoadingDocs(true);
    try {
      const docs = await fetchApi<EmployeeDocument[]>(`/employees/${emp.id}/documents`);
      setDocuments(docs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load documents', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUploadDocument = async (documentType: string, file: File) => {
    if (!selectedEmpForDocs) return;
    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);

    try {
      await fetchApi(`/employees/${selectedEmpForDocs.id}/documents`, {
        method: 'POST',
        body: formData,
      });
      showToast('Document uploaded successfully', 'success');
      const docs = await fetchApi<EmployeeDocument[]>(`/employees/${selectedEmpForDocs.id}/documents`);
      setDocuments(docs);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocConfirm = async () => {
    if (!deletingDoc) return;
    setDeleting(true);
    try {
      await fetchApi(`/employees/documents/${deletingDoc.id}`, { method: 'DELETE' });
      showToast('Document deleted successfully', 'success');
      setDeletingDoc(null);
      if (selectedEmpForDocs) {
        const docs = await fetchApi<EmployeeDocument[]>(`/employees/${selectedEmpForDocs.id}/documents`);
        setDocuments(docs);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete document', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadDocument = async (docId: number, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/employees/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Document downloaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to download file', 'error');
    }
  };

  const columns: Column<Employee>[] = [
    { header: 'Code', accessor: 'employee_code', className: 'font-mono text-xs' },
    {
      header: 'Name',
      accessor: (e) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{e.first_name} {e.last_name}</p>
          <p className="text-[11px] text-slate-500">{e.email}</p>
        </div>
      ),
    },
    { header: 'Department', accessor: (e) => e.department?.name || '-' },
    { header: 'Position', accessor: (e) => e.position?.title || '-' },
    { header: 'Type', accessor: 'employment_type' },
    {
      header: 'Basic Salary',
      accessor: (e) => <span className="font-medium text-slate-900">${e.basic_salary.toLocaleString()}</span>,
    },
    { header: 'Status', accessor: (e) => <StatusBadge status={e.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (e) => (
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenDocuments(e)}>
            Docs
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(e)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeletingEmp(e)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const docColumns: Column<EmployeeDocument>[] = [
    { header: 'Type', accessor: 'document_type', className: 'font-semibold text-slate-900' },
    { header: 'Filename', accessor: 'original_file_name' },
    { header: 'Size', accessor: (d) => `${(d.file_size / 1024).toFixed(1)} KB` },
    { header: 'Uploaded', accessor: (d) => new Date(d.uploaded_at).toLocaleDateString() },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (d) => (
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="primary" onClick={() => handleDownloadDocument(d.id, d.original_file_name)}>
            Download
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeletingDoc(d)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Employees">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Employee Directory</h1>
          <p className="text-xs text-slate-500">Manage employee records, roles, profiles, and documents</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add Employee</Button>
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
        data={employees}
        keyExtractor={(e) => e.id}
        isLoading={loading}
        emptyMessage="No employees found. Click '+ Add Employee' to onboard a record."
      />

      {/* Employee Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? 'Edit Employee Record' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee Code"
              value={employeeCode}
              onChange={(e) => {
                setEmployeeCode(e.target.value);
                if (formErrors.employee_code) setFormErrors({ ...formErrors, employee_code: '' });
              }}
              error={formErrors.employee_code}
              required
            />
            <Select
              label="Status"
              options={EMPLOYEE_STATUSES}
              value={status}
              onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (formErrors.first_name) setFormErrors({ ...formErrors, first_name: '' });
              }}
              error={formErrors.first_name}
              required
            />
            <Input
              label="Last Name"
              placeholder="Smith"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (formErrors.last_name) setFormErrors({ ...formErrors, last_name: '' });
              }}
              error={formErrors.last_name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="jane.smith@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
              }}
              error={formErrors.email}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
              }}
              error={formErrors.phone}
            />
          </div>

          <Input
            label="Address"
            placeholder="123 Main St, City, Country"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(Number(e.target.value));
                if (formErrors.department_id) setFormErrors({ ...formErrors, department_id: '' });
              }}
              error={formErrors.department_id}
              required
            />
            <Select
              label="Position"
              options={filteredPositions.map((p) => ({ label: p.title, value: p.id }))}
              value={positionId}
              onChange={(e) => {
                setPositionId(Number(e.target.value));
                if (formErrors.position_id) setFormErrors({ ...formErrors, position_id: '' });
              }}
              error={formErrors.position_id}
              required
              disabled={filteredPositions.length === 0}
              helperText={filteredPositions.length === 0 ? 'No positions in selected department' : undefined}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Joining Date"
              type="date"
              value={joiningDate}
              onChange={(e) => {
                setJoiningDate(e.target.value);
                if (formErrors.joining_date) setFormErrors({ ...formErrors, joining_date: '' });
              }}
              error={formErrors.joining_date}
              required
            />
            <Select
              label="Employment Type"
              options={EMPLOYMENT_TYPES}
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              required
            />
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
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {submitting ? 'Saving...' : 'Save Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Documents Modal */}
      <Modal
        isOpen={Boolean(selectedEmpForDocs)}
        onClose={() => setSelectedEmpForDocs(null)}
        title={`Documents & File Uploads - ${selectedEmpForDocs?.first_name} ${selectedEmpForDocs?.last_name}`}
      >
        <div className="space-y-6">
          <FileUpload onUpload={handleUploadDocument} isLoading={uploadingDoc} />

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Stored Documents</h4>
            <Table
              columns={docColumns}
              data={documents}
              keyExtractor={(d) => d.id}
              isLoading={loadingDocs}
              emptyMessage="No documents stored for this employee."
            />
          </div>
        </div>
      </Modal>

      {/* Delete Employee Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingEmp)}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deletingEmp?.first_name} ${deletingEmp?.last_name}? This action cannot be undone.`}
        confirmText="Delete Employee"
        isLoading={deleting}
        onConfirm={handleDeleteEmployeeConfirm}
        onCancel={() => setDeletingEmp(null)}
      />

      {/* Delete Document Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingDoc)}
        title="Delete Document"
        message={`Are you sure you want to delete document "${deletingDoc?.original_file_name}"?`}
        confirmText="Delete Document"
        isLoading={deleting}
        onConfirm={handleDeleteDocConfirm}
        onCancel={() => setDeletingDoc(null)}
      />
    </DashboardLayout>
  );
}
