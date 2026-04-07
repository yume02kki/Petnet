import uuid
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are supported")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.xlsx")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        df = pd.read_excel(file_path, nrows=5)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {str(e)}")

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample_values = df[col].dropna().head(3).tolist()
        columns.append({
            "name": str(col),
            "dtype": dtype,
            "sample_values": [str(v) for v in sample_values],
        })

    total_rows = len(pd.read_excel(file_path, usecols=[0]))

    return {
        "file_id": file_id,
        "filename": file.filename,
        "columns": columns,
        "total_rows": total_rows,
    }
