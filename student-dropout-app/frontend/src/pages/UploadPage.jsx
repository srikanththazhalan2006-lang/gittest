import { useNavigate } from 'react-router-dom'
import UploadForm from '../components/UploadForm'

export default function UploadPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    setTimeout(() => navigate('/dashboard'), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Upload Student Data</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Upload a CSV file to add students to the database
          </p>
        </div>
      </div>

      {/* Required columns reference */}
      <div className="card border-indigo-500/20 bg-indigo-500/5 space-y-3">
        <p className="text-sm font-semibold text-indigo-400">📋 Required CSV Columns</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            'student_id', 'name', 'attendance_rate', 'assignment_score',
            'exam_score', 'participation_score', 'family_income_level',
            'previous_backlogs', 'semester', 'dropout_reason', 'dropped_out',
          ].map((col) => (
            <code key={col}
                  className="text-xs bg-gray-900 text-gray-300 px-2 py-1 rounded-lg font-mono">
              {col}
            </code>
          ))}
        </div>
        <div className="pt-1 border-t border-indigo-500/20 text-xs text-gray-500 space-y-1">
          <p>• <code className="text-gray-400">family_income_level</code>: <code>low</code> | <code>medium</code> | <code>high</code></p>
          <p>• <code className="text-gray-400">dropped_out</code>: <code>0</code> (active) | <code>1</code> (dropped)</p>
          <p>• <code className="text-gray-400">dropout_reason</code>: can be empty for active students</p>
        </div>
      </div>

      {/* Upload form */}
      <div className="card">
        <UploadForm onSuccess={handleSuccess} />
      </div>

      {/* What happens next */}
      <div className="card border-gray-800 space-y-3">
        <p className="text-sm font-semibold text-gray-400">🔄 What happens after upload?</p>
        <ol className="space-y-2 text-sm text-gray-500 list-none">
          {[
            'Records are validated and inserted into MongoDB',
            'Duplicate student IDs are automatically skipped',
            'Go to Dashboard → click "Retrain Model" to train on new data',
            'Then click "Predict All" to generate dropout probabilities',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs
                               flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
