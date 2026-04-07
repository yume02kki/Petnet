import { useState, useMemo, useCallback } from 'react';
import { AnalyzeResult, PointData, ClusterInfo } from '../types';
import ScatterPlot from './ScatterPlot';
import SidePanel from './SidePanel';
import FilterBar from './FilterBar';
import { getExportUrl } from '../api';
import { Download } from 'lucide-react';

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

          <a
            href={getExportUrl(fileId)}
            download
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
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
              zIndex: 10,
            }}
          >
            <Download size={13} />
            Export CSV
          </a>
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
