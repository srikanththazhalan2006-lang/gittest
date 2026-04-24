"""
Route: /students
GET  /students         → list all students (with predicted_probability)
GET  /students/{name}  → search student by name (case-insensitive)
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from bson import ObjectId

router = APIRouter()


def _serialize(doc: dict) -> dict:
    """Convert MongoDB _id ObjectId to string."""
    doc["id"] = str(doc.pop("_id", ""))
    return doc


@router.get("/")
async def list_students():
    """Return all students sorted by predicted_probability descending."""
    db = get_db()
    students = list(
        db.students.find({}, {"_id": 1, "student_id": 1, "name": 1,
                               "attendance_rate": 1, "assignment_score": 1,
                               "exam_score": 1, "participation_score": 1,
                               "family_income_level": 1, "previous_backlogs": 1,
                               "semester": 1, "dropout_reason": 1,
                               "dropped_out": 1, "predicted_probability": 1})
        .sort("predicted_probability", -1)
    )
    return [_serialize(s) for s in students]


@router.get("/stats")
async def get_stats():
    """Return dashboard summary statistics."""
    db = get_db()
    total = db.students.count_documents({})
    high_risk = db.students.count_documents(
        {"predicted_probability": {"$gte": 0.70}}
    )
    pipeline = [
        {"$group": {"_id": None, "avg": {"$avg": "$predicted_probability"}}}
    ]
    agg = list(db.students.aggregate(pipeline))
    avg_val = agg[0].get("avg") if agg else None
    avg_prob = round(avg_val * 100, 1) if avg_val is not None else 0.0
    return {"total": total, "high_risk": high_risk, "avg_probability": avg_prob}


@router.get("/{name}")
async def get_student_by_name(name: str):
    """Search student by name (case-insensitive partial match)."""
    db = get_db()
    regex = {"$regex": name, "$options": "i"}
    student = db.students.find_one({"name": regex})
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{name}' not found.")

    student = _serialize(student)

    # Attach latest prediction metadata
    pred = db.predictions.find_one(
        {"student_id": student["student_id"]},
        sort=[("predicted_at", -1)]
    )
    if pred:
        student["risk_level"] = pred.get("risk_level", "Unknown")
        student["risk_explanation"] = pred.get("risk_explanation", "")

    # Attach all semester records for chart (same student_id, sorted by semester)
    all_records = list(
        db.students.find(
            {"student_id": student["student_id"]},
            {"_id": 0, "semester": 1, "attendance_rate": 1,
             "assignment_score": 1, "exam_score": 1}
        ).sort("semester", 1)
    )
    student["performance_history"] = all_records

    return student
