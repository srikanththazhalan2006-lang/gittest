"""
Route: POST /upload-csv
Accepts a multipart CSV file, validates columns, inserts into MongoDB students collection.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from database import get_db
from utils.csv_parser import parse_csv_bytes
from models.student_model import UploadResponse

router = APIRouter()

REQUIRED_COLUMNS = {
    "student_id", "name", "attendance_rate", "assignment_score",
    "exam_score", "participation_score", "family_income_level",
    "previous_backlogs", "semester", "dropout_reason", "dropped_out",
}


@router.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Parse uploaded CSV and bulk-insert students into MongoDB.
    Skips rows where student_id already exists (upsert logic).
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    try:
        records = parse_csv_bytes(contents, REQUIRED_COLUMNS)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    db = get_db()
    inserted = 0
    skipped = 0

    for rec in records:
        existing = db.students.find_one({"student_id": rec["student_id"]})
        if existing:
            skipped += 1
            continue
        db.students.insert_one(rec)
        inserted += 1

    return UploadResponse(
        message=f"Upload complete. {inserted} inserted, {skipped} skipped (duplicates).",
        inserted=inserted,
        skipped=skipped,
    )
