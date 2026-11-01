/** Theme-aware SVG diagrams for the contribution guide. */

function Box({ x, y, title, subtitle, accent }: { x: number; y: number; title: string; subtitle: string; accent?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="190"
        height="62"
        rx="10"
        fill={accent ? 'var(--brand-soft)' : 'var(--muted)'}
        stroke={accent ? 'var(--brand)' : 'var(--input)'}
      />
      <text x={x + 95} y={y + 27} textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--foreground)">
        {title}
      </text>
      <text x={x + 95} y={y + 47} textAnchor="middle" fontSize="12.5" fill="var(--muted-foreground)">
        {subtitle}
      </text>
    </g>
  )
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="guide-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 10 5 0 10z" fill="var(--muted-foreground)" />
      </marker>
    </defs>
  )
}

const LINE = { stroke: 'var(--muted-foreground)', strokeWidth: 1.5, markerEnd: 'url(#guide-arrow)', fill: 'none' }
const LABEL = { fontSize: 13, fill: 'var(--foreground)', fontWeight: 500 }

export function ForkFlowIllustration() {
  return (
    <svg
      viewBox="0 0 640 236"
      role="img"
      aria-label="Workflow: fork the original repository to your GitHub account, clone your fork to your computer, push changes back to your fork, then open a pull request to the original repository."
      className="w-full"
    >
      <ArrowDefs />
      <Box x={24} y={24} title="Original repository" subtitle="owner/project" />
      <Box x={426} y={24} title="Your fork" subtitle="you/project on GitHub" accent />
      <Box x={426} y={166} title="Your computer" subtitle="local clone" />
      <path d="M218 42H422" {...LINE} />
      <text x="320" y="33" textAnchor="middle" {...LABEL}>
        1 · Fork
      </text>
      <path d="M422 70H218" {...LINE} />
      <text x="320" y="90" textAnchor="middle" {...LABEL}>
        4 · Pull request
      </text>
      <path d="M488 90V162" {...LINE} />
      <text x="480" y="131" textAnchor="end" {...LABEL}>
        2 · Clone
      </text>
      <path d="M552 162V90" {...LINE} />
      <text x="560" y="131" {...LABEL}>
        3 · Push
      </text>
    </svg>
  )
}

export function BranchIllustration() {
  const commits = [70, 170, 270, 470, 570]
  return (
    <svg
      viewBox="0 0 640 132"
      role="img"
      aria-label="A feature branch splits off from main, collects two commits, and merges back through a pull request."
      className="w-full"
    >
      <path d="M40 90H610" stroke="var(--input)" strokeWidth="3" fill="none" />
      <path d="M170 90C210 90 210 32 250 32H400C440 32 430 90 470 90" stroke="var(--brand)" strokeWidth="3" fill="none" />
      {commits.map((x) => (
        <circle key={x} cx={x} cy="90" r="7" fill="var(--card)" stroke="var(--muted-foreground)" strokeWidth="2.5" />
      ))}
      {[290, 370].map((x) => (
        <circle key={x} cx={x} cy="32" r="7" fill="var(--card)" stroke="var(--brand)" strokeWidth="2.5" />
      ))}
      <text x="40" y="120" {...LABEL}>
        main
      </text>
      <text x="330" y="17" textAnchor="middle" {...LABEL}>
        fix/typo-in-readme
      </text>
      <text x="470" y="120" textAnchor="middle" {...LABEL}>
        merged
      </text>
    </svg>
  )
}
