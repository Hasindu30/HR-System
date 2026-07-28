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
import { Position, Department } from '@/types';

export default function PositionsPage() {
  const { showToast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState('');

  const [deletingPos, setDeletingPos] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [posData, deptData] = await Promise.all([
        fetchApi<Position[]>('/positions'),
        fetchApi<Department[]>('/departments'),
      ]);
      setPositions(posData); setDepartments(deptData);
    } catch (err: any) { setError(err.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingPos(null); setDepartmentId(departments.length > 0 ? departments[0].id : '');
    setTitle(''); setDescription(''); setIsActive(true);
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const openEdit = (p: Position) => {
    setEditingPos(p); setDepartmentId(p.department_id); setTitle(p.title);
    setDescription(p.description ?? ''); setIsActive(p.is_active);
    setFormErrors({}); setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPos) return;
    setDeleting(true);
    try {
      await fetchApi(`/positions/${deletingPos.id}`, { method: 'DELETE' });
      showToast('Position deleted', 'success');
      setDeletingPos(null); load();
    } catch (err: any) { showToast(err.message || 'Failed to delete', 'error'); }
    finally { setDeleting(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Position title is required';
    if (!departmentId) errs.department_id = 'Department is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError('');
    if (!validate()) return;
    setSubmitting(true);
    const body = { department_id: Number(departmentId), title: title.trim(), description: description.trim(), is_active: isActive };
    try {
      if (editingPos) {
        await fetchApi(`/positions/${editingPos.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        showToast('Position updated', 'success');
      } else {
        await fetchApi('/positions', { method: 'POST', body: JSON.stringify(body) });
        showToast('Position created', 'success');
      }
      setIsModalOpen(false); load();
    } catch (err: any) { setModalError(err.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const columns: Column<Position>[] = [
    {
      header: 'Position',
      accessor: (p) => (
        <div>
          <p className="text-sm font-bold text-slate-800">{p.title}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID {p.id}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (p) => (
        <span className="inline-flex px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563eb] text-xs font-semibold">
          {p.department?.name ?? '—'}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (p) =>
        p.description ? (
          <span className="text-sm text-slate-600 line-clamp-1 max-w-sm">{p.description}</span>
        ) : (
          <span className="text-sm text-slate-300 italic">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: (p) => <StatusBadge status={p.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="xs" variant="ghost" onClick={() => openEdit(p)}
            aria-label={`Edit ${p.title}`}
            className="text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setDeletingPos(p)}
            aria-label={`Delete ${p.title}`}
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
        title="Positions"
        description="Define job titles and roles, mapped to specific departments across your organization."
        action={<Button onClick={openCreate}>+ Add Position</Button>}
      />

      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline text-xs">Retry</button>
        </div>
      )}

      <Table
        columns={columns}
        data={positions}
        keyExtractor={(p) => p.id}
        isLoading={loading}
        emptyTitle="No positions yet"
        emptyMessage="Add positions to define roles within your departments."
        emptyActionText="Add Position"
        onEmptyAction={openCreate}
        emptyIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Edit Position' : 'Add Position'}
        subtitle={editingPos ? `Editing "${editingPos.title}"` : 'Define a new role within a department'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{modalError}</div>
          )}
          <Select
            label="Department"
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
            value={departmentId}
            onChange={(e) => { setDepartmentId(Number(e.target.value)); if (formErrors.department_id) setFormErrors({ ...formErrors, department_id: '' }); }}
            error={formErrors.department_id}
            required
          />
          <Input label="Position Title" placeholder="e.g. Senior Software Engineer"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (formErrors.title) setFormErrors({ ...formErrors, title: '' }); }}
            error={formErrors.title} required />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">Description</label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300/50 focus:border-[#2563eb] resize-none"
              rows={3}
              placeholder="Key responsibilities for this role…"
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
            <span className="text-sm font-semibold text-slate-800">Active position</span>
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>Save Position</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingPos)}
        title="Delete Position"
        message={`Delete position "${deletingPos?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPos(null)}
      />
    </DashboardLayout>
  );
}
