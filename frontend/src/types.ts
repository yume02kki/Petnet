export interface ColumnInfo {
  name: string;
  dtype: string;
  sample_values: string[];
}

export interface UploadResult {
  file_id: string;
  filename: string;
  columns: ColumnInfo[];
  total_rows: number;
}

export interface PointData {
  index: number;
  x: number;
  y: number;
  cluster: number;
  is_noise: boolean;
  text: string;
  display_text?: string;
  metadata: Record<string, string>;
}

export interface ClusterInfo {
  cluster_id: number;
  size: number;
  keywords: string[];
}

export interface AliasPair {
  word_a: string;
  word_b: string;
  similarity: number;
  shared_clusters: number[];
  sample_contexts_a: string[];
  sample_contexts_b: string[];
}

export interface AnalyzeResult {
  points: PointData[];
  clusters: ClusterInfo[];
  aliases: AliasPair[];
  total_points: number;
  noise_count: number;
}

export interface JobStatus {
  status: 'running' | 'completed' | 'error';
  progress: number;
  stage: string;
  error?: string;
}
