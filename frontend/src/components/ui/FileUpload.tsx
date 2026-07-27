import React, { ChangeEvent, useState } from 'react';
import { Select } from './Select';
import { Button } from './Button';

interface FileUploadProps {
  onUpload: (documentType: string, file: File) => Promise<void>;
  isLoading?: boolean;
}

const DOCUMENT_TYPES = [
  { label: 'Select Document Type', value: '' },
  { label: 'NIC/ID Copy', value: 'NIC/ID Copy' },
  { label: 'Passport Copy', value: 'Passport Copy' },
  { label: 'CV/Resume', value: 'CV/Resume' },
  { label: 'Education Certificate', value: 'Education Certificate' },
  { label: 'Previous Employment Letter', value: 'Previous Employment Letter' },
  { label: 'Bank Details', value: 'Bank Details' },
  { label: 'Signed Contract', value: 'Signed Contract' },
  { label: 'Other', value: 'Other' },
];

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading = false }) => {
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Accepted formats: PDF, JPG, JPEG, PNG');
        setFile(null);
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Maximum file size is 5 MB');
        setFile(null);
        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType) {
      setError('Please select document type');
      return;
    }
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setError('');
      await onUpload(docType, file);
      setDocType('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
      <Select
        label="Document Type"
        options={DOCUMENT_TYPES}
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
        required
      />
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          File (PDF, JPG, PNG - Max 5MB) <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer border border-slate-300 rounded-md p-1 bg-white"
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Button type="submit" isLoading={isLoading} disabled={!docType || !file} className="w-full sm:w-auto">
        Upload Document
      </Button>
    </form>
  );
};
