import { useState, useMemo, useCallback } from 'react';
import { AnalyzeResult, PointData, ClusterInfo, AliasPair } from '../types';
import ScatterPlot from './ScatterPlot';
import SidePanel from './SidePanel';
import FilterBar from './FilterBar';
import { getExportUrl } from '../api';
import { Download, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  results: AnalyzeResult;
  fileId: string;
}

const CLUSTER_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b',
  '#84cc16', '#e879f9', '#fb923c', '#2dd4bf', '#a78bfa',
  '#fbbf24', '#34d399', '#f472b6', '#38bdf8', '#c084fc',
];

export default function ResultsView({ results, fileId }: Props) {
  const [selectedPoint, setSelectedPoint] = useState<PointData | null>(null);
  const [showNoise, setShowNoise] = useState(true);
  const [selectedClusters, setSelectedClusters] = useState<Set<number>>(new Set(
    results.clusters.map(c => c.cluster_id)
  ));
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPoints, setHighlightedPoints] = useState<Set<number>>(new Set());
  const [showAliases, setShowAliases] = useState(results.aliases?.length > 0);
  const [expandedAlias, setExpandedAlias] = useState<number | null>(null);

  const getClusterColor = useCallback((clusterId: number) => {
    if (clusterId === -1) return 'var(--noise-color)';
    return CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length];
  }, []);

  const filteredPoints = useMemo(() => {
    return results.points.filter(p => {
      if (p.is_noise && !showNoise) return false;
      if (!selectedClusters.has(p.cluster)) return false;
      return true;
    });
  }, [results.points, showNoise, selectedClusters]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setHighlightedPoints(new Set());
      return;
    }
    const lower = query.toLowerCase();
    const matched = new Set<number>();
    results.points.forEach(p => {
      if (p.text.toLowerCase().includes(lower)) {
        matched.add(p.index);
      }
    });
    setHighlightedPoints(matched);
  }, [results.points]);

  const toggleCluster = useCallback((clusterId: number) => {
    setSelectedClusters(prev => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  }, []);

  const selectAllClusters = useCallback(() => {
    setSelectedClusters(new Set(results.clusters.map(c => c.cluster_id)));
  }, [results.clusters]);

  const selectNoneClusters = useCallback(() => {
    setSelectedClusters(new Set());
  }, []);

  const selectedClusterInfo = useMemo(() => {
    if (!selectedPoint) return null;
    return results.clusters.find(c => c.cluster_id === selectedPoint.cluster) || null;
  }, [selectedPoint, results.clusters]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <FilterBar
        clusters={results.clusters}
        selectedClusters={selectedClusters}
        showNoise={showNoise}
        searchQuery={searchQuery}
        totalPoints={results.total_points}
        noiseCount={results.noise_count}
        filteredCount={filteredPoints.length}
        searchMatchCount={highlightedPoints.size}
        getClusterColor={getClusterColor}
        onToggleCluster={toggleCluster}
        onToggleNoise={() => setShowNoise(!showNoise)}
        onSearch={handleSearch}
        onSelectAll={selectAllClusters}
        onSelectNone={selectNoneClusters}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <ScatterPlot
            points={filteredPoints}
            highlightedPoints={highlightedPoints}
            selectedPoint={selectedPoint}
            getClusterColor={getClusterColor}
            onSelectPoint={setSelectedPoint}
          />

          <div style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 8,
            zIndex: 10,
          }}>
            {results.aliases?.length > 0 && (
              <button
                onClick={() => setShowAliases(!showAliases)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: showAliases ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                  color: showAliases ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 12,
                  border: `1px solid ${showAliases ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                }}
              >
                <Eye size={13} />
                Aliases ({results.aliases.length})
              </button>
            )}
            <a
              href={getExportUrl(fileId)}
              download
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}
            >
              <Download size={13} />
              Export CSV
            </a>
          </div>

          {showAliases && results.aliases?.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: 56,
              right: 16,
              width: 360,
              maxHeight: 400,
              overflow: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              zIndex: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Eye size={13} />
                Detected Aliases / Codenames
              </div>
              {results.aliases.map((alias, i) => (
                <div key={i} style={{ borderBottom: i < results.aliases.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <button
                    onClick={() => setExpandedAlias(expandedAlias === i ? null : i)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: expandedAlias === i ? 'var(--bg-tertiary)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        background: 'var(--accent-dim)',
                        color: 'var(--accent)',
                      }}>
                        {alias.word_a}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>&harr;</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        background: 'var(--accent-dim)',
                        color: 'var(--accent)',
                      }}>
                        {alias.word_b}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {Math.round(alias.similarity * 100)}%
                      </span>
                      {expandedAlias === i ? <ChevronUp size={12} color="var(--text-tertiary)" /> : <ChevronDown size={12} color="var(--text-tertiary)" />}
                    </div>
                  </button>
                  {expandedAlias === i && (
                    <div style={{ padding: '0 16px 12px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                        Clusters: {alias.shared_clusters.join(', ')}
                      </div>
                      {alias.sample_contexts_a.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            "{alias.word_a}" context
                          </div>
                          <p style={{
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-primary)',
                            padding: 8,
                            borderRadius: 'var(--radius-sm)',
                            lineHeight: 1.5,
                          }}>
                            {alias.sample_contexts_a[0].length > 120
                              ? alias.sample_contexts_a[0].slice(0, 120) + '...'
                              : alias.sample_contexts_a[0]}
                          </p>
                        </div>
                      )}
                      {alias.sample_contexts_b.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            "{alias.word_b}" context
                          </div>
                          <p style={{
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-primary)',
                            padding: 8,
                            borderRadius: 'var(--radius-sm)',
                            lineHeight: 1.5,
                          }}>
                            {alias.sample_contexts_b[0].length > 120
                              ? alias.sample_contexts_b[0].slice(0, 120) + '...'
                              : alias.sample_contexts_b[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPoint && (
          <SidePanel
            point={selectedPoint}
            cluster={selectedClusterInfo}
            getClusterColor={getClusterColor}
            onClose={() => setSelectedPoint(null)}
          />
        )}
      </div>
    </div>
  );
}
