import { useState } from 'react';
import { UploadResult } from '../types';
import { Play, Check, Settings2 } from 'lucide-react';

interface Props {
  uploadResult: UploadResult;
  onAnalyze: (
    textColumn: string,
    metadataColumns: string[],
    minClusterSize: number,
    minSamples: number,
  ) => void;
}

export default function ColumnSelector({ uploadResult, onAnalyze }: Props) {
  const [textColumn, setTextColumn] = useState('');
  const [metadataColumns, setMetadataColumns] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minClusterSize, setMinClusterSize] = useState(15);
  const [minSamples, setMinSamples] = useState(5);

  const toggleMetadata = (col: string) => {
    setMetadataColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: 13,
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: 560,
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: 32,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Configure Analysis</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {uploadResult.total_rows.toLocaleString()} rows loaded from {uploadResult.filename}
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Text Column *
          </label>
          <select
            value={textColumn}
            onChange={e => setTextColumn(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select a column...</option>
            {uploadResult.columns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
          {textColumn && (
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Sample: "{uploadResult.columns.find(c => c.name === textColumn)?.sample_values[0]}"
            </p>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            Metadata Columns (optional)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {uploadResult.columns
              .filter(c => c.name !== textColumn)
              .map(col => {
                const selected = metadataColumns.includes(col.name);
                return (
                  <button
                    key={col.name}
                    onClick={() => toggleMetadata(col.name)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: selected ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                      color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      transition: 'var(--transition)',
                    }}
                  >
                    {selected && <Check size={12} />}
                    {col.name}
                  </button>
                );
              })}
          </div>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-tertiary)',
            background: 'none',
            marginBottom: showAdvanced ? 16 : 24,
          }}
        >
          <Settings2 size={13} />
          Advanced Settings
        </button>

        {showAdvanced && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24,
            padding: 16,
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Min Cluster Size
              </label>
              <input
                type="number"
                value={minClusterSize}
                onChange={e => setMinClusterSize(Number(e.target.value))}
                min={2}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Min Samples
              </label>
              <input
                type="number"
                value={minSamples}
                onChange={e => setMinSamples(Number(e.target.value))}
                min={1}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => textColumn && onAnalyze(textColumn, metadataColumns, minClusterSize, minSamples)}
          disabled={!textColumn}
          style={{
            width: '100%',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            background: textColumn ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: textColumn ? '#fff' : 'var(--text-tertiary)',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'var(--transition)',
            cursor: textColumn ? 'pointer' : 'not-allowed',
          }}
        >
          <Play size={15} />
          Run Analysis
        </button>
      </div>
    </div>
  );
}
