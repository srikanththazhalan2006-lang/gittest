import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import SearchBar from '../components/SearchBar'
import PerformanceChart from '../components/PerformanceChart'
import DropoutReasons from '../components/DropoutReasons'
import DropoutBadge from '../components/DropoutBadge'
import FeedbackForm from '../components/FeedbackForm'

/* Animated SVG probability ring */
function ProbabilityRing({ probability }) {
  const pct   = probability != null ? probability * 100 : null
  const r     = 50
  const circ  = 2 * Math.PI * r
  const offset = pct != null ? circ - (pct / 100) * circ : circ

  const color = pct == null ? '#6b7280'
              : pct >= 70   ? '#ef4444'
              : pct >= 40   ? '#f59e0b'
              :               '#10b981'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1f2937" strokeWidth="12" />
        {/* Progress ring */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.4s' }}
        />
        <text x="60" y="56" textAnchor="middle" fill={color}
              fontSize="20" fontWeight="800" fontFamily="Inter, sans-serif">
          {pct != null ? `${pct.toFixed(0)}%` : '—'}
        </text>
        <text x="60" y="73" textAnchor="middle" fill="#6b7280"
              fontSize="9" fontFamily="Inter, sans-serif">
          DROPOUT RISK
        </text>
      </svg>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-200 font-medium text-sm">{value ?? '—'}</span>
    </div>
  )
}

export default function StudentDetail() {
  const { name }   = useParams()
  const navigate   = useNavigate()

  const [student,  setStudent]  = useState(null)
  const [feedback, setFeedback] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [predicting, setPredicting] = useState(false)
  const [predResult, setPredResult] = useState(null)

  const fetchStudent = async (searchName) => {
    setLoading(true)
    setError('')
    setStudent(null)
    setFeedback([])
    try {
      const res = await api.get(`/students/${encodeURIComponent(searchName)}`)
      setStudent(res.data)
      // Fetch feedback
      try {
        const fbRes = await api.get(`/feedback/${res.data.student_id}`)
        setFeedback(fbRes.data)
      } catch { /* no feedback yet */ }
    } catch (err) {
      setError(err.response?.data?.detail || `Student "${searchName}" not found.`)
    } finally {
      setLoading(false)
    }
  }

  // Load from URL param on mount
  useEffect(() => {
    if (name) fetchStudent(decodeURIComponent(name))
  }, [name])

  const handleSearch = (q) => {
    navigate(`/student/${encodeURIComponent(q)}`)
    fetchStudent(q)
  }

  const handlePredict = async () => {
    if (!student) return
    setPredicting(true)
    try {
      const res = await api.post(`/predict/${student.student_id}`)
      setPredResult(res.data)
      setStudent((prev) => ({ ...prev, predicted_probability: res.data.probability,
                               risk_level: res.data.risk_level,
                               risk_explanation: res.data.risk_explanation }))
    } catch (err) {
      alert(err.response?.data?.detail || 'Prediction failed.')
    } finally {
      setPredicting(false)
    }
  }

  const riskLevel = student?.risk_level
    ?? (student?.predicted_probability != null
        ? student.predicted_probability >= 0.7 ? 'High'
          : student.predicted_probability >= 0.4 ? 'Medium' : 'Low'
        : null)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* Back + Search */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')}
                className="btn-secondary flex items-center gap-2 shrink-0">
          ← Back
        </button>
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 bg-red-500/5 text-red-400 animate-fade-in">
          ❌ {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-5 animate-pulse">
          <div className="h-44 bg-gray-900 rounded-2xl" />
          <div className="h-72 bg-gray-900 rounded-2xl" />
        </div>
      )}

      {/* Student Content */}
      {student && !loading && (
        <div className="space-y-6 animate-slide-up">

          {/* Info card + Probability Ring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Info */}
            <div className="lg:col-span-2 card space-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600
                                flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {student.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-100">{student.name}</h1>
                  <p className="text-gray-500 text-sm">{student.student_id}</p>
                </div>
                <div className="ml-auto">
                  <DropoutBadge risk={riskLevel} />
                </div>
              </div>
              <InfoRow label="Semester"            value={`Semester ${student.semester}`} />
              <InfoRow label="Attendance Rate"     value={`${student.attendance_rate}%`} />
              <InfoRow label="Assignment Score"    value={student.assignment_score} />
              <InfoRow label="Exam Score"          value={student.exam_score} />
              <InfoRow label="Participation Score" value={student.participation_score} />
              <InfoRow label="Family Income"       value={student.family_income_level} />
              <InfoRow label="Previous Backlogs"   value={student.previous_backlogs} />
            </div>

            {/* Probability ring + predict button */}
            <div className="card flex flex-col items-center justify-center gap-5">
              <ProbabilityRing probability={student.predicted_probability} />
              <button
                id="predict-btn"
                onClick={handlePredict}
                disabled={predicting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {predicting ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Predicting…</>
                ) : '🔮 Run Prediction'}
              </button>
              {predResult && (
                <p className="text-xs text-gray-500 text-center">
                  Last predicted just now
                </p>
              )}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">📈 Academic Performance</h2>
            <PerformanceChart history={student.performance_history ?? [student]} />
          </div>

          {/* Dropout Reasons */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">🚨 Dropout Risk Analysis</h2>
            <DropoutReasons
              reason={student.dropout_reason}
              explanation={student.risk_explanation}
            />
          </div>

          {/* Feedback History */}
          {feedback.length > 0 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-200">💬 Previous Feedback</h2>
              <div className="space-y-3">
                {feedback.map((fb, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-semibold text-sm">{fb.teacher_name}</span>
                      <span className="text-gray-600 text-xs">{fb.date}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{fb.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Form */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">📝 Submit Feedback</h2>
            <FeedbackForm studentId={student.student_id} />
          </div>

        </div>
      )}
    </div>
  )
}
