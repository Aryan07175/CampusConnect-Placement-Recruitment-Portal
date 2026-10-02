// Match score badge — colored by score band, aligned with SkillMatchService.scoreLabel():
// 80–100% → Emerald (Excellent), 60–79% → Amber (Good), 40–59% → Sky (Partial), 1–39% → Slate (Low), 0 → Slate (No Match)

export default function MatchScoreBadge({ score }) {
  if (score == null) return null

  const { bg, text, label } =
    score >= 80 ? { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Excellent Match' } :
    score >= 60 ? { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Good Match' } :
    score >= 40 ? { bg: 'bg-sky-100',     text: 'text-sky-700',     label: 'Partial Match' } :
    score > 0   ? { bg: 'bg-slate-100',   text: 'text-slate-600',   label: 'Low Match' } :
                  { bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'No Match' }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <span className="font-mono">{score}%</span>
      <span className="hidden sm:inline">· {label}</span>
    </span>
  )
}
