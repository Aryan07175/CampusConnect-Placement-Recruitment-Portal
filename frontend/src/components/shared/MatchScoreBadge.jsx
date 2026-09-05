// Match score badge — colored by score band per BrandGuidelines.MD:
// 80–100% → Emerald, 50–79% → Amber, below 50% → Slate (NOT red)

export default function MatchScoreBadge({ score }) {
  if (score == null) return null

  const { bg, text, label } =
    score >= 80 ? { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Excellent Match' } :
    score >= 50 ? { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Good Match' } :
    score > 0   ? { bg: 'bg-slate-100',   text: 'text-slate-600',   label: 'Low Match' } :
                  { bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'No Match' }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <span className="font-mono">{score}%</span>
      <span className="hidden sm:inline">· {label}</span>
    </span>
  )
}
