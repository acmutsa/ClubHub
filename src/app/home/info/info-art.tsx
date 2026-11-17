import type { AudienceId } from "./info-data"

// Original inline illustrations (swap for <Image> photos any time).
// Fixed black / white / blue so light and dark themes don't change them.
const svg = {
  viewBox: "0 0 200 200",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-full",
  role: "img" as const,
}

function StudentsArt() {
  return (
    <svg {...svg} aria-label="An event pass showing a student's photo and a scannable code">
      <rect x="30" y="20" width="140" height="160" rx="18" fill="#fff" stroke="#000" strokeWidth="5" />
      <rect x="30" y="20" width="140" height="44" rx="18" fill="#000" />
      <rect x="30" y="44" width="140" height="20" fill="#000" />
      <circle cx="100" cy="42" r="6" fill="#fff" />
      <circle cx="100" cy="98" r="19" fill="#1a9ad7" stroke="#000" strokeWidth="5" />
      <path d="M66 148c4-20 17-30 34-30s30 10 34 30z" fill="#1a9ad7" stroke="#000" strokeWidth="5" />
      <path d="M48 158v14M56 158v14M64 158v14M76 158v14M84 158v14M96 158v14M106 158v14" stroke="#000" strokeWidth="4" />
      <circle cx="158" cy="152" r="20" fill="#1a9ad7" stroke="#000" strokeWidth="5" />
      <path d="M149 152l7 7 13-14" stroke="#fff" strokeWidth="5" />
    </svg>
  )
}

function OrganizationsArt() {
  const rows = [
    { y: 82, avatar: "#1a9ad7", pill: "#000" },
    { y: 112, avatar: "#fff", pill: "#1a9ad7" },
    { y: 142, avatar: "#000", pill: "#fff" },
  ]
  return (
    <svg {...svg} aria-label="A club roster listing members with their roles">
      <rect x="20" y="30" width="160" height="140" rx="16" fill="#fff" stroke="#000" strokeWidth="5" />
      <rect x="22" y="32" width="156" height="28" rx="14" fill="#000" />
      <circle cx="40" cy="46" r="4" fill="#fff" />
      <circle cx="54" cy="46" r="4" fill="#fff" />
      <circle cx="68" cy="46" r="4" fill="#fff" />
      {rows.map((r) => (
        <g key={r.y}>
          <circle cx="46" cy={r.y} r="11" fill={r.avatar} stroke="#000" strokeWidth="4" />
          <path d={`M66 ${r.y}h44`} stroke="#000" strokeWidth="5" />
          <rect x="122" y={r.y - 8} width="44" height="16" rx="8" fill={r.pill} stroke="#000" strokeWidth="3" />
        </g>
      ))}
    </svg>
  )
}

export function InfoArt({ kind }: { kind: AudienceId }) {
  return kind === "students" ? <StudentsArt /> : <OrganizationsArt />
}
