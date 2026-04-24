import { useState } from 'react'
import api from '../api/axiosClient'

export default function FeedbackForm({ studentId }) {
  const [teacherName, setTeacherName] = useState('')
  const [message,     setMessage]     = useState('')
  const [status,      setStatus]      = useState(null)   // 'loading' | 'success' | 'error'
  const [errorMsg,    setErrorMsg]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!teacherName.trim() || !message.trim()) return

    setStatus('loading')
    try {
      await api.post('/feedback/', {
        student_id:   studentId,
        teacher_name: teacherName.trim(),
        message:      message.trim(),
      })
      setStatus('success')
      setMessage('')
      setTimeout(() => setStatus(null), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.detail || 'Failed to submit feedback.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Teacher Name
        </label>
        <input
          id="teacher-name"
          type="text"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="Enter your name"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Feedback Message
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your observations, concerns, or support notes here..."
          rows={4}
          className="input-field resize-none"
          required
        />
      </div>

      <button
        id="submit-feedback-btn"
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Submitting...
          </>
        ) : '📝 Submit Feedback'}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-fade-in">
          ✅ Feedback submitted successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
          ❌ {errorMsg}
        </div>
      )}
    </form>
  )
}
