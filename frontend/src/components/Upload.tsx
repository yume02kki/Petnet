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
      minHeight: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 16px 20px',
      overflow: 'auto',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 520 }}>
        <div
          {...getRootProps()}
          style={{
            width: '100%',
            padding: '28px 20px',
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
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            {isUploading ? (
              <Loader2 size={22} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            ) : isDragActive ? (
              <FileSpreadsheet size={22} color="var(--accent)" />
            ) : (
              <UploadIcon size={22} color="var(--accent)" />
            )}
          </div>

          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
            {isUploading ? 'Uploading...' : isDragActive ? 'Drop your file here' : 'Upload Excel File'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isUploading
              ? 'Reading your spreadsheet...'
              : 'Drag & drop an .xlsx file, or click to browse'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
            Supports .xlsx and .xls files
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>or</span>
        </div>

        <button
          onClick={onLoadDemo}
          disabled={isUploading}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            fontSize: 14,
            fontWeight: 600,
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
            cursor: isUploading ? 'wait' : 'pointer',
          }}
        >
          <Sparkles size={16} />
          Try with Demo Dataset
          <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>
            75 texts, 5 topics
          </span>
        </button>
      </div>
    </div>
  );
}
