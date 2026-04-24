"""
ML Training Module
------------------
Reads all student records from MongoDB, preprocesses features,
trains a Logistic Regression model, saves it with joblib,
and returns full evaluation metrics + Pearson correlation map.
"""

import os
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
from ml.correlation import compute_correlation

# Path where trained model artifact is saved
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


def _preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """Encode categoricals and cast numerics."""
    df = df.copy()
    df["family_income_level"] = (
        df["family_income_level"]
        .str.strip()
        .str.lower()
        .map(INCOME_MAP)
        .fillna(1)
        .astype(int)
    )
    for col in ["attendance_rate", "assignment_score", "exam_score",
                "participation_score", "previous_backlogs"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    return df


def train_model(db) -> dict:
    """
    Full training pipeline:
    1. Load data from MongoDB
    2. Preprocess
    3. Train Logistic Regression (80/20 split)
    4. Evaluate
    5. Save model + scaler
    6. Return metrics dict
    """
    # -----------------------------------------------------------------
    # 1. Load from MongoDB
    # -----------------------------------------------------------------
    records = list(db.students.find({}, {
        "attendance_rate": 1, "assignment_score": 1, "exam_score": 1,
        "participation_score": 1, "family_income_level": 1,
        "previous_backlogs": 1, "dropped_out": 1, "_id": 0
    }))

    df = pd.DataFrame(records)

    # Validate target column
    if "dropped_out" not in df.columns:
        raise ValueError("Column 'dropped_out' is missing from student data.")

    df = _preprocess(df)
    df.dropna(subset=FEATURE_COLUMNS + ["dropped_out"], inplace=True)

    X = df[FEATURE_COLUMNS]
    y = df["dropped_out"].astype(int)

    if len(y.unique()) < 2:
        raise ValueError("Training data must contain both dropout (1) and non-dropout (0) samples.")

    # -----------------------------------------------------------------
    # 2. Train/test split
    # -----------------------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # -----------------------------------------------------------------
    # 3. Scale features
    # -----------------------------------------------------------------
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # -----------------------------------------------------------------
    # 4. Train model
    # -----------------------------------------------------------------
    model = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    model.fit(X_train_scaled, y_train)

    # -----------------------------------------------------------------
    # 5. Evaluate
    # -----------------------------------------------------------------
    y_pred = model.predict(X_test_scaled)
    metrics = {
        "accuracy":  round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall":    round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score":  round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "num_samples": int(len(df)),
    }

    # -----------------------------------------------------------------
    # 6. Correlation analysis
    # -----------------------------------------------------------------
    metrics["correlation"] = compute_correlation(df, FEATURE_COLUMNS)

    # -----------------------------------------------------------------
    # 7. Persist artifacts
    # -----------------------------------------------------------------
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"✅  Model saved → {MODEL_PATH}")
    print(f"✅  Scaler saved → {SCALER_PATH}")

    return metrics
