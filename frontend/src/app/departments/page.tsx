'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { fetchApi } from '@/lib/api';
import { Department } from '@/types';

export default function DepartmentsPage() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState('');

  // Confirm Modal State
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = () => {
    setLoading(true);
    setError('');
    fetchApi<Department[]>('/departments')
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load departments');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setIsActive(dept.is_active);
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDept) return;
    setDeleting(true);
    try {
      await fetchApi(`/departments/${deletingDept.id}`, { method: 'DELETE' });
      showToast('Department deleted successfully', 'success');
      setDeletingDept(null);
      loadDepartments();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete department', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Department name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!validateForm()) return;

    setSubmitting(true);
    const body = { name: name.trim(), description: description.trim(), is_active: isActive };

    try {
      if (editingDept) {
        await fetchApi(`/departments/${editingDept.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Department updated successfully', 'success');
      } else {
        await fetchApi('/departments', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showToast('Department created successfully', 'success');
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Department>[] = [
    { header: 'ID', accessor: 'id', className: 'font-mono text-xs w-16' },
    {
      header: 'Name',
      accessor: (d) => <span className="font-semibold text-slate-900">{d.name}</span>,
    },
    { header: 'Description', accessor: (d) => d.description || <span className="text-slate-400 font-normal">None</span> },
    {
      header: 'Status',
      accessor: (d) => <StatusBadge status={d.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (d) => (
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(d)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeletingDept(d)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Departments">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Department Directory</h1>
          <p className="text-xs text-slate-500">Manage organizational departments and structures</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add Department</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={loadDepartments} className="underline hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      <Table
        columns={columns}
        data={departments}
        keyExtractor={(d) => d.id}
        isLoading={loading}
        emptyMessage="No departments found. Click '+ Add Department' to create one."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium">
              {modalError}
            </div>
          )}
          <Input
            label="Department Name"
            placeholder="e.g. Engineering"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
            }}
            error={formErrors.name}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-3.5 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              rows={3}
              placeholder="Brief description of department responsibilities"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Active Status
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingDept)}
        title="Delete Department"
        message={`Are you sure you want to delete department "${deletingDept?.name}"? This action cannot be undone.`}
        confirmText="Delete Department"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDept(null)}
      />
    </DashboardLayout>
  );
}
