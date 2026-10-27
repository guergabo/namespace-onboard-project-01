import type { DiagramData } from "@/db/schema";
import { gazeVector, mirrorPoint, sideOf, sideText, solvePose, VIEW_ELEVATION, type FigureNote, type Joint, type Pose, type Side } from "@/lib/pose";

/**
 * Plain line diagrams, drawn from data so they can be mirrored for a left working leg.
 * Top views have the audience at the TOP: the dancer faces up, so their left is the screen's left.
 * Figures are drawn as the audience sees them.
 */
const INK = "#f3ead3";
const GLOW = "#fbf1d6";

function AudienceLabel({ y }: { y: number }) {
  return (
    <text x="0" y={y} fontSize="8" fill={INK} fillOpacity="0.55" textAnchor="middle" letterSpacing="2" fontFamily="var(--font-sans)">
      AUDIENCE
    </text>
  );
}

/** A turned-out foot; heel at (hx, y), toes pointing in `dir` (+1 right, -1 left). */
function Foot({ hx, y, dir, label, strong }: { hx: number; y: number; dir: 1 | -1; label: string; strong: boolean }) {
  const toeX = hx + dir * 60;
  const d = `M ${hx} ${y - 7} C ${hx + dir * 25} ${y - 10}, ${toeX - dir * 8} ${y - 13}, ${toeX} ${y - 5}
    C ${toeX + dir * 4} ${y}, ${toeX + dir * 2} ${y + 9}, ${toeX - dir * 6} ${y + 10}
    C ${hx + dir * 25} ${y + 11}, ${hx + dir * 5} ${y + 9}, ${hx} ${y + 6}
    C ${hx - dir * 5} ${y + 3}, ${hx - dir * 5} ${y - 4}, ${hx} ${y - 7} Z`;
  return (
    <g>
      <path d={d} fill={INK} fillOpacity={strong ? 0.18 : 0.04} stroke={INK} strokeWidth="1.2" />
      <text x={hx + dir * 30} y={y + 3.5} fontSize="10" fill={INK} textAnchor="middle" fontFamily="var(--font-sans)">
        {label}
      </text>
    </g>
  );
}

/** [left heel x, left y, right heel x, right y] for a right front foot ("front" = nearer the audience, up). */
const FEET: Record<1 | 2 | 3 | 4 | 5, [number, number, number, number]> = {
  1: [0, 0, 0, 0],
  2: [-30, 0, 30, 0],
  3: [0, 0, -30, -22],
  4: [0, 0, -60, -72],
  5: [0, 0, -60, -22],
};

