/**
 * A tiny 3D line-figure model for ballet poses.
 *
 * Poses are stored in terms of the WORKING (W) and SUPPORTING (S) sides, assuming the right
 * leg works. `solvePose(pose, "L")` mirrors everything for a left working leg: the W limbs
 * move to the dancer's left and the studio direction is mirrored (point 2 ↔ 8, 3 ↔ 7, 4 ↔ 6).
 *
 * Body frame: x = towards the W side, y = up, z = the dancer's front. Units are roughly cm.
 * The figure is projected as the AUDIENCE sees it, from a little above, so the floor is an ellipse.
 */

import type { DiagramData } from "@/db/schema";

export type Side = "R" | "L";
export type Limb = "W" | "S";

/** Where a leg is. Floor positions follow Vaganova's five positions with W as the front foot. */
export type LegShape =
  | "1st"
  | "2nd"
  | "3rd-front"
  | "3rd-back"
  | "4th-front"
  | "4th-back"
  | "5th-front"
  | "5th-back"
  | "tendu-front"
  | "tendu-side"
  | "tendu-back"
  | "retire"
  | "cdp-front"
  | "cdp-back"
  | "attitude-front"
  | "attitude-back"
  /** Rond de jambe en l'air: thigh held in 2nd, the foot drawn in towards the supporting calf. */
  | "rond-in"
  /** A straight leg raised in a direction: `front`, `side` or `back`, to `height` degrees (0 = down, 90 = horizontal). */
  | { raise: "front" | "side" | "back"; height: number };

export type ArmShape = "low" | "1st" | "2nd" | "3rd" | "forward" | "side" | "back" | "allonge-2nd";

export type Head = "front" | "W" | "S" | "audience" | "arm-W" | "arm-S" | "up-W" | "up-S";

export type Pose = {
  /** Vaganova studio point the body faces, for a RIGHT working leg. 1 = audience. */
  facing: number;
  legs: { W: LegShape; S: LegShape };
  arms: { W: ArmShape; S: ArmShape };
  head?: Head;
  plie?: "demi" | "grand";
  /** Rise onto demi-pointe on the floor feet. */
  releve?: boolean;
  /** Height of a jump, cm. */
  air?: number;
  /** Forward lean of the torso, degrees (negative leans back). */
  lean?: number;
  /** Rotation of the shoulders relative to the hips, degrees towards the W side's back. */
  twist?: number;
};

export type Joint =
  | "head"
  | "neck"
  | "pelvis"
  | `${Limb}${"Shoulder" | "Elbow" | "Hand" | "Hip" | "Knee" | "Ankle" | "Toe"}`;

/** A numbered glowing dot on a joint, explained in the list under the figure. Text may use side tokens (see sideText). */
export type FigureNote = { at: Joint; text: string };

type V = [number, number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V) => Math.hypot(...a);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));
const rad = (d: number) => (d * Math.PI) / 180;

const THIGH = 44;
const SHIN = 42;
const LEG = THIGH + SHIN;
const FOOT = 16;
const ANKLE_FLAT = 6;
const ANKLE_RELEVE = 13;
const HIP_W = 8;
const TORSO = 50;
const SHOULDER_W = 17;
const UPPER_ARM = 27;
const FOREARM = 25;
const HAND = 8;
const TURNOUT = rad(78);
/** How far above the stage the viewer looks from; the floor ellipse's height is sin() of this. */
export const VIEW_ELEVATION = rad(14);

/** Direction in the body frame for a limb on side sign `s` (+1 W, -1 S). az: 0 front, 90 own side, 180 back. el: 0 down, 90 horizontal, 180 up. */
function dir(s: number, az: number, el: number): V {
  return [s * Math.sin(rad(az)) * Math.sin(rad(el)), -Math.cos(rad(el)), Math.cos(rad(az)) * Math.sin(rad(el))];
}

/** Turned-out toe direction on the floor. */
const toeOut = (s: number): V => [s * Math.sin(TURNOUT), 0, Math.cos(TURNOUT)];

/** Two-bone IK: knee/elbow position bending towards `pole`. */
function ik(root: V, target: V, a: number, b: number, pole: V): { mid: V; end: V } {
  let d = sub(target, root);
  let dist = len(d);
  if (dist >= a + b - 0.01) {
    d = norm(d);
    return { mid: add(root, mul(d, a)), end: add(root, mul(d, a + b)) };
  }
  dist = Math.max(dist, Math.abs(a - b) + 0.01);
  const u = norm(d);
  const along = (a * a - b * b + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(a * a - along * along, 0));
  const v = norm(sub(pole, mul(u, dot(pole, u))));
  return { mid: add(add(root, mul(u, along)), mul(v, h)), end: target };
}

