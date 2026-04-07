import { ClusterInfo } from '../types';
import { Search, Eye, EyeOff } from 'lucide-react';

interface Props {
  clusters: ClusterInfo[];
  selectedClusters: Set<number>;
  showNoise: boolean;
  searchQuery: string;
  totalPoints: number;
  noiseCount: number;
  filteredCount: number;
  searchMatchCount: number;
  getClusterColor: (clusterId: number) => string;
  onToggleCluster: (clusterId: number) => void;
  onToggleNoise: () => void;
  onSearch: (query: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}

export default function FilterBar({
  clusters,
  selectedClusters,
  showNoise,
  searchQuery,
  totalPoints,
  noiseCount,
  filteredCount,
  searchMatchCount,
  getClusterColor,
  onToggleCluster,
  onToggleNoise,
  onSearch,
  onSelectAll,
  onSelectNone,
}: Props) {
  const realClusters = clusters.filter(c => c.cluster_id !== -1);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      flexShrink: 0,
      flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        padding: '0 10px',
        flex: '0 0 260px',
      }}>
        <Search size={14} color="var(--text-tertiary)" />
        <input
          type="text"
          placeholder="Search text..."
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--text-primary)',
            fontSize: 13,
            padding: '7px 0',
            width: '100%',
          }}
        />
        {searchQuery && (
          <span style={{ fontSize: 11, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
            {searchMatchCount} found
          </span>
        )}
      </div>

      <div style={{
        height: 20,
        width: 1,
        background: 'var(--border)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {realClusters.map(c => {
          const active = selectedClusters.has(c.cluster_id);
          return (
            <button
              key={c.cluster_id}
              onClick={() => onToggleCluster(c.cluster_id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 14,
                fontSize: 11,
                background: active ? 'var(--bg-tertiary)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: `1px solid ${active ? 'var(--border-light)' : 'transparent'}`,
                transition: 'var(--transition)',
                opacity: active ? 1 : 0.5,
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: getClusterColor(c.cluster_id),
              }} />
              {c.cluster_id}
              <span style={{ color: 'var(--text-tertiary)' }}>({c.size})</span>
            </button>
          );
        })}
      </div>

      {noiseCount > 0 && (
        <button
          onClick={onToggleNoise}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 14,
            fontSize: 11,
            background: showNoise ? 'var(--bg-tertiary)' : 'transparent',
            color: showNoise ? 'var(--text-secondary)' : 'var(--text-tertiary)',
            border: `1px solid ${showNoise ? 'var(--border)' : 'transparent'}`,
            transition: 'var(--transition)',
          }}
        >
          {showNoise ? <Eye size={12} /> : <EyeOff size={12} />}
          Noise ({noiseCount})
        </button>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onSelectAll}
          style={{
            fontSize: 11, color: 'var(--text-tertiary)', background: 'none',
            textDecoration: 'underline', textUnderlineOffset: 2,
          }}
        >
          All
        </button>
        <button
          onClick={onSelectNone}
          style={{
            fontSize: 11, color: 'var(--text-tertiary)', background: 'none',
            textDecoration: 'underline', textUnderlineOffset: 2,
          }}
        >
          None
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {filteredCount.toLocaleString()} / {totalPoints.toLocaleString()} points
        </span>
      </div>
    </div>
  );
}