export function FeetDiagram({ position, side }: { position: 1 | 2 | 3 | 4 | 5; side: Side }) {
  const [lx, ly, rx, ry] = FEET[position];
  // For a left front foot, mirror the picture left to right.
  const left = side === "R" ? { x: lx, y: ly } : { x: -rx, y: ry };
  const right = side === "R" ? { x: rx, y: ry } : { x: -lx, y: ly };
  const crossed = position >= 3;
  return (
    <svg viewBox="-100 -108 200 130" className="h-auto w-full" role="img" aria-label={`Position ${position} of the feet, seen from above`}>
      <AudienceLabel y={-98} />
      <Foot hx={left.x} y={left.y} dir={-1} label="L" strong={crossed && side === "L"} />
      <Foot hx={right.x} y={right.y} dir={1} label="R" strong={crossed && side === "R"} />
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

/** The studio from above: which way the body faces and where the working leg goes. */
export function StudioSquare({ facing, leg, side }: { facing: number; leg?: number; side: Side }) {
  const f = mirrorPoint(facing, side);
  const l = leg ? mirrorPoint(leg, side) : undefined;
  // Unit vector towards a point, rounded so server and browser SVG attributes match.
  const unit = (p: number) => {
    const [x, y] = POINTS[p];
    const m = Math.hypot(x, y);
    return [Math.round((x / m) * 1000) / 1000, Math.round((y / m) * 1000) / 1000] as const;
  };
  const [fx, fy] = unit(f);
  const legEnd = l ? unit(l) : null;
  const angle = (Math.atan2(fy, fx) * 180) / Math.PI + 90;
  const w = sideOf("W", side);
  const s = sideOf("S", side);
  return (
    <svg viewBox="-110 -125 220 245" className="h-auto w-full" role="img" aria-label={`Facing point ${f}${l ? `, ${w === "R" ? "right" : "left"} leg towards point ${l}` : ""}`}>
      <defs>
        <marker id={`face-arrow-${side}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
        </marker>
      </defs>
      <AudienceLabel y={-114} />
      <rect x="-80" y="-80" width="160" height="160" fill="none" stroke={INK} strokeOpacity="0.3" />
      {Object.entries(POINTS).map(([n, [x, y]]) => {
        const active = Number(n) === f || Number(n) === l;
        return (
          <g key={n}>
            <circle cx={x} cy={y} r={active ? 3.5 : 2} fill={INK} fillOpacity={active ? 1 : 0.45} />
            <text x={x * 1.17} y={y * 1.17 + 3.5} fontSize="10" fill={INK} fillOpacity={active ? 1 : 0.55} textAnchor="middle" fontFamily="var(--font-sans)">
              {n}
            </text>
          </g>
        );
      })}
      {/* Shoulders as a bar across the body, turned to the facing direction. */}
      <g transform={`rotate(${angle})`}>
        <line x1="-13" y1="0" x2="13" y2="0" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="-1" r="4.5" fill="none" stroke={INK} />
      </g>
      <line x1={fx * 8} y1={fy * 8} x2={fx * 42} y2={fy * 42} stroke={INK} strokeWidth="1.2" markerEnd={`url(#face-arrow-${side})`} />
      {legEnd && (
        <g>
          <line x1="0" y1="0" x2={legEnd[0] * 58} y2={legEnd[1] * 58} stroke={GLOW} strokeWidth="2" strokeLinecap="round" />
          <circle cx={legEnd[0] * 58} cy={legEnd[1] * 58} r="3" fill={GLOW} />
          <text x={legEnd[0] * 58 + (legEnd[0] >= 0 ? 6 : -6)} y={legEnd[1] * 58 + (legEnd[1] > 0 ? 12 : -6)} fontSize="9" fill={GLOW} textAnchor={legEnd[0] >= 0 ? "start" : "end"} fontFamily="var(--font-sans)">
            {w} leg
          </text>
        </g>
      )}
      <circle cx="0" cy="0" r="3" fill={INK} />
      <text x="0" y="114" fontSize="9" fill={INK} fillOpacity="0.8" textAnchor="middle" fontFamily="var(--font-sans)">
        {`Facing ${f} · standing on ${s}${l ? ` · ${w} leg to ${l}` : ""}`}
      </text>
    </svg>
  );
}

/** Turn direction from above: en dehors turns towards the working leg, en dedans towards the standing leg. */
export function TurnDiagram({ direction, side }: { direction: "en dehors" | "en dedans"; side: Side }) {
  // Facing the audience (up). With the right leg working, en dehors turns to the right: clockwise.
  const clockwise = (direction === "en dehors") === (side === "R");
  const w = sideOf("W", side);
  const s = sideOf("S", side);
  const wx = side === "R" ? 12 : -12;
  return (
    <svg viewBox="-80 -80 160 165" className="h-auto w-full" role="img" aria-label={`Turning ${direction}, ${clockwise ? "clockwise" : "anticlockwise"} seen from above`}>
      <defs>
        <marker id={`turn-arrow-${side}-${direction}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={GLOW} />
        </marker>
      </defs>
      <AudienceLabel y={-68} />
      <path
        d={clockwise ? "M -30 -36 A 46 46 0 1 1 -44 14" : "M 30 -36 A 46 46 0 1 0 44 14"}
        fill="none"
        stroke={GLOW}
        strokeWidth="1.6"
        markerEnd={`url(#turn-arrow-${side}-${direction})`}
      />
      <circle cx={-wx} cy="0" r="6" fill={INK} />
      <text x={-wx} y="-12" fontSize="8" fill={INK} textAnchor="middle" fontFamily="var(--font-sans)">
        standing {s}
      </text>
      <circle cx={wx} cy="0" r="5" fill="none" stroke={INK} strokeDasharray="2 2" />
      <text x={wx} y="17" fontSize="8" fill={INK} textAnchor="middle" fontFamily="var(--font-sans)">
        working {w}
      </text>
      <text x="0" y="78" fontSize="9" fill={INK} fillOpacity="0.8" textAnchor="middle" fontFamily="var(--font-sans)">
        {direction === "en dehors" ? "towards the working leg" : "towards the standing leg"}
      </text>
    </svg>
  );
}

const SEGMENTS: [Joint, Joint][] = [
  ["SHip", "SKnee"], ["SKnee", "SAnkle"], ["SAnkle", "SToe"],
  ["WHip", "WKnee"], ["WKnee", "WAnkle"], ["WAnkle", "WToe"],
  ["SShoulder", "SElbow"], ["SElbow", "SHand"],
  ["WShoulder", "WElbow"], ["WElbow", "WHand"],
  ["neck", "pelvis"],
];

/**
 * A fine-line dancer as the audience sees it. Notes become numbered glowing dots on the
 * joints they describe; the numbered text is listed by the caller (see FigureNotes).
 */
export function Figure({ pose, side, notes = [], size = "lg" }: { pose: Pose; side: Side; notes?: FigureNote[]; size?: "lg" | "sm" }) {
  const solved = solvePose(pose, side);
  const p = solved.screen;
  const lg = size === "lg";
  const segs = SEGMENTS.map(([a, b]) => ({ a: p[a], b: p[b], depth: (p[a].depth + p[b].depth) / 2 })).sort((x, y) => x.depth - y.depth);
  const minDepth = Math.min(...segs.map((s) => s.depth));
  const maxDepth = Math.max(...segs.map((s) => s.depth));
  const shade = (d: number) => (maxDepth - minDepth < 1 ? 1 : 0.5 + (0.5 * (d - minDepth)) / (maxDepth - minDepth));
  const g = gazeVector(pose, solved);
  const gaze = g && { x: Math.round(g.x * 1000) / 1000, y: Math.round(g.y * 1000) / 1000 };
  const torso = [p.WShoulder, p.SShoulder, p.SHip, p.WHip];
  const sw = lg ? 1.4 : 2.2;
  return (
    <svg viewBox="-115 -235 230 265" className="h-auto w-full" role="img" aria-label="Line drawing of the pose, seen from the audience">
      <ellipse cx="0" cy="0" rx="78" ry={78 * Math.sin(VIEW_ELEVATION)} fill={INK} fillOpacity="0.05" stroke={INK} strokeOpacity="0.25" />
      <polygon points={torso.map((j) => `${j.x},${j.y}`).join(" ")} fill={INK} fillOpacity="0.08" stroke={INK} strokeWidth={sw * 0.8} strokeLinejoin="round" />
      {segs.map((s, i) => (
        <line key={i} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={INK} strokeOpacity={shade(s.depth)} strokeWidth={sw} strokeLinecap="round" />
      ))}
      <line x1={p.neck.x} y1={p.neck.y} x2={p.head.x} y2={p.head.y + 8} stroke={INK} strokeWidth={sw} />
      <circle cx={p.head.x} cy={p.head.y} r="8.5" fill="#5a5733" fillOpacity="0.6" stroke={INK} strokeWidth={sw} />
      {gaze && (
        <line
          x1={p.head.x + gaze.x * 10}
          y1={p.head.y + gaze.y * 10}
          x2={p.head.x + gaze.x * (lg ? 34 : 18)}
          y2={p.head.y + gaze.y * (lg ? 34 : 18)}
          stroke={GLOW}
          strokeOpacity="0.8"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      )}
      {lg && (
        <>
          <SideTag at={p.WToe} label={sideOf("W", side)} />
          <SideTag at={p.SToe} label={sideOf("S", side)} />
        </>
      )}
      {notes.map((n, i) => (
        <g key={i}>
          <circle cx={p[n.at].x} cy={p[n.at].y} r="9" fill={GLOW} opacity="0.25" className="glow-pulse" />
          <circle cx={p[n.at].x} cy={p[n.at].y} r="4.5" fill={GLOW} />
          {/* Numbers sit outside the joint, away from the body's centre line, so neighbours don't collide. */}
          {n.text && (
            <text x={p[n.at].x + (p[n.at].x < p.pelvis.x ? -10 : 10)} y={p[n.at].y - 6} fontSize="9" fill={GLOW} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600">
              {i + 1}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function SideTag({ at, label }: { at: { x: number; y: number }; label: string }) {
  return (
    <text x={at.x} y={Math.min(at.y + 14, 18)} fontSize="9" fill={INK} fillOpacity="0.8" textAnchor="middle" fontFamily="var(--font-sans)">
      {label}
    </text>
  );
}

export function FigureNotes({ notes, side }: { notes: FigureNote[]; side: Side }) {
  return (
    <ol className="space-y-2 text-[15px] leading-snug text-cream/85">
      {notes.map((n, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-glow font-sans text-[11px] font-semibold text-sage-900 shadow-[0_0_10px_3px_rgb(251_241_214/0.45)]">
            {i + 1}
          </span>
          <span>{sideText(n.text, side)}</span>
        </li>
      ))}
    </ol>
  );
}

export function Diagram({ data, side }: { data: DiagramData; side: Side }) {
  if (data.kind === "feet") return <FeetDiagram position={data.position} side={side} />;
  if (data.kind === "room") return <StudioSquare facing={data.facing} leg={data.leg} side={side} />;
  if (data.kind === "turn") return <TurnDiagram direction={data.direction} side={side} />;
  return <Figure pose={data.pose} side={side} notes={data.notes} />;
}

export function diagramTitle(data: DiagramData) {
  if (data.kind === "feet") return "Feet, from above";
  if (data.kind === "room") return "In the studio, from above";
  if (data.kind === "turn") return "Turn direction, from above";
  return "As the audience sees it";
}
