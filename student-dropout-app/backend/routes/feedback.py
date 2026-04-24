"""
Route: /feedback
POST /feedback                   → submit teacher feedback for a student
GET  /feedback/{student_id}      → retrieve all feedback for a student
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from models.student_model import FeedbackCreate, FeedbackOut
from datetime import date
from bson import ObjectId

router = APIRouter()


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id", ""))
    return doc


@router.post("/", response_model=FeedbackOut)
async def submit_feedback(feedback: FeedbackCreate):
    """Store a teacher's feedback entry for a student."""
    db = get_db()

    # Verify student exists
    student = db.students.find_one({"student_id": feedback.student_id})
    if not student:
        raise HTTPException(
            status_code=404,
            detail=f"Student '{feedback.student_id}' not found."
        )

    doc = feedback.model_dump()
    if not doc.get("date"):
        doc["date"] = date.today().isoformat()

    result = db.feedback.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return FeedbackOut(**doc)


@router.get("/{student_id}", response_model=list[FeedbackOut])
async def get_feedback(student_id: str):
    """Return all feedback entries for a given student, newest first."""
    db = get_db()
    docs = list(
        db.feedback.find({"student_id": student_id}).sort("date", -1)
    )
    return [_serialize(d) for d in docs]
