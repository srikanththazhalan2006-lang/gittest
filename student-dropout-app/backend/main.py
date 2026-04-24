"""
Student Dropout Prediction - FastAPI Backend
Main application entry point with CORS, routes, and startup events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routes import students, upload, predict, feedback, train


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - connect/disconnect MongoDB."""
    connect_db()
    yield
    close_db()


app = FastAPI(
    title="Student Dropout Prediction API",
    description="ML-powered API to predict and manage student dropout risk.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(predict.router, tags=["Predict"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(train.router, tags=["Train"])


@app.get("/", tags=["Health"])
async def root():
    return {"message": "Student Dropout Prediction API is running ✅"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
