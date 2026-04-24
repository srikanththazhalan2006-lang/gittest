import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import FeedbackForm from '../components/FeedbackForm'

export default function FeedbackPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [student,  setStudent]  = useState(null)
  const [feedback, setFeedback] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch student by ID via general students list + filter
      const res = await api.get('/students/')
      const found = res.data.find((s) => s.student_id === id)
      if (!found) throw new Error(`Student ID "${id}" not found.`)
      setStudent(found)

      // Fetch feedback
      const fbRes = await api.get(`/feedback/${id}`)
      setFeedback(fbRes.data)
    } catch (err) {
      setError(err.message || 'Failed to load student data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) fetchData() }, [id])

  const handleFeedbackSuccess = async () => {
    // Refresh feedback list
    try {
      const fbRes = await api.get(`/feedback/${id}`)
      setFeedback(fbRes.data)
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-12 bg-gray-900 rounded-2xl" />
        <div className="h-56 bg-gray-900 rounded-2xl" />
        <div className="h-40 bg-gray-900 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Student Feedback</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {student ? student.name : id}
          </p>
        </div>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 text-red-400">
          ❌ {error}
        </div>
      )}

      {student && (
        <>
          {/* Student summary */}
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
                            flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-100 truncate">{student.name}</p>
              <p className="text-sm text-gray-500">{student.student_id} · Semester {student.semester}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Dropout Prob.</p>
              <p className={`text-xl font-bold ${
                  student.predicted_probability >= 0.7 ? 'text-red-400'
                  : student.predicted_probability >= 0.4 ? 'text-yellow-400'
                  : 'text-green-400'
              }`}>
                {student.predicted_probability != null
                  ? `${(student.predicted_probability * 100).toFixed(1)}%`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Feedback history */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">
              💬 Feedback History
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({feedback.length} {feedback.length === 1 ? 'entry' : 'entries'})
              </span>
            </h2>
            {feedback.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p className="text-3xl mb-2">📭</p>
                <p>No feedback submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedback.map((fb, i) => (
                  <div key={i}
                       className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center
                                        text-indigo-400 text-xs font-bold">
                          {fb.teacher_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-indigo-400 font-semibold text-sm">{fb.teacher_name}</span>
                      </div>
                      <span className="text-gray-600 text-xs">{fb.date}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed pl-9">{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New feedback form */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">📝 Add New Feedback</h2>
            <FeedbackForm studentId={id} onSuccess={handleFeedbackSuccess} />
          </div>
        </>
      )}
    </div>
  )
}
