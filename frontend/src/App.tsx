import { useAnalysis } from './hooks/useAnalysis';
import Upload from './components/Upload';
import ColumnSelector from './components/ColumnSelector';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const {
    stage, uploadResult, jobStatus, results, error, isUploading,
    handleUpload, handleAnalyze, reset,
  } = useAnalysis();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
          }}>V</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Text Vectorizer</span>
          {uploadResult && (
            <span style={{
              fontSize: 12, color: 'var(--text-tertiary)',
              marginLeft: 8,
            }}>
              {uploadResult.filename}
            </span>
          )}
        </div>
        {stage !== 'upload' && (
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              fontSize: 13, border: '1px solid var(--border)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <RotateCcw size={14} />
            New Analysis
          </button>
        )}
      </header>

      {error && (
        <div style={{
          padding: '10px 24px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--error)',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <main style={{ flex: 1, overflow: 'hidden' }}>
        {stage === 'upload' && (
          <Upload onUpload={handleUpload} isUploading={isUploading} />
        )}
        {stage === 'configure' && uploadResult && (
          <ColumnSelector
            uploadResult={uploadResult}
            onAnalyze={handleAnalyze}
          />
        )}
        {stage === 'processing' && (
          <ProcessingView status={jobStatus} />
        )}
        {stage === 'results' && results && uploadResult && (
          <ResultsView results={results} fileId={uploadResult.file_id} />
        )}
      </main>
    </div>
  );
}
