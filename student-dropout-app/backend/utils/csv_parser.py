"""
CSV Parser Utility
------------------
Reads raw CSV bytes, validates required columns, coerces types,
and returns a clean list of dicts ready for MongoDB insertion.
"""

import io
import pandas as pd
from typing import Set, List


INCOME_VALUES = {"low", "medium", "high"}


def parse_csv_bytes(contents: bytes, required_columns: Set[str]) -> List[dict]:
    """
    Parse CSV bytes into a validated list of student dicts.

    Args:
        contents: raw bytes from uploaded file.
        required_columns: set of column names that MUST be present.

    Returns:
        list of clean student dicts.

    Raises:
        ValueError: if required columns are missing or data is malformed.
    """
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as exc:
        raise ValueError(f"Could not parse CSV file: {exc}")

    # Normalise column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Validate required columns
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(
            f"CSV is missing required columns: {sorted(missing)}. "
            f"Found columns: {list(df.columns)}"
        )

    # Drop completely empty rows
    df.dropna(how="all", inplace=True)

    # Coerce numeric columns
    numeric_cols = [
        "attendance_rate", "assignment_score", "exam_score",
        "participation_score", "previous_backlogs", "dropped_out", "semester",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Fill sensible defaults
    df["dropout_reason"] = df.get("dropout_reason", pd.Series(dtype=str)).fillna("")
    df["predicted_probability"] = None

    # Validate family_income_level values
    if "family_income_level" in df.columns:
        df["family_income_level"] = (
            df["family_income_level"].str.strip().str.lower()
        )
        invalid = df[~df["family_income_level"].isin(INCOME_VALUES)]
        if not invalid.empty:
            bad_vals = invalid["family_income_level"].unique().tolist()
            raise ValueError(
                f"Invalid family_income_level values found: {bad_vals}. "
                f"Allowed: {sorted(INCOME_VALUES)}"
            )

    # Validate dropped_out is 0 or 1
    if "dropped_out" in df.columns:
        df["dropped_out"] = df["dropped_out"].fillna(0).astype(int)
        invalid_do = df[~df["dropped_out"].isin([0, 1])]
        if not invalid_do.empty:
            raise ValueError("'dropped_out' column must only contain 0 or 1.")

    # Convert student_id to string
    df["student_id"] = df["student_id"].astype(str).str.strip()

    records = df.to_dict(orient="records")
    return records
