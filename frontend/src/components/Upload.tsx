import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onUpload: (file: File) => void;
  onLoadDemo: () => void;
  isUploading: boolean;
}

export default function Upload({ onUpload, onLoadDemo, isUploading }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files.length > 0) onUpload(files[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 520 }}>
        <div
          {...getRootProps()}
          style={{
            width: '100%',
            padding: '60px 40px',
            borderRadius: 'var(--radius-lg)',
            border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
            background: isDragActive ? 'var(--accent-dim)' : 'var(--bg-secondary)',
            textAlign: 'center',
            cursor: isUploading ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input {...getInputProps()} />

          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {isUploading ? (
              <Loader2 size={24} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            ) : isDragActive ? (
              <FileSpreadsheet size={24} color="var(--accent)" />
            ) : (
              <UploadIcon size={24} color="var(--accent)" />
            )}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {isUploading ? 'Uploading...' : isDragActive ? 'Drop your file here' : 'Upload Excel File'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {isUploading
              ? 'Reading your spreadsheet...'
              : 'Drag & drop an .xlsx file, or click to browse'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16 }}>
            Supports .xlsx and .xls files
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>or</span>
        </div>

        <button
          onClick={onLoadDemo}
          disabled={isUploading}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
            cursor: isUploading ? 'wait' : 'pointer',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-dim)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-secondary)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Sparkles size={16} />
          Try with Demo Dataset
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>
            75 texts, 5 topics
          </span>
        </button>
      </div>
    </div>
  );
}
