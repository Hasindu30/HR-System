'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState('');

  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true); setError('');
    fetchApi<Department[]>('/departments')
      .then((d) => { setDepartments(d); setLoading(false); })
      .catch((err) => { setError(err.message || 'Failed to load'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingDept(null); setName(''); setDescription(''); setIsActive(true);
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditingDept(d); setName(d.name); setDescription(d.description ?? ''); setIsActive(d.is_active);
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    setDeleting(true);
    try {
      await fetchApi(`/departments/${deletingDept.id}`, { method: 'DELETE' });
      showToast('Department deleted', 'success');
      setDeletingDept(null); load();
    } catch (err: any) { showToast(err.message || 'Failed to delete', 'error'); }
    finally { setDeleting(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Department name is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError('');
    if (!validate()) return;
    setSubmitting(true);
    const body = { name: name.trim(), description: description.trim(), is_active: isActive };
    try {
      if (editingDept) {
        await fetchApi(`/departments/${editingDept.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        showToast('Department updated', 'success');
      } else {
        await fetchApi('/departments', { method: 'POST', body: JSON.stringify(body) });
        showToast('Department created', 'success');
      }
      setIsModalOpen(false); load();
    } catch (err: any) { setModalError(err.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const columns: Column<Department>[] = [
    {
      header: 'Department',
      accessor: (d) => (
        <div>
          <p className="text-sm font-bold text-slate-800">{d.name}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID {d.id}</p>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: (d) =>
        d.description ? (
          <span className="text-sm text-slate-600 line-clamp-1 max-w-sm">{d.description}</span>
        ) : (
          <span className="text-sm text-slate-300 italic">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: (d) => <StatusBadge status={d.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost"
            onClick={() => openEdit(d)}
            aria-label={`Edit ${d.name}`}
            className="text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button size="xs" variant="ghost"
            onClick={() => setDeletingDept(d)}
            aria-label={`Delete ${d.name}`}
            className="text-slate-400 hover:text-red-600 hover:bg-rose-50">
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
        context="Organisation"
        title="Departments"
        description="Manage your organizational units, team structures, and department statuses."
        action={<Button onClick={openCreate}>+ Add Department</Button>}
      />

      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline text-xs">Retry</button>
        </div>
      )}

      <Table
        columns={columns}
        data={departments}
        keyExtractor={(d) => d.id}
        isLoading={loading}
        emptyTitle="No departments yet"
        emptyMessage="Create your first department to start organizing your workforce."
        emptyActionText="Add Department"
        onEmptyAction={openCreate}
        emptyIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
          </svg>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        subtitle={editingDept ? `Editing "${editingDept.name}"` : 'Fill in department details below'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{modalError}</div>
          )}
          <Input label="Department Name" placeholder="e.g. Engineering" value={name}
            onChange={(e) => { setName(e.target.value); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }}
            error={formErrors.name} required />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">Description</label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300/50 focus:border-[#2563eb] resize-none"
              rows={3}
              placeholder="Brief description of what this department does…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-200 text-[#2563eb] focus:ring-1 focus:ring-blue-300/50 cursor-pointer"
            />
            <span className="text-sm font-semibold text-slate-800">Active department</span>
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>Save Department</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingDept)}
        title="Delete Department"
        message={`Delete department "${deletingDept?.name}"? This action cannot be undone and may affect employees assigned to this department.`}
        confirmText="Delete"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingDept(null)}
      />
    </DashboardLayout>
  );
}
