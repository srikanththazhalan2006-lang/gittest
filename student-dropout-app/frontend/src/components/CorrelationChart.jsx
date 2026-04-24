import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

const FEATURE_LABELS = {
  attendance_rate:     'Attendance Rate',
  assignment_score:    'Assignment Score',
  exam_score:          'Exam Score',
  participation_score: 'Participation Score',
  family_income_level: 'Family Income Level',
  previous_backlogs:   'Previous Backlogs',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-gray-400 mb-1">{payload[0].payload.feature}</p>
      <p className={`font-bold text-base ${val < 0 ? 'text-red-400' : 'text-green-400'}`}>
        r = {val.toFixed(3)}
      </p>
      <p className="text-gray-500 text-xs mt-1">
        {val < 0 ? 'Negative: higher → less dropout risk' : 'Positive: higher → more dropout risk'}
      </p>
    </div>
  )
}

/**
 * CorrelationChart — horizontal bar chart showing Pearson correlation
 * of each feature against the dropout target.
 * Props: correlation {object} — { feature: value }
 */
export default function CorrelationChart({ correlation }) {
  if (!correlation || !Object.keys(correlation).length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Train the model first to see correlation analysis.
      </div>
    )
  }

  const data = Object.entries(correlation).map(([key, val]) => ({
    feature: FEATURE_LABELS[key] || key,
    value:   val,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 52)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 40, left: 140, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
        <XAxis
          type="number"
          domain={[-1, 1]}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.toFixed(1)}
        />
        <YAxis
          type="category"
          dataKey="feature"
          tick={{ fill: '#d1d5db', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={135}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="#374151" strokeWidth={1.5} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.value < 0 ? '#6366f1' : '#ef4444'}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
