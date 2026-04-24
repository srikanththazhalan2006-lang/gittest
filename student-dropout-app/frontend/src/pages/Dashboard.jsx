import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import StudentTable from '../components/StudentTable'
import CorrelationChart from '../components/CorrelationChart'

function StatCard({ label, value, icon, sub, color }) {
  return (
    <div className={`stat-card glow-card animate-slide-up`}>
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className={`text-3xl font-bold tracking-tight ${color}`}>{value}</span>
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [students,    setStudents]    = useState([])
  const [stats,       setStats]       = useState(null)
  const [correlation, setCorrelation] = useState({})
  const [loadingData, setLoadingData] = useState(true)
  const [training,    setTraining]    = useState(false)
  const [predicting,  setPredicting]  = useState(false)
  const [toast,       setToast]       = useState(null)   // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchAll = async () => {
    setLoadingData(true)
    try {
      const [studRes, statsRes] = await Promise.all([
        api.get('/students/'),
        api.get('/students/stats'),
      ])
      setStudents(studRes.data)
      setStats(statsRes.data)
    } catch {
      showToast('error', 'Failed to load student data.')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleTrain = async () => {
    setTraining(true)
    try {
      const res = await api.post('/train')
      setCorrelation(res.data.correlation || {})
      showToast('success',
        `✅ Model trained! Accuracy: ${(res.data.accuracy * 100).toFixed(1)}%  F1: ${(res.data.f1_score * 100).toFixed(1)}%`)
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Training failed.')
    } finally {
      setTraining(false)
    }
  }

  const handlePredictAll = async () => {
    setPredicting(true)
    try {
      const res = await api.post('/predict-all')
      showToast('success', `✅ Predictions updated for ${res.data.updated} students.`)
      await fetchAll()
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Prediction failed.')
    } finally {
      setPredicting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl
                         border animate-slide-up text-sm font-medium
                         ${toast.type === 'success'
                           ? 'bg-green-500/10 border-green-500/30 text-green-400'
                           : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor and predict student dropout risk</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            id="upload-btn"
            onClick={() => navigate('/upload')}
            className="btn-secondary flex items-center gap-2"
          >
            📤 Upload CSV
          </button>
          <button
            id="train-btn"
            onClick={handleTrain}
            disabled={training}
            className="btn-primary flex items-center gap-2"
          >
            {training ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Training…</>
            ) : '🧠 Retrain Model'}
          </button>
          <button
            id="predict-all-btn"
            onClick={handlePredictAll}
            disabled={predicting}
            className="btn-secondary flex items-center gap-2"
          >
            {predicting ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Predicting…</>
            ) : '🔮 Predict All'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total Students"
          value={stats?.total ?? '—'}
          icon="👥"
          sub="Enrolled in database"
          color="text-indigo-400"
        />
        <StatCard
          label="High Risk Students"
          value={stats?.high_risk ?? '—'}
          icon="⚠️"
          sub="Probability ≥ 70%"
          color="text-red-400"
        />
        <StatCard
          label="Avg Dropout Probability"
          value={stats?.avg_probability != null ? `${stats.avg_probability}%` : '—'}
          icon="📉"
          sub="Across all students"
          color="text-yellow-400"
        />
      </div>

      {/* Student Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">All Students</h2>
        <StudentTable students={students} loading={loadingData} />
      </div>

      {/* Correlation Chart */}
      {Object.keys(correlation).length > 0 && (
        <div className="card glow-card animate-fade-in space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-200">Feature Correlation Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Pearson correlation of each feature against dropout outcome.
              <span className="text-indigo-400 ml-2">Indigo = protective factor</span>
              <span className="text-red-400 ml-2">Red = risk factor</span>
            </p>
          </div>
          <CorrelationChart correlation={correlation} />
        </div>
      )}
    </div>
  )
}
