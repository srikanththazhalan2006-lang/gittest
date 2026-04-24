"""
Pydantic models for request/response validation.
"""

from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


# ---------------------------------------------------------------------------
# Student
# ---------------------------------------------------------------------------

class StudentBase(BaseModel):
    student_id: str
    name: str
    attendance_rate: float = Field(..., ge=0, le=100)
    assignment_score: float = Field(..., ge=0, le=100)
    exam_score: float = Field(..., ge=0, le=100)
    participation_score: float = Field(..., ge=0, le=100)
    family_income_level: str  # "low" | "medium" | "high"
    previous_backlogs: int = Field(..., ge=0)
    semester: int = Field(..., ge=1, le=12)
    dropout_reason: Optional[str] = ""
    dropped_out: int = Field(..., ge=0, le=1)
    predicted_probability: Optional[float] = None


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    id: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

class PredictionOut(BaseModel):
    student_id: str
    probability: float
    risk_level: str          # "High" | "Medium" | "Low"
    predicted_at: datetime
    risk_explanation: Optional[str] = None


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

class FeedbackCreate(BaseModel):
    student_id: str
    teacher_name: str
    message: str
    date: Optional[str] = None   # ISO date string; defaults to today if omitted


class FeedbackOut(FeedbackCreate):
    id: Optional[str] = None


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

class TrainResponse(BaseModel):
    message: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    num_samples: int
    correlation: dict


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    message: str
    inserted: int
    skipped: int