/** Heel positions on the floor (x, z) for the floor shapes; W is the front foot. */
function floorHeel(shape: LegShape, s: number): [number, number] | null {
  // A turned-out foot's toes point to its own side, so in 3rd/4th/5th each heel crosses
  // over towards the other side: the front heel sits at the toe (5th) or middle (3rd) of the back foot.
  switch (shape) {
    case "1st": return [s * 1.5, 0];
    case "2nd": return [s * 14, 0];
    case "3rd-front": return [-s * 4, 4];
    case "3rd-back": return [-s * 4, -4];
    case "5th-front": return [-s * 10, 4];
    case "5th-back": return [-s * 9, -4];
    case "4th-front": return [-s * 10, 26];
    case "4th-back": return [-s * 9, -4];
    default: return null;
  }
}

export type SolvedPose = {
  joints: Record<Joint, V>;
  /** Screen-space projection of every joint plus its depth (larger = nearer the audience). */
  screen: Record<Joint, { x: number; y: number; depth: number }>;
  side: Side;
};

const MIRROR: Record<number, number> = { 1: 1, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2 };
export const mirrorPoint = (p: number, side: Side) => (side === "R" ? p : MIRROR[p]);

/** Side letter for a limb when the working leg is `side`. */
export const sideOf = (limb: Limb, side: Side): Side => (limb === "W" ? side : side === "R" ? "L" : "R");

