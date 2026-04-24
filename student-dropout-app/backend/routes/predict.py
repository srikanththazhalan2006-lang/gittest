"""
Route: POST /predict/{student_id}
Loads the trained model and predicts dropout probability for a given student.
Saves prediction to MongoDB `predictions` collection and updates student record.
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from ml.predict import predict_student
from models.student_model import PredictionOut
from datetime import datetime, timezone

router = APIRouter()


def _risk_label(prob: float) -> str:
    if prob >= 0.70:
        return "High"
    elif prob >= 0.40:
        return "Medium"
    return "Low"


def _risk_explanation(student: dict, prob: float) -> str:
    reasons = []
    if student.get("attendance_rate", 100) < 60:
        reasons.append("low attendance rate")
    if student.get("exam_score", 100) < 50:
        reasons.append("poor exam performance")
    if student.get("assignment_score", 100) < 50:
        reasons.append("low assignment scores")
    if student.get("previous_backlogs", 0) >= 3:
        reasons.append("multiple backlogs")
    if student.get("family_income_level", "high") == "low":
        reasons.append("low family income")
    if student.get("dropout_reason"):
        reasons.append(f'stated reason: \"{student["dropout_reason"]}\"')

    if not reasons:
        return "Student shows healthy academic indicators with low dropout risk."
    return f"Dropout risk ({round(prob*100,1)}%) driven by: " + ", ".join(reasons) + "."


@router.post("/predict/{student_id}", response_model=PredictionOut)
async def predict(student_id: str):
    db = get_db()
    student = db.students.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

    try:
        probability = predict_student(student)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Model not trained yet. Call POST /train first."
        )

    risk = _risk_label(probability)
    explanation = _risk_explanation(student, probability)
    now = datetime.now(timezone.utc)

    # Persist prediction
    pred_doc = {
        "student_id": student_id,
        "probability": probability,
        "risk_level": risk,
        "risk_explanation": explanation,
        "predicted_at": now,
    }
    db.predictions.insert_one(pred_doc)

    # Update student record with latest probability
    db.students.update_one(
        {"student_id": student_id},
        {"$set": {"predicted_probability": probability}},
    )

    return PredictionOut(
        student_id=student_id,
        probability=probability,
        risk_level=risk,
        predicted_at=now,
        risk_explanation=explanation,
    )


@router.post("/predict-all")
async def predict_all():
    """Run prediction for every student in the database."""
    db = get_db()
    students = list(db.students.find({}))
    if not students:
        raise HTTPException(status_code=404, detail="No students in database.")

    updated = 0
    errors = []
    for student in students:
        try:
            probability = predict_student(student)
            risk = _risk_label(probability)
            explanation = _risk_explanation(student, probability)
            now = datetime.now(timezone.utc)

            db.predictions.insert_one({
                "student_id": student["student_id"],
                "probability": probability,
                "risk_level": risk,
                "risk_explanation": explanation,
                "predicted_at": now,
            })
            db.students.update_one(
                {"student_id": student["student_id"]},
                {"$set": {"predicted_probability": probability}},
            )
            updated += 1
        except Exception as exc:
            errors.append({"student_id": student.get("student_id"), "error": str(exc)})

    return {"updated": updated, "errors": errors}
