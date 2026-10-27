import type { DiagramData } from "@/db/schema";

/**
 * All diagrams are seen from above with the audience at the TOP, as in Vaganova
 * studio diagrams: the dancer faces up, so their left is on the screen's left.
 */
const CREAM = "#f4ecd8";
const GLOW = "#fff6df";

function AudienceLabel({ y }: { y: number }) {
  return (
    <text x="0" y={y} fontSize="8" fill={CREAM} fillOpacity="0.5" textAnchor="middle" letterSpacing="2">
      AUDIENCE
    </text>
  );
}

/** A turned-out foot; heel at (hx, y), toes pointing in `dir` (+1 right, -1 left). */
function Foot({ hx, y, dir, label }: { hx: number; y: number; dir: 1 | -1; label: string }) {
  const toeX = hx + dir * 60;
  const d = `M ${hx} ${y - 7} C ${hx + dir * 25} ${y - 10}, ${toeX - dir * 8} ${y - 13}, ${toeX} ${y - 5}
    C ${toeX + dir * 4} ${y}, ${toeX + dir * 2} ${y + 9}, ${toeX - dir * 6} ${y + 10}
    C ${hx + dir * 25} ${y + 11}, ${hx + dir * 5} ${y + 9}, ${hx} ${y + 6}
    C ${hx - dir * 5} ${y + 3}, ${hx - dir * 5} ${y - 4}, ${hx} ${y - 7} Z`;
  return (
    <g>
      <path d={d} fill={CREAM} fillOpacity="0.12" stroke={CREAM} strokeWidth="1.3" />
      <text x={hx + dir * 30} y={y + 3.5} fontSize="9" fill={CREAM} fillOpacity="0.7" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

/** [left heel x, left y, right heel x, right y]; "right foot front" means closer to the audience (up). */
const FEET: Record<1 | 2 | 3 | 4 | 5, [number, number, number, number]> = {
  1: [0, 0, 0, 0],
  2: [-30, 0, 30, 0],
  3: [0, 0, -30, -22],
  4: [0, 0, -60, -72],
  5: [0, 0, -60, -22],
};

export function FeetDiagram({ position }: { position: 1 | 2 | 3 | 4 | 5 }) {
  const [lx, ly, rx, ry] = FEET[position];
  return (
    <svg viewBox="-100 -108 200 130" className="h-auto w-full" role="img" aria-label={`Position ${position} of the feet, seen from above`}>
      <AudienceLabel y={-98} />
      <Foot hx={lx} y={ly} dir={-1} label="L" />
      <Foot hx={rx} y={ry} dir={1} label="R" />
    </svg>
  );
}

/** Vaganova studio points: 1 front (audience), clockwise to 8, the front-left corner. */
const POINTS: Record<number, [number, number]> = {
  1: [0, -80],
  2: [80, -80],
  3: [80, 0],
  4: [80, 80],
  5: [0, 80],
  6: [-80, 80],
  7: [-80, 0],
  8: [-80, -80],
};

export function StudioSquare({ facing, leg, label }: { facing: number; leg?: number; label?: string }) {
  const toward = (p: number, r: number) => {
    const [x, y] = POINTS[p];
    const m = Math.hypot(x, y);
    return [(x / m) * r, (y / m) * r] as const;
  };
  const [ax, ay] = toward(facing, 46);
  const legEnd = leg ? toward(leg, 40) : null;
  return (
    <svg
      viewBox="-110 -125 220 230"
      className="h-auto w-full"
      role="img"
      aria-label={label ?? `Facing point ${facing}${leg ? `, working leg towards point ${leg}` : ""}`}
    >
      <defs>
        <marker id="room-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={GLOW} />
        </marker>
      </defs>
      <AudienceLabel y={-114} />
      <rect x="-80" y="-80" width="160" height="160" fill="none" stroke={CREAM} strokeOpacity="0.25" />
      {Object.entries(POINTS).map(([n, [x, y]]) => {
        const active = Number(n) === facing || Number(n) === leg;
        return (
          <g key={n}>
            <circle cx={x} cy={y} r={active ? 4 : 2.5} fill={active ? GLOW : CREAM} fillOpacity={active ? 1 : 0.45} />
            <text x={x * 1.16} y={y * 1.16 + 3.5} fontSize="10" fill={CREAM} fillOpacity={active ? 1 : 0.6} textAnchor="middle">
              {n}
            </text>
          </g>
        );
      })}
      <circle cx="0" cy="0" r="7" fill={CREAM} fillOpacity="0.15" stroke={CREAM} />
      <line x1="0" y1="0" x2={ax} y2={ay} stroke={GLOW} strokeWidth="1.6" markerEnd="url(#room-arrow)" />
      {legEnd && <line x1="0" y1="0" x2={legEnd[0]} y2={legEnd[1]} stroke={CREAM} strokeWidth="1.2" strokeDasharray="3 3" />}
    </svg>
  );
}

/** Turn direction from above, standing on the left leg with the right leg working. */
export function TurnDiagram({ direction }: { direction: "en dehors" | "en dedans" }) {
  // Facing the audience (up), turning towards the right is clockwise on screen.
  const clockwise = direction === "en dehors";
  return (
    <svg viewBox="-80 -80 160 165" className="h-auto w-full" role="img" aria-label={`Turning ${direction}`}>
      <defs>
        <marker id="turn-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={GLOW} />
        </marker>
      </defs>
      <AudienceLabel y={-68} />
      <path
        d={clockwise ? "M -30 -36 A 46 46 0 1 1 -44 14" : "M 30 -36 A 46 46 0 1 0 44 14"}
        fill="none"
        stroke={GLOW}
        strokeWidth="1.6"
        markerEnd="url(#turn-arrow)"
      />
      <circle cx="-9" cy="0" r="6" fill={CREAM} fillOpacity="0.9" />
      <text x="-11" y="-12" fontSize="8" fill={CREAM} textAnchor="middle">
        standing L
      </text>
      <circle cx="11" cy="0" r="5" fill="none" stroke={CREAM} strokeDasharray="2 2" />
      <text x="13" y="17" fontSize="8" fill={CREAM} fillOpacity="0.7" textAnchor="middle">
        working R
      </text>
      <text x="0" y="78" fontSize="9" fill={CREAM} fillOpacity="0.75" textAnchor="middle">
        {clockwise ? "towards the working leg" : "towards the standing leg"}
      </text>
    </svg>
  );
}

export function Diagram({ data }: { data: DiagramData }) {
  if (data.kind === "feet") return <FeetDiagram position={data.position} />;
  if (data.kind === "room") return <StudioSquare facing={data.facing} leg={data.leg} label={data.label} />;
  return <TurnDiagram direction={data.direction} />;
}

export function diagramTitle(data: DiagramData) {
  if (data.kind === "feet") return "Feet, from above";
  if (data.kind === "room") return "Studio direction";
  return "Turn direction";
}
