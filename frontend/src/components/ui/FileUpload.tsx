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
  const [isDragging, setIsDragging] = useState(false);

  const validate = (f: File) => {
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!valid.includes(f.type)) { setError('Accepted formats: PDF, JPG, JPEG, PNG'); setFile(null); return; }
    if (f.size > 5 * 1024 * 1024) { setError('Maximum file size is 5 MB'); setFile(null); return; }
    setError(''); setFile(f);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) validate(e.target.files[0]); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) validate(e.dataTransfer.files[0]); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType) { setError('Please select a document type'); return; }
    if (!file) { setError('Please select a file'); return; }
    try { setError(''); await onUpload(docType, file); setDocType(''); setFile(null); }
    catch (err: any) { setError(err.message || 'Upload failed'); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Document Type" options={DOCUMENT_TYPES} value={docType}
        onChange={(e) => setDocType(e.target.value)} required />

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
          File <span className="text-red-500">*</span>
        </label>
        <div
          className={`relative flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging ? 'border-[#2563eb] bg-blue-50/50'
            : file ? 'border-emerald-400 bg-emerald-50/50'
            : 'border-slate-200 bg-slate-50/40 hover:border-[#2563eb]/50 hover:bg-blue-50/20'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {file ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Drop file or click to browse</p>
                <p className="text-xs text-slate-400">PDF, JPG, PNG · Max 5 MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      <Button type="submit" isLoading={isLoading} disabled={!docType || !file} className="w-full">
        Upload Document
      </Button>
    </form>
  );
};
