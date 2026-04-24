const REASON_ICONS = {
  'financial difficulty': '💸',
  'family issues':        '👨‍👩‍👧',
  'academic pressure':    '📚',
  'relocation':           '🏠',
  'health issues':        '🏥',
  'lost interest':        '😔',
}

export default function DropoutReasons({ reason, explanation }) {
  const icon = REASON_ICONS[reason?.toLowerCase()] ?? '⚠️'

  return (
    <div className="space-y-3">
      {reason ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <span className="text-2xl mt-0.5">{icon}</span>
          <div>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">
              Stated Dropout Reason
            </p>
            <p className="text-gray-100 font-semibold capitalize">{reason}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
          <span className="text-2xl">✅</span>
          <p className="text-gray-300">No dropout reason recorded — student is active.</p>
        </div>
      )}

      {explanation && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
          <span className="text-2xl mt-0.5">🤖</span>
          <div>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">
              ML Risk Analysis
            </p>
            <p className="text-gray-200 leading-relaxed">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
