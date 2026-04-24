# 🎓 EduGuard — Student Dropout Prediction Web App

An AI-powered, full-stack web application that helps teachers predict student dropout risk using Logistic Regression, visualise performance trends, and submit actionable feedback.

---

## 📋 Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| MongoDB | 6.0+ (local) or MongoDB Atlas |
| pip | latest |
| npm | 9+ |

---

## 🚀 Quick Start

### 1. Clone / Open the Project

```bash
cd student-dropout-app
```

---

### 2. Backend Setup

```bash
cd backend

# Copy environment config
copy .env.example .env     # Windows
cp .env.example .env       # Mac/Linux

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

> **Note:** Make sure MongoDB is running locally on `mongodb://localhost:27017`  
> or update `MONGO_URI` in your `.env` file with your Atlas connection string.

---

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## 📤 How to Upload CSV & Train the Model

### Step 1 — Upload CSV
1. Go to the **Dashboard** → click **"Upload CSV"**
2. Drag and drop `sample_data/students.csv` (or your own CSV)
3. Preview the first 5 rows, then click **"Upload to Database"**

### Step 2 — Train the Model
1. Back on the **Dashboard**, click **"🧠 Retrain Model"**
2. Wait for the success toast — it shows Accuracy, F1 Score
3. The Feature Correlation Chart will appear below

### Step 3 — Generate Predictions
1. Click **"🔮 Predict All"** to generate dropout probabilities for all students
2. The student table refreshes with probabilities and risk badges

### Step 4 — View a Student
1. Click any row in the table to view the Student Detail page
2. Run a fresh individual prediction, view the performance chart, and submit feedback

---

## 📁 CSV Format

Your CSV must contain these columns:

| Column | Type | Notes |
|--------|------|-------|
| `student_id` | string | Unique identifier |
| `name` | string | Full name |
| `attendance_rate` | float | 0–100 |
| `assignment_score` | float | 0–100 |
| `exam_score` | float | 0–100 |
| `participation_score` | float | 0–100 |
| `family_income_level` | string | `low` / `medium` / `high` |
| `previous_backlogs` | int | ≥ 0 |
| `semester` | int | 1–12 |
| `dropout_reason` | string | Can be empty for active students |
| `dropped_out` | int | `0` = active, `1` = dropped |

---

## 🌐 API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/students/` | List all students (sorted by dropout probability) |
| `GET` | `/students/stats` | Dashboard summary stats |
| `GET` | `/students/{name}` | Search student by name (case-insensitive) |
| `POST` | `/upload-csv` | Upload CSV file (multipart/form-data) |
| `POST` | `/train` | Retrain Logistic Regression model |
| `POST` | `/predict/{student_id}` | Predict dropout for one student |
| `POST` | `/predict-all` | Predict dropout for all students |
| `POST` | `/feedback/` | Submit teacher feedback |
| `GET` | `/feedback/{student_id}` | Get all feedback for a student |

---

## 🧠 ML Model Details

- **Algorithm:** Logistic Regression (`sklearn`, `max_iter=1000`, `class_weight=balanced`)
- **Features:** attendance_rate, assignment_score, exam_score, participation_score, family_income_level (ordinal encoded), previous_backlogs
- **Target:** `dropped_out` (0 or 1)
- **Split:** 80% train / 20% test
- **Scaling:** StandardScaler (saved as `scaler.pkl`)
- **Correlation:** Pearson correlation of all features vs. dropout target
- **Model file:** `backend/ml/model.pkl` (auto-generated on first `/train` call)

---

## 🗂️ Project Structure

```
student-dropout-app/
├── backend/
│   ├── main.py              # FastAPI app + CORS
│   ├── database.py          # PyMongo connection
│   ├── models/
│   │   └── student_model.py # Pydantic models
│   ├── routes/
│   │   ├── students.py      # GET /students, /students/{name}
│   │   ├── upload.py        # POST /upload-csv
│   │   ├── predict.py       # POST /predict/{id}, /predict-all
│   │   ├── feedback.py      # POST/GET /feedback
│   │   └── train.py         # POST /train
│   ├── ml/
│   │   ├── train_model.py   # Training pipeline
│   │   ├── predict.py       # Inference
│   │   └── correlation.py   # Pearson correlation
│   ├── utils/
│   │   └── csv_parser.py    # CSV validation + parsing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Router
│   │   ├── pages/           # Dashboard, StudentDetail, UploadPage, FeedbackPage
│   │   └── components/      # Reusable UI components
│   └── package.json
├── sample_data/
│   └── students.csv         # 30 realistic sample rows
└── README.md
```

---

## 🎨 Risk Level Guide

| Risk Level | Probability | Badge Color |
|------------|-------------|-------------|
| 🟢 Low     | < 40%       | Green |
| 🟡 Medium  | 40% – 70%   | Yellow |
| 🔴 High    | ≥ 70%       | Red |

---

## 🛠️ Troubleshooting

**MongoDB connection error:**  
→ Make sure `mongod` is running: `mongod --dbpath C:\data\db` (Windows)

**"Model not trained yet" error:**  
→ Upload CSV first, then call `POST /train` via Dashboard

**CORS errors in browser:**  
→ Ensure backend is running on port `8000` and frontend on `5173`

**Missing columns error on upload:**  
→ Check your CSV has all 11 required columns with exact names (lowercase, underscores)
