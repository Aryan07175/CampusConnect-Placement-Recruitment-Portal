// Brand guideline: "Always include a short helpful message rather than a blank screen"
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-primary text-2xl">{icon}</span>
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-dark mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
