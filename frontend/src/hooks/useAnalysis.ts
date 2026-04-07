import { useState, useCallback, useRef } from 'react';
import { UploadResult, AnalyzeResult, JobStatus } from '../types';
import { uploadFile, loadMockData, startAnalysis, getJobStatus, getResults } from '../api';

export type AppStage = 'upload' | 'configure' | 'processing' | 'results';

export function useAnalysis() {
  const [stage, setStage] = useState<AppStage>('upload');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [results, setResults] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const pollRef = useRef<number | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      setUploadResult(result);
      setStage('configure');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleLoadDemo = useCallback(async () => {
    setError(null);
    setIsUploading(true);
    try {
      const result = await loadMockData();
      setUploadResult(result);
      setStage('configure');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleAnalyze = useCallback(async (
    textColumn: string,
    metadataColumns: string[],
    minClusterSize: number,
    minSamples: number,
  ) => {
    if (!uploadResult) return;
    setError(null);
    setStage('processing');

    try {
      const { job_id } = await startAnalysis({
        file_id: uploadResult.file_id,
        text_column: textColumn,
        metadata_columns: metadataColumns,
        min_cluster_size: minClusterSize,
        min_samples: minSamples,
      });

      const poll = () => {
        pollRef.current = window.setTimeout(async () => {
          try {
            const status = await getJobStatus(job_id);
            setJobStatus(status);

            if (status.status === 'completed') {
              const data = await getResults(job_id);
              setResults(data);
              setStage('results');
            } else if (status.status === 'error') {
              setError(status.error || 'Analysis failed');
              setStage('configure');
            } else {
              poll();
            }
          } catch {
            poll();
          }
        }, 1000);
      };

      poll();
    } catch (e: any) {
      setError(e.message);
      setStage('configure');
    }
  }, [uploadResult]);

  const reset = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setStage('upload');
    setUploadResult(null);
    setJobStatus(null);
    setResults(null);
    setError(null);
  }, []);

  return {
    stage,
    uploadResult,
    jobStatus,
    results,
    error,
    isUploading,
    handleUpload,
    handleLoadDemo,
    handleAnalyze,
    reset,
  };
}
