export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sz} border-3 border-slate-200 border-t-primary rounded-full animate-spin`}
           style={{ borderWidth: 3 }} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  )
}
