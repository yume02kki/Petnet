import { PointData, ClusterInfo } from '../types';
import { X, Hash, Tag, FileText } from 'lucide-react';

interface Props {
  point: PointData;
  cluster: ClusterInfo | null;
  getClusterColor: (clusterId: number) => string;
  onClose: () => void;
}

export default function SidePanel({ point, cluster, getClusterColor, onClose }: Props) {
  const color = getClusterColor(point.cluster);
  const metaEntries = Object.entries(point.metadata).filter(([, v]) => v);

  return (
    <div
      className="fade-in"
      style={{
        width: 360,
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Details</span>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: 'none',
            color: 'var(--text-tertiary)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {point.is_noise ? 'Noise (Outlier)' : `Cluster ${point.cluster}`}
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginLeft: 'auto',
          }}>
            #{point.index}
          </span>
        </div>

        {point.display_text && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}>
              <FileText size={12} />
              Translated Text
            </div>
            <p style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              background: 'var(--bg-primary)',
              padding: 14,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {point.display_text}
            </p>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}>
            <FileText size={12} />
            {point.display_text ? 'Source Text' : 'Text'}
          </div>
          <p style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            background: 'var(--bg-primary)',
            padding: 14,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {point.text}
          </p>
        </div>

        {cluster && cluster.keywords.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}>
              <Tag size={12} />
              Cluster Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {cluster.keywords.map(kw => (
                <span
                  key={kw}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {cluster && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}>
              <Hash size={12} />
              Cluster Info
            </div>
            <div style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              fontSize: 13,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Size</span>
                <span>{cluster.size} points</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cluster ID</span>
                <span>{cluster.cluster_id === -1 ? 'Noise' : cluster.cluster_id}</span>
              </div>
            </div>
          </div>
        )}

        {metaEntries.length > 0 && (
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}>
              Metadata
            </div>
            <div style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              fontSize: 13,
            }}>
              {metaEntries.map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span style={{ textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
