"""
Route: POST /train
Triggers model retraining using all student data in MongoDB.
Returns accuracy metrics and correlation analysis.
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from ml.train_model import train_model
from models.student_model import TrainResponse

router = APIRouter()


@router.post("/train", response_model=TrainResponse)
async def retrain_model():
    """
    Pull all student records from MongoDB, retrain Logistic Regression,
    save model.pkl, and return performance metrics.
    """
    db = get_db()
    count = db.students.count_documents({})
    if count < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough data to train. Need at least 10 records, found {count}."
        )

    try:
        metrics = train_model(db)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(exc)}")

    return TrainResponse(
        message="Model retrained successfully ✅",
        accuracy=metrics["accuracy"],
        precision=metrics["precision"],
        recall=metrics["recall"],
        f1_score=metrics["f1_score"],
        num_samples=metrics["num_samples"],
        correlation=metrics["correlation"],
    )