export function solvePose(pose: Pose, side: Side): SolvedPose {
  const sign = { W: 1, S: -1 } as const;
  const releveY = pose.releve ? ANKLE_RELEVE : ANKLE_FLAT;
  const plieDrop = pose.plie === "grand" ? 36 : pose.plie === "demi" ? 13 : 0;
  // Grand plié lifts the heels except in 2nd position.
  const grandHeels = pose.plie === "grand" && pose.legs.W !== "2nd";
  const footY = pose.air ? pose.air + ANKLE_FLAT + 4 : grandHeels ? 12 : releveY;

  const hip = (l: Limb): V => [sign[l] * HIP_W, 0, 0];
  const onFloor = (l: Limb) => floorHeel(pose.legs[l], sign[l]) !== null;
  const singleSupport = onFloor("W") !== onFloor("S");
  const floorAnkle = (l: Limb): V | null => {
    // On one leg the weight is over the supporting foot, so it sits under the body's centre.
    const h = singleSupport && onFloor(l) ? [-sign[l] * 2, 0] : floorHeel(pose.legs[l], sign[l]);
    if (!h) return null;
    // On demi-pointe or in the air, the ankle sits a little towards the toes.
    const shift = footY > ANKLE_FLAT ? 4 : 0;
    const t = toeOut(sign[l]);
    return [h[0] + t[0] * shift, footY, h[1] + t[2] * shift];
  };

  // Pelvis height: the straighter of the floor legs is straight, minus any plié; plus any jump.
  const floorLegs = (["W", "S"] as const).filter((l) => floorAnkle(l));
  let pelvisY = floorLegs.length ? Infinity : LEG + ANKLE_FLAT + (pose.air ?? 0);
  for (const l of floorLegs) {
    const a = floorAnkle(l)!;
    const horiz = Math.hypot(a[0] - hip(l)[0], a[2]);
    pelvisY = Math.min(pelvisY, a[1] + Math.sqrt(Math.max(LEG * LEG - horiz * horiz, 0)));
  }
  pelvisY -= plieDrop;
  const P: V = [0, pelvisY, 0];
  const at = (l: Limb): V => add(P, hip(l));

  const joints = {} as Record<Joint, V>;
  joints.pelvis = P;

  const placeLeg = (l: Limb, supportKnee: V, supportAnkle: V) => {
    const s = sign[l];
    const H = at(l);
    const shape = pose.legs[l];
    const out = toeOut(s);
    let knee: V, ankle: V, toe: V;
    const floor = floorAnkle(l);
    if (floor) {
      ({ mid: knee, end: ankle } = ik(H, floor, THIGH, SHIN, add(out, [0, 0, 0.4])));
      // Flat foot on the floor; on demi-pointe or in the air the foot points down and out.
      toe = footY > ANKLE_FLAT ? add(ankle, mul(norm(add(out, [0, -1.6, 0])), FOOT)) : add([ankle[0], 0, ankle[2]], mul(out, FOOT));
    } else if (typeof shape === "object" || shape.startsWith("tendu")) {
      const way = typeof shape === "object" ? shape.raise : shape.slice(6);
      const az = way === "front" ? 6 : way === "side" ? 90 : 174;
      // A tendu reaches exactly to the floor; otherwise use the given height.
      const el = typeof shape === "object" ? shape.height : (Math.acos(Math.min(H[1] / (LEG + FOOT), 1)) * 180) / Math.PI;
      const d = dir(s, az, el);
      knee = add(H, mul(d, THIGH));
      ankle = add(H, mul(d, LEG));
      toe = add(H, mul(d, LEG + FOOT));
      if (typeof shape !== "object") toe = [toe[0], 0, toe[2]];
    } else if (shape === "retire") {
      const target = add(supportKnee, [0, -3, 6]);
      ({ mid: knee, end: ankle } = ik(H, target, THIGH, SHIN, [s, 0.15, 0.2]));
      toe = add(ankle, mul(norm([-s * 0.6, -1, 0.2]), FOOT * 0.9)); // toes at the supporting knee
    } else if (shape === "rond-in") {
      // The thigh stays where it was in 2nd at 45°; only the lower leg folds in towards the supporting calf.
      knee = add(H, mul(dir(s, 90, 45), THIGH));
      const calf = add(supportKnee, [0, -14, 3]);
      ankle = add(knee, mul(norm(sub(calf, knee)), SHIN));
      toe = add(ankle, mul(norm(sub(ankle, knee)), FOOT * 0.9));
    } else if (shape.startsWith("cdp")) {
      const front = shape !== "cdp-back";
      const target = add(supportAnkle, [s * 3, 9, front ? 7 : -7]);
      ({ mid: knee, end: ankle } = ik(H, target, THIGH, SHIN, [s, 0.1, 0.3]));
      toe = add(ankle, mul(norm([-s * 0.5, -0.7, front ? 0.5 : -0.5]), FOOT * 0.9));
    } else {
      // Attitude: the knee higher than the foot, bent and turned out.
      const front = shape === "attitude-front";
      const target = add(H, mul(dir(s, front ? 25 : 165, 82), 62));
      ({ mid: knee, end: ankle } = ik(H, target, THIGH, SHIN, [s * 0.6, 1, 0]));
      toe = add(ankle, mul(norm(sub(ankle, knee)), FOOT));
    }
    joints[`${l}Hip`] = H;
    joints[`${l}Knee`] = knee;
    joints[`${l}Ankle`] = ankle;
    joints[`${l}Toe`] = toe;
  };
  // Place a floor leg first so retiré and cou-de-pied can find the supporting knee and ankle.
  // With both legs off the floor (pas de chat), measure from a straight supporting leg.
  const order: Limb[] = floorAnkle("W") && !floorAnkle("S") ? ["W", "S"] : ["S", "W"];
  const other = at(order[0]);
  placeLeg(order[0], add(other, [0, -THIGH, 0]), add(other, [0, -LEG, 0]));
  placeLeg(order[1], joints[`${order[0]}Knee`], joints[`${order[0]}Ankle`]);

  // Upper body: lean forward or back around the pelvis, shoulders may twist.
  const lean = rad(pose.lean ?? 0);
  const rotX = (v: V): V => [v[0], v[1] * Math.cos(lean) + v[2] * Math.sin(lean), -v[1] * Math.sin(lean) + v[2] * Math.cos(lean)];
  const neck = add(P, rotX([0, TORSO, 0]));
  joints.neck = neck;
  joints.head = add(P, rotX([0, TORSO + 13, 0]));
  const tw = rad(pose.twist ?? 0);
  const shoulderAxis: V = [Math.cos(tw), 0, -Math.sin(tw)];
  const ARMS: Record<ArmShape, [number, number, number, number]> = {
    // upper arm az/el, forearm az/el
    low: [20, 14, -45, 32],
    "1st": [28, 68, -62, 86],
    "2nd": [72, 80, 84, 78],
    "3rd": [18, 152, -55, 166],
    forward: [6, 96, 2, 98],
    side: [86, 94, 94, 96],
    back: [145, 88, 155, 90],
    "allonge-2nd": [80, 88, 88, 90],
  };
  const turn = (v: V): V => {
    const r = rotX(v);
    return [r[0] * Math.cos(tw) + r[2] * Math.sin(tw), r[1], -r[0] * Math.sin(tw) + r[2] * Math.cos(tw)];
  };
  for (const l of ["W", "S"] as const) {
    const s = sign[l];
    const [ua, ue, fa, fe] = ARMS[pose.arms[l]];
    const shoulder = add(neck, add(mul(shoulderAxis, s * SHOULDER_W), [0, -4, 0]));
    const elbow = add(shoulder, mul(turn(dir(s, ua, ue)), UPPER_ARM));
    const wrist = add(elbow, mul(turn(dir(s, fa, fe)), FOREARM));
    joints[`${l}Shoulder`] = shoulder;
    joints[`${l}Elbow`] = elbow;
    joints[`${l}Hand`] = add(wrist, mul(norm(sub(wrist, elbow)), HAND));
  }

  // Studio direction (mirrored for a left working leg) and side mirroring of the x axis.
  const facing = mirrorPoint(pose.facing, side);
  const theta = rad((facing - 1) * 45);
  const xSign = side === "R" ? 1 : -1; // body +x is the W side: dancer's right for "R"
  const screen = {} as SolvedPose["screen"];
  for (const [k, v] of Object.entries(joints) as [Joint, V][]) {
    const bx = v[0] * xSign; // dancer's right
    const wx = -bx * Math.cos(theta) - v[2] * Math.sin(theta);
    const wz = -bx * Math.sin(theta) + v[2] * Math.cos(theta);
    // Rounded so server and browser render identical SVG attributes (their trig can differ in the last digit).
    const y = -v[1] * Math.cos(VIEW_ELEVATION) + wz * Math.sin(VIEW_ELEVATION);
    screen[k] = { x: round(wx), y: round(y), depth: round(wz) };
  }
  return { joints, screen, side };
}

