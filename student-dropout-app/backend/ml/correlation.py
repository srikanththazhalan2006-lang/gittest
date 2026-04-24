"""
Pearson Correlation Analysis
-----------------------------
Computes the Pearson correlation of each numeric feature against the
'dropped_out' target column. Returns a sorted dict for the frontend chart.
"""

import pandas as pd
from typing import List


def compute_correlation(df: pd.DataFrame, feature_columns: List[str]) -> dict:
    """
    Args:
        df: DataFrame that already has numeric features + 'dropped_out' column.
        feature_columns: list of feature column names to correlate.

    Returns:
        dict sorted by absolute correlation (descending):
        { "attendance_rate": -0.72, "exam_score": -0.65, ... }
    """
    if "dropped_out" not in df.columns:
        return {}

    numeric_df = df[feature_columns + ["dropped_out"]].apply(
        pd.to_numeric, errors="coerce"
    )
    corr_series = numeric_df.corr()["dropped_out"].drop("dropped_out")

    # Sort by absolute value descending
    corr_sorted = corr_series.reindex(
        corr_series.abs().sort_values(ascending=False).index
    )

    return {k: round(float(v), 4) for k, v in corr_sorted.items()}
