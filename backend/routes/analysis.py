import os
import asyncio
import csv
import io
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.vectorizer import generate_embeddings
from services.clustering import cluster_embeddings, extract_cluster_keywords
from services.text_processing import clean_texts

import pandas as pd
import numpy as np
import umap

router = APIRouter()

# In-memory job store
_jobs: dict[str, dict] = {}


@router.post("/analyze")
async def start_analysis(request: AnalyzeRequest):
    file_path = os.path.join("uploads", f"{request.file_id}.xlsx")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    job_id = request.file_id
    _jobs[job_id] = {"status": "running", "progress": 0, "stage": "Loading data"}

    asyncio.create_task(_run_pipeline(job_id, file_path, request))

    return {"job_id": job_id}


@router.get("/analyze/{job_id}/status")
async def get_status(job_id: str):
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = _jobs[job_id]
    return {
        "status": job["status"],
        "progress": job.get("progress", 0),
        "stage": job.get("stage", ""),
        "error": job.get("error"),
    }


@router.get("/analyze/{job_id}/results")
async def get_results(job_id: str) -> AnalyzeResponse:
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = _jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Analysis not completed")
    return job["result"]


@router.get("/analyze/{job_id}/export")
async def export_results(job_id: str):
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = _jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Analysis not completed")

    result: AnalyzeResponse = job["result"]
    output = io.StringIO()
    writer = csv.writer(output)

    meta_keys = list(result.points[0].metadata.keys()) if result.points and result.points[0].metadata else []
    has_display = any(p.display_text for p in result.points)
    header = ["index", "x", "y", "cluster", "is_noise", "text"]
    if has_display:
        header.append("display_text")
    header += meta_keys
    writer.writerow(header)

    for p in result.points:
        row = [p.index, p.x, p.y, p.cluster, p.is_noise, p.text]
        if has_display:
            row.append(p.display_text or "")
        row += [p.metadata.get(k, "") for k in meta_keys]
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=results_{job_id}.csv"},
    )


async def _run_pipeline(job_id: str, file_path: str, request: AnalyzeRequest):
    try:
        _jobs[job_id].update(stage="Loading data", progress=5)
        df = await asyncio.to_thread(pd.read_excel, file_path)

        if request.text_column not in df.columns:
            raise ValueError(f"Column '{request.text_column}' not found")

        texts = df[request.text_column].astype(str).tolist()

        display_texts = None
        if request.display_text_column and request.display_text_column in df.columns:
            display_texts = df[request.display_text_column].astype(str).tolist()

        _jobs[job_id].update(stage="Cleaning text", progress=10)
        cleaned = await asyncio.to_thread(clean_texts, texts)

        _jobs[job_id].update(stage="Generating embeddings", progress=20)
        embeddings = await asyncio.to_thread(generate_embeddings, cleaned)

        _jobs[job_id].update(stage="Reducing dimensions", progress=60)
        n_neighbors = min(15, max(2, len(cleaned) - 1))
        reducer = umap.UMAP(n_components=2, n_neighbors=n_neighbors, min_dist=0.1, random_state=42)
        coords_2d = await asyncio.to_thread(reducer.fit_transform, embeddings)

        _jobs[job_id].update(stage="Clustering", progress=80)
        labels = await asyncio.to_thread(
            cluster_embeddings, embeddings, request.min_cluster_size, request.min_samples
        )

        _jobs[job_id].update(stage="Extracting keywords", progress=85)
        cluster_infos = await asyncio.to_thread(extract_cluster_keywords, cleaned, labels)

        metadata_cols = [c for c in request.metadata_columns if c in df.columns]

        points = []
        for i in range(len(cleaned)):
            meta = {}
            for col in metadata_cols:
                val = df[col].iloc[i]
                meta[col] = str(val) if pd.notna(val) else ""

            point = {
                "index": i,
                "x": float(coords_2d[i, 0]),
                "y": float(coords_2d[i, 1]),
                "cluster": int(labels[i]),
                "is_noise": bool(labels[i] == -1),
                "text": texts[i],
                "metadata": meta,
            }
            if display_texts:
                point["display_text"] = display_texts[i]
            points.append(point)

        noise_count = int(np.sum(np.array(labels) == -1))

        result = AnalyzeResponse(
            points=points,
            clusters=cluster_infos,
            total_points=len(points),
            noise_count=noise_count,
        )

        _jobs[job_id].update(status="completed", progress=100, stage="Done", result=result)

    except Exception as e:
        _jobs[job_id].update(status="error", error=str(e))
