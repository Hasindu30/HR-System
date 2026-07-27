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
import { Position, Department } from '@/types';

export default function PositionsPage() {
  const { showToast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState('');

  // Confirm Modal State
  const [deletingPos, setDeletingPos] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [posData, deptData] = await Promise.all([
        fetchApi<Position[]>('/positions'),
        fetchApi<Department[]>('/departments'),
      ]);
      setPositions(posData);
      setDepartments(deptData);
    } catch (err: any) {
      setError(err.message || 'Failed to load positions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPos(null);
    setDepartmentId(departments.length > 0 ? departments[0].id : '');
    setTitle('');
    setDescription('');
    setIsActive(true);
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos: Position) => {
    setEditingPos(pos);
    setDepartmentId(pos.department_id);
    setTitle(pos.title);
    setDescription(pos.description || '');
    setIsActive(pos.is_active);
    setFormErrors({});
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPos) return;
    setDeleting(true);
    try {
      await fetchApi(`/positions/${deletingPos.id}`, { method: 'DELETE' });
      showToast('Position deleted successfully', 'success');
      setDeletingPos(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete position', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Position title is required';
    }
    if (!departmentId) {
      errors.department_id = 'Department selection is required';
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
      department_id: Number(departmentId),
      title: title.trim(),
      description: description.trim(),
      is_active: isActive,
    };

    try {
      if (editingPos) {
        await fetchApi(`/positions/${editingPos.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Position updated successfully', 'success');
      } else {
        await fetchApi('/positions', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showToast('Position created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save position');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Position>[] = [
    {
      header: 'Title',
      accessor: (p) => <span className="font-semibold text-slate-900">{p.title}</span>,
    },
    {
      header: 'Department',
      accessor: (p) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {p.department?.name || '-'}
        </span>
      ),
    },
    { header: 'Description', accessor: (p) => p.description || <span className="text-slate-400 font-normal">None</span> },
    {
      header: 'Status',
      accessor: (p) => <StatusBadge status={p.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (p) => (
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(p)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeletingPos(p)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Positions">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Position Directory</h1>
          <p className="text-xs text-slate-500">Manage job roles and department position mapping</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add Position</Button>
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
        data={positions}
        keyExtractor={(p) => p.id}
        isLoading={loading}
        emptyMessage="No positions found. Click '+ Add Position' to create one."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Edit Position' : 'Add Position'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium">
              {modalError}
            </div>
          )}
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
          <Input
            label="Position Title"
            placeholder="e.g. Senior Software Engineer"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
            }}
            error={formErrors.title}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-3.5 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              rows={3}
              placeholder="Brief description of position responsibilities"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="posIsActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="posIsActive" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Active Status
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Position
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingPos)}
        title="Delete Position"
        message={`Are you sure you want to delete position "${deletingPos?.title}"? This action cannot be undone.`}
        confirmText="Delete Position"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPos(null)}
      />
    </DashboardLayout>
  );
}
