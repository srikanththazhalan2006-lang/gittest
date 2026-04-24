"""
ML Inference Module
-------------------
Loads the saved Logistic Regression model and scaler from disk,
preprocesses a single student record, and returns dropout probability (0–1).
"""

import os
import joblib
import pandas as pd

MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "model.pkl"))
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

FEATURE_COLUMNS = [
    "attendance_rate",
    "assignment_score",
    "exam_score",
    "participation_score",
    "family_income_level",
    "previous_backlogs",
]

INCOME_MAP = {"low": 0, "medium": 1, "high": 2}

_model = None
_scaler = None


def _load_artifacts():
    """Lazy-load model and scaler from disk."""
    global _model, _scaler
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found at '{MODEL_PATH}'. "
            "Please call POST /train to train the model first."
        )
    _model = joblib.load(MODEL_PATH)
    _scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
    print(f"✅  Model loaded from {MODEL_PATH}")


def predict_student(student: dict) -> float:
    """
    Given a student dict (from MongoDB), return dropout probability as float [0, 1].
    """
    global _model, _scaler

    # Reload if model not cached or file changed
    if _model is None:
        _load_artifacts()

    # Build single-row DataFrame
    income_raw = str(student.get("family_income_level", "medium")).strip().lower()
    income_encoded = INCOME_MAP.get(income_raw, 1)

    row = {
        "attendance_rate":     float(student.get("attendance_rate", 0)),
        "assignment_score":    float(student.get("assignment_score", 0)),
        "exam_score":          float(student.get("exam_score", 0)),
        "participation_score": float(student.get("participation_score", 0)),
        "family_income_level": income_encoded,
        "previous_backlogs":   int(student.get("previous_backlogs", 0)),
    }
    df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

    # Scale if scaler is available
    if _scaler is not None:
        df_scaled = _scaler.transform(df)
    else:
        df_scaled = df.values

    prob = float(_model.predict_proba(df_scaled)[0][1])
    return round(prob, 4)


def invalidate_cache():
    """Force reload of model on next prediction (call after retraining)."""
    global _model, _scaler
    _model = None
    _scaler = None
