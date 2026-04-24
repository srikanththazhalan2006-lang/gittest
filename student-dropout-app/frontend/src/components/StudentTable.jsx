import { useNavigate } from 'react-router-dom'
import DropoutBadge from './DropoutBadge'

function riskLevel(prob) {
  if (prob == null) return 'Unknown'
  if (prob >= 0.70) return 'High'
  if (prob >= 0.40) return 'Medium'
  return 'Low'
}

function probColor(prob) {
  if (prob == null) return 'text-gray-400'
  if (prob >= 0.70) return 'text-red-400'
  if (prob >= 0.40) return 'text-yellow-400'
  return 'text-green-400'
}

export default function StudentTable({ students, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!students?.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-5xl">📭</span>
        <p className="text-gray-400 text-lg">No students found. Upload a CSV to get started.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">#</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Student</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Semester</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Attendance %</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Exam Score</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Dropout Prob.</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const prob = student.predicted_probability
              const risk = riskLevel(prob)
              return (
                <tr
                  key={student.student_id || idx}
                  onClick={() => navigate(`/student/${encodeURIComponent(student.name)}`)}
                  className="border-b border-gray-800/60 hover:bg-indigo-500/5 cursor-pointer
                             transition-colors duration-150 group"
                >
                  <td className="px-6 py-4 text-gray-600 font-mono">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                                      flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">{student.student_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">Sem {student.semester}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${student.attendance_rate}%` }}
                        />
                      </div>
                      <span className="text-gray-300">{student.attendance_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{student.exam_score}</td>
                  <td className={`px-6 py-4 font-bold text-base ${probColor(prob)}`}>
                    {prob != null ? `${(prob * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <DropoutBadge risk={risk} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
