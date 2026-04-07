import { JobStatus } from '../types';
import { Loader2 } from 'lucide-react';

interface Props {
  status: JobStatus | null;
}

export default function ProcessingView({ status }: Props) {
  const progress = status?.progress ?? 0;
  const stage = status?.stage ?? 'Initializing...';

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <div className="fade-in" style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Loader2 size={24} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Processing
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {stage}
        </p>

        <div style={{
          width: '100%',
          height: 4,
          background: 'var(--bg-tertiary)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent), #a855f7)',
            borderRadius: 2,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
          {progress}%
        </p>
      </div>
    </div>
  );
}