/** Where the head looks, in screen space, as a unit vector. */
export function gazeVector(pose: Pose, solved: SolvedPose): { x: number; y: number } | null {
  const h = pose.head ?? "front";
  const s = solved.screen;
  if (h === "arm-W" || h === "arm-S") {
    const hand = s[`${h.slice(4) as Limb}Hand`];
    const d = { x: hand.x - s.head.x, y: hand.y - s.head.y };
    const m = Math.hypot(d.x, d.y) || 1;
    return { x: d.x / m, y: d.y / m };
  }
  if (h === "audience") return { x: 0, y: 0.15 };
  if (h === "front") return null;
  // Towards a shoulder (optionally lifted).
  const limb = h.endsWith("W") ? "W" : "S";
  const sh = s[`${limb}Shoulder`];
  const d = { x: sh.x - s.neck.x, y: h.startsWith("up") ? -0.6 : 0 };
  const m = Math.hypot(d.x, d.y) || 1;
  return { x: d.x / m, y: d.y / m };
}

/** Replace side tokens in text: {W}/{S} → "Right"/"Left", {w}/{s} → "right"/"left", {p8} → mirrored point. */
export function sideText(text: string, side: Side): string {
  const name = (l: Limb) => (sideOf(l, side) === "R" ? "right" : "left");
  return text
    .replace(/\{W\}/g, cap(name("W")))
    .replace(/\{S\}/g, cap(name("S")))
    .replace(/\{w\}/g, name("W"))
    .replace(/\{s\}/g, name("S"))
    .replace(/\{p([1-8])\}/g, (_, p) => String(mirrorPoint(Number(p), side)));
}
const round = (n: number) => Math.round(n * 100) / 100;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const SIDE_TOKEN = /\{([WSws]|p[1-8])\}/;
const symmetric = (p: Pose) =>
  p.legs.W === p.legs.S && p.arms.W === p.arms.S && (p.facing === 1 || p.facing === 5) && !p.twist && (p.head ?? "front") === "front";

/**
 * Whether a step changes with the working leg, from its texts (captions, how-to), phase poses and
 * diagrams. Symmetric steps like 1st position or demi-plié don't, so they have no left/right.
 */
export function dependsOnSide(texts: string[], poses: Pose[], diagrams: DiagramData[]) {
  const notes = diagrams.flatMap((d) => (d.kind === "figure" ? (d.notes ?? []).map((n) => n.text) : []));
  return (
    [...texts, ...notes].some((t) => SIDE_TOKEN.test(t)) ||
    poses.some((p) => !symmetric(p)) ||
    diagrams.some((d) => d.kind === "room" || d.kind === "turn" || (d.kind === "feet" ? d.position >= 3 : !symmetric(d.pose)))
  );
}
