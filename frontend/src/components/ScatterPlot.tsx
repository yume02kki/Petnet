import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { PointData } from '../types';

interface Props {
  points: PointData[];
  highlightedPoints: Set<number>;
  selectedPoint: PointData | null;
  getClusterColor: (clusterId: number) => string;
  onSelectPoint: (point: PointData) => void;
}

export default function ScatterPlot({
  points,
  highlightedPoints,
  selectedPoint,
  getClusterColor,
  onSelectPoint,
}: Props) {
  const traces = useMemo(() => {
    const byCluster = new Map<number, PointData[]>();
    points.forEach(p => {
      const list = byCluster.get(p.cluster) || [];
      list.push(p);
      byCluster.set(p.cluster, list);
    });

    const hasHighlight = highlightedPoints.size > 0;

    const result: any[] = [];

    const sortedKeys = Array.from(byCluster.keys()).sort((a, b) => a - b);

    for (const clusterId of sortedKeys) {
      const clusterPoints = byCluster.get(clusterId)!;
      const color = getClusterColor(clusterId);
      const isNoise = clusterId === -1;

      result.push({
        x: clusterPoints.map(p => p.x),
        y: clusterPoints.map(p => p.y),
        customdata: clusterPoints,
        text: clusterPoints.map(p => {
          const displayStr = p.display_text || p.text;
          const preview = displayStr.length > 80 ? displayStr.slice(0, 80) + '...' : displayStr;
          return preview;
        }),
        hovertemplate: '<b>%{text}</b><br>Cluster: ' + (isNoise ? 'Noise' : clusterId) + '<extra></extra>',
        type: 'scattergl' as const,
        mode: 'markers' as const,
        name: isNoise ? 'Noise' : `Cluster ${clusterId}`,
        marker: {
          size: clusterPoints.map(p => {
            if (selectedPoint?.index === p.index) return 12;
            if (hasHighlight && highlightedPoints.has(p.index)) return 9;
            return isNoise ? 4 : 6;
          }),
          color: color,
          opacity: clusterPoints.map(p => {
            if (hasHighlight && !highlightedPoints.has(p.index)) return 0.15;
            if (isNoise) return 0.35;
            return 0.8;
          }),
          line: {
            width: clusterPoints.map(p =>
              selectedPoint?.index === p.index ? 2 : 0
            ),
            color: '#fff',
          },
        },
      });
    }

    return result;
  }, [points, highlightedPoints, selectedPoint, getClusterColor]);

  const layout = useMemo(() => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#0a0a0b',
    font: { family: 'Inter, sans-serif', color: '#a0a0a8', size: 11 },
    margin: { l: 40, r: 20, t: 20, b: 40 },
    xaxis: {
      showgrid: true,
      gridcolor: '#2a2a30',
      gridwidth: 1,
      zeroline: false,
      showticklabels: false,
    },
    yaxis: {
      showgrid: true,
      gridcolor: '#2a2a30',
      gridwidth: 1,
      zeroline: false,
      showticklabels: false,
    },
    showlegend: false,
    hovermode: 'closest' as const,
    dragmode: 'pan' as const,
    autosize: true,
  }), []);

  return (
    <Plot
      data={traces}
      layout={layout}
      config={{
        displayModeBar: true,
        modeBarButtonsToRemove: [
          'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian',
          'hoverCompareCartesian', 'toggleSpikelines',
        ],
        displaylogo: false,
        scrollZoom: true,
        responsive: true,
      }}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
      onClick={(event: any) => {
        if (event.points?.[0]?.customdata) {
          onSelectPoint(event.points[0].customdata);
        }
      }}
    />
  );
}
