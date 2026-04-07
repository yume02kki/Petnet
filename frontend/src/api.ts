import { UploadResult, JobStatus, AnalyzeResult } from './types';

const BASE = '/api';

export async function loadMockData(): Promise<UploadResult> {
  const res = await fetch(`${BASE}/mock`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load demo' }));
    throw new Error(err.detail || 'Failed to load demo');
  }
  return res.json();
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function startAnalysis(params: {
  file_id: string;
  text_column: string;
  metadata_columns: string[];
  min_cluster_size: number;
  min_samples: number;
}): Promise<{ job_id: string }> {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE}/analyze/${jobId}/status`);
  if (!res.ok) throw new Error('Failed to get status');
  return res.json();
}

export async function getResults(jobId: string): Promise<AnalyzeResult> {
  const res = await fetch(`${BASE}/analyze/${jobId}/results`);
  if (!res.ok) throw new Error('Failed to get results');
  return res.json();
}

export function getExportUrl(jobId: string): string {
  return `${BASE}/analyze/${jobId}/export`;
}
