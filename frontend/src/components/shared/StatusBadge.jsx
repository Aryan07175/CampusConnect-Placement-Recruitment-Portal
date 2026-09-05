// Status badge — maps ApplicationStatus enum values to brand colors
// Per BrandGuidelines.MD: Applied=Slate, UnderReview=Amber, Shortlisted=Indigo, Offered/Placed=Emerald, Rejected=Rose

const STATUS_MAP = {
  APPLIED:      { cls: 'badge-applied',      label: 'Applied' },
  UNDER_REVIEW: { cls: 'badge-under-review', label: 'Under Review' },
  SHORTLISTED:  { cls: 'badge-shortlisted',  label: 'Shortlisted' },
  OFFERED:      { cls: 'badge-offered',      label: 'Offered' },
  PLACED:       { cls: 'badge-placed',       label: 'Placed' },
  REJECTED:     { cls: 'badge-rejected',     label: 'Not Selected' },  // per copy guidelines: "not selected"
}

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? { cls: 'badge-applied', label: status }
  return <span className={config.cls}>{config.label}</span>
}
