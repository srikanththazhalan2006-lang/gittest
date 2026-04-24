import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-gray-400 mb-2 font-medium">Semester {label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function PerformanceChart({ history }) {
  if (!history?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No performance history available.
      </div>
    )
  }

  const data = history.map((h) => ({
    semester:    `${h.semester}`,
    Attendance:  parseFloat(h.attendance_rate) || 0,
    Assignment:  parseFloat(h.assignment_score) || 0,
    'Exam Score': parseFloat(h.exam_score) || 0,
  }))

  const isSingle = data.length === 1

  if (isSingle) {
    // Single record → Bar chart
    const barData = [
      { metric: 'Attendance',  value: data[0].Attendance },
      { metric: 'Assignment',  value: data[0].Assignment },
      { metric: 'Exam Score',  value: data[0]['Exam Score'] },
    ]
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}
               fill="url(#barGrad)" maxBarSize={60} />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="semester" tick={{ fill: '#9ca3af', fontSize: 12 }}
               axisLine={false} tickLine={false} label={{ value: 'Semester', fill: '#6b7280', position: 'insideBottom', offset: -5 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px', paddingTop: '12px' }} />
        <Line type="monotone" dataKey="Attendance"   stroke="#6366f1" strokeWidth={2.5}
              dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Assignment"   stroke="#f59e0b" strokeWidth={2.5}
              dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Exam Score"   stroke="#10b981" strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
