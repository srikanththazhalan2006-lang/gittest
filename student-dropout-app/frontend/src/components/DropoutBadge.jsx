/**
 * DropoutBadge — color-coded risk level pill.
 * Props: risk {string} — "High" | "Medium" | "Low" | undefined
 */
export default function DropoutBadge({ risk }) {
  if (!risk) return <span className="badge-low">Unknown</span>

  const map = {
    High:   { cls: 'badge-high',   dot: 'bg-red-400',    label: '🔴 High' },
    Medium: { cls: 'badge-medium', dot: 'bg-yellow-400', label: '🟡 Medium' },
    Low:    { cls: 'badge-low',    dot: 'bg-green-400',  label: '🟢 Low' },
  }

  const cfg = map[risk] ?? { cls: 'badge-low', dot: 'bg-gray-400', label: risk }

  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5 inline-block`} />
      {cfg.label}
    </span>
  )
}
