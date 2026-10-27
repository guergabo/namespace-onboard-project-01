import type { Joint, Pose } from "../lib/pose";
import type { DiagramData, Goal, HowTo, Level, RelationshipType } from "./schema";

/**
 * Seed content for the glossary (Vaganova terminology, no pointe work).
 * Every entry starts as a draft (needs_review = 1) until it has been checked.
 * Slugs are unique across steps AND variants, so relationships can name either.
 */

export type SeedCategory = { slug: string; name: string; parent?: string; description?: string };

/** Terms, phases (a caption, optionally with a line figure) and diagrams of a step or variant. */
export type SeedExtras = {
  terms?: string[];
  phases?: (string | { caption: string; pose: Pose })[];
  diagrams?: DiagramData[];
};

export type SeedVariant = SeedExtras & {
  slug: string;
  name: string;
  level?: Level;
  summary?: string;
  howTo?: HowTo;
};

export type SeedStep = SeedExtras & {
  slug: string;
  kind?: "pose" | "movement";
  name: string;
  pronunciation?: string;
  translation?: string;
  summary: string;
  category: string;
  level: Level;
  goals: Goal[];
  jumpSize?: "petit" | "medium" | "grand";
  howTo?: HowTo;
  variants?: SeedVariant[];
};

export type SeedTerm = {
  slug: string;
  name: string;
  pronunciation?: string;
  translation?: string;
  definition: string;
};

export type SeedRelationship = { from: string; to: string; type: RelationshipType; note?: string };

export const seedCategories: SeedCategory[] = [
  // Chapters of Vaganova's "Basic Principles of Classical Ballet". Subcategories are her own
  // section headings (chapter I) or her own groups of jumps (chapter VII).
  { slug: "basic-conceptions", name: "Basic conceptions", description: "Chapter I: the positions of the feet, plié, and the directions croisé and effacé." },
  { slug: "feet-positions", name: "Positions of the feet", parent: "basic-conceptions" },
  { slug: "plie", name: "Plié", parent: "basic-conceptions" },
  { slug: "croise-efface", name: "Croisé and effacé", parent: "basic-conceptions" },
  { slug: "battements", name: "Battements", description: "Chapter II: the extension of the leg and its return to the position it started from." },
  { slug: "rotary", name: "Rotary movements of the legs", description: "Chapter III: ronds de jambe." },
  { slug: "arms", name: "The arms", description: "Chapter IV: the preparatory position and the three positions of the arms." },
  { slug: "poses", name: "Poses of the body", description: "Chapter V: attitudes, arabesques and écarté." },
  { slug: "connecting", name: "Connecting and auxiliary movements", description: "Chapter VI: steps that link and prepare other steps." },
  { slug: "jumps", name: "Jumps", description: "Chapter VII, grouped as Vaganova groups them: close to the ground, or aerial by take-off and landing." },
  { slug: "jumps-ground", name: "Close to the ground", parent: "jumps" },
  { slug: "jumps-two-to-two", name: "Both feet to both feet", parent: "jumps" },
  { slug: "jumps-two-to-one", name: "Both feet to one foot", parent: "jumps" },
  { slug: "jumps-one-to-other", name: "One foot to the other", parent: "jumps" },
  { slug: "beats", name: "Beats", description: "Chapter VIII: jumps in which the legs beat in the air." },
  { slug: "turns", name: "Turns", description: "Chapter X: tours from 5th and 4th position, tours chaînés, turns on both feet." },
  { slug: "other-turns", name: "Other kinds of turns", description: "Chapter XI: fouettés, renversé and turns in adagio." },
];

export const seedTerms: SeedTerm[] = [
  { slug: "en-dehors", name: "en dehors", pronunciation: "ahn duh-OR", translation: "outward", definition: "Movement away from the supporting leg. In turns, turning towards the working leg's side; in rond de jambe, circling from front to back." },
  { slug: "en-dedans", name: "en dedans", pronunciation: "ahn duh-DAHN", translation: "inward", definition: "Movement towards the supporting leg. In turns, turning towards the supporting leg's side; in rond de jambe, circling from back to front." },
  { slug: "devant", name: "devant", pronunciation: "duh-VAHN", translation: "in front", definition: "The working leg moves to, or is placed, in front of the body." },
  { slug: "derriere", name: "derrière", pronunciation: "deh-RYEHR", translation: "behind", definition: "The working leg moves to, or is placed, behind the body." },
  { slug: "a-la-seconde", name: "à la seconde", pronunciation: "ah lah suh-GOHND", translation: "to the second", definition: "To the side, in the direction of second position." },
  { slug: "croise", name: "croisé", pronunciation: "krwah-ZAY", translation: "crossed", definition: "A body direction in which the legs appear crossed to the audience: facing a front corner with the downstage leg hidden behind the upstage one." },
  { slug: "efface", name: "effacé", pronunciation: "eh-fah-SAY", translation: "shaded", definition: "A body direction in which the legs appear open to the audience: facing a front corner with the working leg on the side further from the audience." },
  { slug: "ecarte", name: "écarté", pronunciation: "ay-kar-TAY", translation: "separated", definition: "A body direction facing a front corner with the working leg extended to the side, towards a corner." },
  { slug: "en-face", name: "en face", pronunciation: "ahn FAHS", translation: "facing", definition: "Facing the audience (point 1) squarely." },
  { slug: "dessus", name: "dessus", pronunciation: "duh-SUE", translation: "over", definition: "The working foot closes in front." },
  { slug: "dessous", name: "dessous", pronunciation: "duh-SOO", translation: "under", definition: "The working foot closes behind." },
  { slug: "en-avant", name: "en avant", pronunciation: "ahn nah-VAHN", translation: "forward", definition: "Travelling or directed forwards." },
  { slug: "en-arriere", name: "en arrière", pronunciation: "ahn nah-RYEHR", translation: "backward", definition: "Travelling or directed backwards." },
  { slug: "en-tournant", name: "en tournant", pronunciation: "ahn toor-NAHN", translation: "turning", definition: "Performed while turning." },
  { slug: "battu", name: "battu", pronunciation: "bah-TUE", translation: "beaten", definition: "With a beat of the legs in the air." },
  { slug: "demi-pointe", name: "demi-pointe", pronunciation: "duh-MEE PWANT", translation: "half point", definition: "Rising onto the balls of the feet with the heels lifted. All rises in tendu are on demi-pointe — no pointe work." },
  { slug: "cou-de-pied-term", name: "sur le cou-de-pied", pronunciation: "sur luh koo-duh-PYAY", translation: "on the neck of the foot", definition: "The working foot placed at the ankle of the supporting leg, in front, behind, or wrapped." },
];

// ── Line figures ────────────────────────────────────────────────────────
// Every figure is written for a RIGHT working leg; the page mirrors it for the left.
// W = working side, S = supporting side. Text may use {W}/{S}, {w}/{s} and {p1}–{p8},
// which the page turns into Right/Left and mirrored studio points.

type Leg = Pose["legs"]["W"];
type Arm = Pose["arms"]["W"];
const pose = (facing: number, W: Leg, S: Leg, armW: Arm, armS: Arm, more: Partial<Pose> = {}): Pose => ({
  facing,
  legs: { W, S },
  arms: { W: armW, S: armS },
  ...more,
});
const ph = (caption: string, p: Pose) => ({ caption, pose: p });

const FIFTH_2ND = pose(1, "5th-front", "5th-back", "2nd", "2nd");
const FIFTH_PLIE = { ...FIFTH_2ND, plie: "demi" } as Pose;
const FIFTH_BACK_PLIE = pose(1, "5th-back", "5th-front", "2nd", "2nd", { plie: "demi" });
const IN_AIR = (p: Pose, air = 30): Pose => ({ ...p, plie: undefined, air });
const side = (height: number): Leg => ({ raise: "side", height });
const front = (height: number): Leg => ({ raise: "front", height });
const back = (height: number): Leg => ({ raise: "back", height });

const feetFigure = (W: Leg, S: Leg, notes: { at: Joint; text: string }[]): DiagramData => ({
  kind: "figure",
  pose: pose(1, W, S, "low", "low"),
  notes,
});

export const seedSteps: SeedStep[] = [
  // ── I. Positions of the feet ────────────────────────────────────────────
  {
    slug: "first-position",
    name: "1st position",
    kind: "pose",
    summary: "The balls of both feet completely turned out, heels touching, the feet in one straight line.",
    category: "feet-positions",
    level: "beginner",
    goals: ["turnout", "full-class"],
    diagrams: [
      { kind: "feet", position: 1 },
      feetFigure("1st", "1st", [
        { at: "WAnkle", text: "Heels touch." },
        { at: "WToe", text: "Toes turned out so both feet make one straight line." },
        { at: "WHip", text: "Turn-out comes from the hips; the legs are pulled up." },
      ]),
    ],
  },
  {
    slug: "second-position",
    name: "2nd position",
    kind: "pose",
    summary: "The feet turned out on one line, with one foot's length between the heels.",
    category: "feet-positions",
    level: "beginner",
    goals: ["turnout", "full-class"],
    diagrams: [
      { kind: "feet", position: 2 },
      feetFigure("2nd", "2nd", [
        { at: "WAnkle", text: "One foot's length between the heels." },
        { at: "SToe", text: "Both feet on one line, fully turned out." },
        { at: "pelvis", text: "Weight evenly between both feet." },
      ]),
    ],
  },
  {
    slug: "third-position",
    name: "3rd position",
    kind: "pose",
    summary: "One foot in front of the other, its heel touching the middle of the back foot.",
    category: "feet-positions",
    level: "beginner",
    goals: ["turnout"],
    diagrams: [
      { kind: "feet", position: 3 },
      feetFigure("3rd-front", "3rd-back", [
        { at: "WAnkle", text: "{W} foot in front: its heel touches the middle of the {s} foot." },
        { at: "SToe", text: "Both feet turned out." },
      ]),
    ],
  },
  {
    slug: "fourth-position",
    name: "4th position",
    kind: "pose",
    summary: "The feet parallel and turned out, one in front of the other, one foot's length apart.",
    category: "feet-positions",
    level: "beginner",
    goals: ["turnout"],
    diagrams: [
      { kind: "feet", position: 4 },
      feetFigure("4th-front", "4th-back", [
        { at: "WAnkle", text: "{W} foot in front, one foot's length ahead of the {s} foot." },
        { at: "WToe", text: "Heel of each foot opposite the toes of the other." },
        { at: "pelvis", text: "Weight evenly between both feet." },
      ]),
    ],
  },
  {
    slug: "fifth-position",
    name: "5th position",
    kind: "pose",
    summary: "The feet turned out and pressed together, the heel of the front foot at the toe of the back foot.",
    category: "feet-positions",
    level: "beginner",
    goals: ["turnout", "full-class"],
    diagrams: [
      { kind: "feet", position: 5 },
      feetFigure("5th-front", "5th-back", [
        { at: "WAnkle", text: "{W} foot in front: its heel at the toe of the {s} foot, the {s} toes at its heel." },
        { at: "WKnee", text: "Legs pressed together, fully turned out." },
      ]),
    ],
  },

  // ── I. Plié ─────────────────────────────────────────────────────────────
  {
    slug: "demi-plie",
    name: "Demi-plié",
    pronunciation: "duh-MEE plee-AY",
    translation: "half bend",
    summary: "A half bend of the knees with the heels on the floor. Plié is learned first in 1st position, then in all five.",
    category: "plie",
    level: "beginner",
    goals: ["jumps", "turnout", "full-class"],
    howTo: {
      start: "Any of the five positions; learned first in 1st.",
      direction: "The knees bend over the toes as far as the heels can stay down, then straighten.",
      cues: "Knees open over the toes; spine long; weight even on both feet.",
      mistakes: "Lifting the heels; rolling forward onto the arches; pushing the buttocks out.",
    },
    phases: [
      ph("1st position", pose(1, "1st", "1st", "2nd", "2nd")),
      ph("Bend, knees over the toes, heels down", pose(1, "1st", "1st", "2nd", "2nd", { plie: "demi" })),
      ph("Straighten", pose(1, "1st", "1st", "2nd", "2nd")),
    ],
  },
  {
    slug: "grand-plie",
    name: "Grand plié",
    pronunciation: "grahn plee-AY",
    translation: "big bend",
    summary: "A full bend passing through demi-plié. The heels release at the bottom, except in 2nd position.",
    category: "plie",
    level: "beginner",
    goals: ["turnout", "full-class", "flexibility"],
    howTo: {
      direction: "Pass through demi-plié, release the heels (not in 2nd) to the deepest bend, lower the heels again on the way up.",
      cues: "Keep the back upright; rise as smoothly as you go down.",
      mistakes: "Sitting at the bottom; buttocks protruding in 2nd.",
    },
    phases: [
      ph("1st position", pose(1, "1st", "1st", "2nd", "2nd")),
      ph("Demi-plié", pose(1, "1st", "1st", "2nd", "2nd", { plie: "demi" })),
      ph("Heels release, full bend", pose(1, "1st", "1st", "2nd", "2nd", { plie: "grand" })),
      ph("Heels lower, back through demi-plié", pose(1, "1st", "1st", "2nd", "2nd", { plie: "demi" })),
    ],
  },

  // ── II. Battements ──────────────────────────────────────────────────────
  {
    slug: "battement-tendu",
    name: "Battement tendu",
    pronunciation: "bat-MAHN tahn-DUE",
    translation: "stretched beating",
    summary: "From 5th position the working foot slides out along the floor to a fully stretched point and returns, toes never leaving the floor.",
    category: "battements",
    level: "beginner",
    goals: ["feet", "turnout", "full-class"],
    howTo: {
      start: "5th position (beginners may use 1st).",
      standingLeg: "Straight and pulled up; the weight stays over it.",
      workingLeg: "Slides out along the floor to a full point, toes on the floor, then slides back.",
      finish: "Closes firmly into 5th.",
      cues: "Brush the floor; keep both legs turned out.",
      mistakes: "Shifting weight onto the working leg; sickling at the point.",
    },
    phases: [
      ph("5th position, {w} foot front", FIFTH_2ND),
      ph("{W} foot slides forward to a full point", pose(1, "tendu-front", "5th-back", "2nd", "2nd")),
      ph("Slides back to 5th", FIFTH_2ND),
    ],
    variants: [
      { slug: "tendu-devant", name: "Devant", terms: ["devant"], phases: [ph("5th position, {w} foot front", FIFTH_2ND), ph("Tendu devant", pose(1, "tendu-front", "5th-back", "2nd", "2nd")), ph("Close in 5th", FIFTH_2ND)] },
      { slug: "tendu-a-la-seconde", name: "À la seconde", terms: ["a-la-seconde"], phases: [ph("5th position", FIFTH_2ND), ph("Tendu à la seconde", pose(1, "tendu-side", "5th-back", "2nd", "2nd")), ph("Close in 5th", FIFTH_2ND)] },
      { slug: "tendu-derriere", name: "Derrière", terms: ["derriere"], phases: [ph("5th position, {w} foot back", pose(1, "5th-back", "5th-front", "2nd", "2nd")), ph("Tendu derrière", pose(1, "tendu-back", "5th-front", "2nd", "2nd")), ph("Close in 5th", pose(1, "5th-back", "5th-front", "2nd", "2nd"))] },
    ],
  },
  {
    slug: "battement-tendu-jete",
    name: "Battement tendu jeté",
    pronunciation: "bat-MAHN tahn-DUE zhuh-TAY",
    translation: "thrown stretched beating",
    summary: "A battement tendu that continues off the floor: the leg is thrown out to 45° and closes in 5th, the accent on the close.",
    category: "battements",
    level: "beginner",
    goals: ["feet", "petit-allegro"],
    howTo: {
      start: "5th position.",
      workingLeg: "Glides along the floor and is thrown out to 45° front, side or back, then returns through the floor to 5th.",
      cues: "The accent is on the close in 5th. The hip does not rise.",
      mistakes: "Throwing the leg higher than 45°; lifting the hip.",
    },
    phases: [
      ph("5th position", FIFTH_2ND),
      ph("Thrown to 45° à la seconde", pose(1, side(45), "5th-back", "2nd", "2nd")),
      ph("Close in 5th", FIFTH_2ND),
    ],
  },
  {
    slug: "grand-battement-jete",
    name: "Grand battement jeté",
    pronunciation: "grahn bat-MAHN zhuh-TAY",
    translation: "big thrown beating",
    summary: "Done like a battement tendu, but the leg continues and is thrown forcefully to 90°, then lowered with control.",
    category: "battements",
    level: "intermediate",
    goals: ["flexibility", "extensions"],
    howTo: {
      workingLeg: "Brushes through tendu and is thrown to 90°, then lowered through tendu to close.",
      standingLeg: "Straight and still; the hips stay level.",
      cues: "Throw up, control down. Only when the leg goes back does the body bend forward.",
      mistakes: "Bending the supporting knee; dropping the leg on the way down.",
    },
    phases: [
      ph("5th position", FIFTH_2ND),
      ph("Thrown to 90° in front", pose(1, front(90), "5th-back", "2nd", "2nd")),
      ph("Lowered through tendu, close in 5th", FIFTH_2ND),
    ],
  },
  {
    slug: "battement-frappe",
    name: "Battement frappé",
    pronunciation: "bat-MAHN frah-PAY",
    translation: "struck",
    summary: "From 2nd position with the toes pointed, the foot beats in sur le cou-de-pied in front and strikes back out to 2nd. The accent is in 2nd.",
    category: "battements",
    level: "beginner",
    goals: ["feet", "petit-allegro"],
    howTo: {
      start: "{W} foot pointed in 2nd position (à la seconde).",
      workingLeg: "Beats in to sur le cou-de-pied in front, then strikes out to 2nd, the pointed toe hitting the floor.",
      cues: "The accent is out, in 2nd. Only the lower leg moves.",
      mistakes: "Moving the thigh; a soft, unaccented extension.",
    },
    phases: [
      ph("{W} toe pointed in 2nd", pose(1, "tendu-side", "5th-back", "2nd", "2nd")),
      ph("Beat in, sur le cou-de-pied in front", pose(1, "cdp-front", "5th-back", "2nd", "2nd")),
      ph("Strike out to 2nd", pose(1, "tendu-side", "5th-back", "2nd", "2nd")),
    ],
    variants: [
      { slug: "frappe-single", name: "Single" },
      { slug: "frappe-double", name: "Double", level: "intermediate", howTo: { workingLeg: "The foot changes behind and in front at the ankle before striking out." } },
    ],
  },
  {
    slug: "petit-battement",
    name: "Petit battement sur le cou-de-pied",
    pronunciation: "puh-TEE bat-MAHN",
    translation: "small beating",
    summary: "The working foot changes quickly between front and back of the ankle, the thigh still.",
    category: "battements",
    level: "intermediate",
    goals: ["feet", "petit-allegro"],
    terms: ["cou-de-pied-term"],
    howTo: {
      workingLeg: "Only the lower leg moves, opening slightly to the side between each change.",
      mistakes: "Moving the thigh; losing the turnout of the working knee.",
    },
    phases: [
      ph("{W} foot sur le cou-de-pied in front", pose(1, "cdp-front", "5th-back", "2nd", "2nd")),
      ph("Behind", pose(1, "cdp-back", "5th-back", "2nd", "2nd")),
      ph("In front again", pose(1, "cdp-front", "5th-back", "2nd", "2nd")),
    ],
  },
  {
    slug: "battement-fondu",
    name: "Battement fondu",
    pronunciation: "bat-MAHN fawn-DUE",
    translation: "melting",
    summary: "Both legs bend together and stretch together: the supporting leg in demi-plié as the working foot comes to cou-de-pied, then both extend.",
    category: "battements",
    level: "intermediate",
    goals: ["extensions", "jumps"],
    howTo: {
      standingLeg: "Bends into demi-plié, then straightens as the working leg extends.",
      workingLeg: "Folds to sur le cou-de-pied, then extends to 45° at the same time as the supporting leg straightens.",
      cues: "Smooth and continuous.",
      mistakes: "The two legs not arriving together.",
    },
    phases: [
      ph("{W} foot sur le cou-de-pied, {s} leg in demi-plié", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Both legs stretch together", pose(1, side(45), "5th-back", "2nd", "2nd")),
    ],
  },
  {
    slug: "battement-developpe",
    name: "Battement développé",
    pronunciation: "bat-MAHN dayv-law-PAY",
    translation: "developed",
    summary: "The working foot draws up the supporting leg and the leg unfolds to 90° in front, to the side or behind.",
    category: "battements",
    level: "intermediate",
    goals: ["extensions", "balance"],
    howTo: {
      start: "5th position.",
      workingLeg: "Draws up the supporting leg to the knee, then unfolds slowly to 90°.",
      finish: "Lowers with control and closes in 5th.",
      cues: "Hold the thigh as the lower leg unfolds; grow taller on the supporting side.",
      mistakes: "Dropping the knee before unfolding; lifting the hip.",
    },
    phases: [
      ph("5th position", FIFTH_2ND),
      ph("{W} foot draws up the {s} leg to the knee", pose(1, "retire", "5th-back", "2nd", "2nd")),
      ph("Unfold to 90° à la seconde", pose(1, side(90), "5th-back", "2nd", "2nd")),
      ph("Lower and close in 5th", FIFTH_2ND),
    ],
  },
  {
    slug: "cou-de-pied",
    name: "Sur le cou-de-pied",
    kind: "pose",
    pronunciation: "sur luh koo-duh-PYAY",
    translation: "on the neck of the foot",
    summary: "One foot placed on the ankle of the other, in front or behind: the position frappé, fondu and petit battement work from.",
    category: "battements",
    level: "beginner",
    goals: ["feet"],
    terms: ["cou-de-pied-term"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(1, "cdp-front", "5th-back", "2nd", "2nd"),
        notes: [
          { at: "WAnkle", text: "The {w} sole, instep stretched and toes lowered, grasps the {s} ankle." },
          { at: "WKnee", text: "{W} knee open to the side, turned out." },
          { at: "SAnkle", text: "Standing on the {s} leg, straight and pulled up." },
        ],
      },
    ],
    variants: [
      { slug: "cou-de-pied-devant", name: "In front", terms: ["devant"], diagrams: [{ kind: "figure", pose: pose(1, "cdp-front", "5th-back", "2nd", "2nd"), notes: [{ at: "WAnkle", text: "The {w} sole, instep stretched and toes lowered, grasps the {s} ankle in front." }, { at: "WKnee", text: "{W} knee open to the side." }] }] },
      { slug: "cou-de-pied-derriere", name: "Behind", terms: ["derriere"], diagrams: [{ kind: "figure", pose: pose(1, "cdp-back", "5th-back", "2nd", "2nd"), notes: [{ at: "WAnkle", text: "Instep and toes as in front; the side of the {w} heel and ankle press against the {s} leg from behind." }, { at: "WKnee", text: "{W} knee open to the side." }] }] },
    ],
  },

  // ── III. Rotary movements of the legs ───────────────────────────────────
  {
    slug: "rond-de-jambe-par-terre",
    name: "Rond de jambe par terre",
    pronunciation: "rohn duh ZHAHMB par TEHR",
    translation: "circle of the leg on the ground",
    summary: "The pointed working foot draws a half circle on the floor, front to back (en dehors) or back to front (en dedans), passing through 1st position.",
    category: "rotary",
    level: "beginner",
    goals: ["turnout", "feet"],
    howTo: {
      start: "1st position, usually after a tendu devant or derrière.",
      workingLeg: "Draws a half circle through 2nd, then passes through 1st to begin the next circle.",
      cues: "Keep the turnout through the whole arc; the hips stay square.",
      mistakes: "Letting the hip lift as the leg passes behind; bending the working knee.",
    },
    phases: [
      ph("Tendu devant", pose(1, "tendu-front", "1st", "2nd", "2nd")),
      ph("Through 2nd", pose(1, "tendu-side", "1st", "2nd", "2nd")),
      ph("Tendu derrière", pose(1, "tendu-back", "1st", "2nd", "2nd")),
      ph("Through 1st", pose(1, "1st", "1st", "2nd", "2nd")),
    ],
    variants: [
      { slug: "rond-de-jambe-par-terre-en-dehors", name: "En dehors", howTo: { direction: "Front → side → back, then through 1st." }, terms: ["en-dehors"] },
      {
        slug: "rond-de-jambe-par-terre-en-dedans",
        name: "En dedans",
        howTo: { direction: "Back → side → front, then through 1st." },
        terms: ["en-dedans"],
        phases: [
          ph("Tendu derrière", pose(1, "tendu-back", "1st", "2nd", "2nd")),
          ph("Through 2nd", pose(1, "tendu-side", "1st", "2nd", "2nd")),
          ph("Tendu devant", pose(1, "tendu-front", "1st", "2nd", "2nd")),
          ph("Through 1st", pose(1, "1st", "1st", "2nd", "2nd")),
        ],
      },
    ],
  },
  {
    slug: "rond-de-jambe-en-lair",
    name: "Rond de jambe en l'air",
    pronunciation: "rohn duh ZHAHMB ahn LEHR",
    translation: "circle of the leg in the air",
    summary: "With the leg in 2nd in the air, the lower leg draws an oval while the thigh stays still.",
    category: "rotary",
    level: "intermediate",
    goals: ["feet", "extensions"],
    howTo: {
      start: "Leg à la seconde at 45° (later 90°).",
      workingLeg: "The thigh stays still; the lower leg traces an oval towards the supporting calf and back out.",
      mistakes: "Moving the thigh; dropping the height of the leg.",
    },
    phases: [
      ph("{W} leg in 2nd at 45°", pose(1, side(45), "5th-back", "2nd", "2nd")),
      ph("Lower leg draws in towards the {s} calf", pose(1, "rond-in", "5th-back", "2nd", "2nd")),
      ph("Extends back out to 2nd", pose(1, side(45), "5th-back", "2nd", "2nd")),
    ],
    variants: [
      { slug: "rond-de-jambe-en-lair-en-dehors", name: "En dehors", terms: ["en-dehors"] },
      { slug: "rond-de-jambe-en-lair-en-dedans", name: "En dedans", terms: ["en-dedans"] },
    ],
  },

  // ── IV. The arms ────────────────────────────────────────────────────────
  {
    slug: "preparatory-position",
    name: "Preparatory position",
    kind: "pose",
    summary: "Arms dropped, palms inward and close together but not touching, elbows slightly rounded so the arm does not touch the body.",
    category: "arms",
    level: "beginner",
    goals: ["full-class"],
    diagrams: [{ kind: "figure", pose: pose(1, "5th-front", "5th-back", "low", "low"), notes: [{ at: "WHand", text: "Hands low, close together but not touching." }, { at: "WElbow", text: "Elbows rounded, not touching the body." }, { at: "WShoulder", text: "Shoulders down." }] }],
  },
  {
    slug: "arms-first-position",
    name: "1st position of the arms",
    kind: "pose",
    summary: "Arms rounded in front of the body at the height of the diaphragm.",
    category: "arms",
    level: "beginner",
    goals: ["full-class"],
    diagrams: [{ kind: "figure", pose: pose(1, "5th-front", "5th-back", "1st", "1st"), notes: [{ at: "WHand", text: "Hands in front of the diaphragm, a little apart." }, { at: "WElbow", text: "Elbows rounded and supported." }, { at: "WShoulder", text: "Shoulders down." }] }],
  },
  {
    slug: "arms-second-position",
    name: "2nd position of the arms",
    kind: "pose",
    summary: "Arms opened at the sides, very slightly rounded at the elbow.",
    category: "arms",
    level: "beginner",
    goals: ["full-class"],
    diagrams: [{ kind: "figure", pose: pose(1, "5th-front", "5th-back", "2nd", "2nd"), notes: [{ at: "WHand", text: "Arms opened at the sides." }, { at: "SElbow", text: "Very slightly rounded at the elbow." }, { at: "WShoulder", text: "Shoulders neither drawn back nor raised." }] }],
  },
  {
    slug: "arms-third-position",
    name: "3rd position of the arms",
    kind: "pose",
    summary: "Arms rounded above and slightly in front of the head, visible without lifting the head.",
    category: "arms",
    level: "beginner",
    goals: ["full-class"],
    diagrams: [{ kind: "figure", pose: pose(1, "5th-front", "5th-back", "3rd", "3rd"), notes: [{ at: "WHand", text: "Hands above and slightly in front of the head." }, { at: "head", text: "You can see your hands without lifting your head." }, { at: "WShoulder", text: "Shoulders stay down." }] }],
  },

  // ── I. Croisé and effacé (écarté is in chapter V) ─────────────────────────
  {
    slug: "croise-devant",
    name: "Croisé devant",
    kind: "pose",
    pronunciation: "krwah-ZAY duh-VAHN",
    translation: "crossed, in front",
    summary: "The legs cross as the audience sees them: the body turned to the front corner on the standing-leg side, the working leg pointed forward towards that corner.",
    category: "croise-efface",
    level: "beginner",
    goals: ["full-class"],
    terms: ["croise", "devant"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(8, "tendu-front", "5th-back", "2nd", "3rd", { head: "W" }),
        notes: [
          { at: "WToe", text: "{W} leg open forward, toes pointed, crossing in front of the {s} leg." },
          { at: "SAnkle", text: "Standing on the {s} leg." },
          { at: "SHand", text: "{S} arm in 3rd position, the arm opposite the extended leg." },
          { at: "WHand", text: "{W} arm in 2nd position." },
          { at: "head", text: "Body faces point {p8}; head turned to the {w}." },
        ],
      },
      { kind: "room", facing: 8, leg: 8 },
    ],
  },
  {
    slug: "croise-derriere",
    name: "Croisé derrière",
    kind: "pose",
    pronunciation: "krwah-ZAY deh-RYEHR",
    translation: "crossed, behind",
    summary: "The legs cross as the audience sees them, with the working leg pointed behind. The raised arm is on the same side as the extended leg.",
    category: "croise-efface",
    level: "beginner",
    goals: ["full-class"],
    terms: ["croise", "derriere"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(2, "tendu-back", "5th-front", "3rd", "2nd", { head: "S" }),
        notes: [
          { at: "WToe", text: "{W} leg extended behind, toes pointed, towards point {p6}." },
          { at: "SAnkle", text: "Standing on the {s} leg." },
          { at: "WHand", text: "{W} arm in 3rd position, on the same side as the extended leg." },
          { at: "SHand", text: "{S} arm in 2nd position." },
          { at: "head", text: "Body faces point {p2}; head turned to the {s}." },
        ],
      },
      { kind: "room", facing: 2, leg: 6 },
    ],
  },
  {
    slug: "efface-devant",
    name: "Effacé devant",
    kind: "pose",
    pronunciation: "eh-fah-SAY duh-VAHN",
    translation: "shaded, in front",
    summary: "The legs are open to the audience: the body turned to the front corner on the working-leg side, the working leg pointed forward towards it, the body slightly back.",
    category: "croise-efface",
    level: "beginner",
    goals: ["full-class"],
    terms: ["efface", "devant"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(2, "tendu-front", "5th-back", "2nd", "3rd", { head: "S", lean: -8 }),
        notes: [
          { at: "WToe", text: "{W} leg open forward, toes pointed, towards point {p2}." },
          { at: "SAnkle", text: "Standing on the {s} leg." },
          { at: "SHand", text: "{S} arm in 3rd position." },
          { at: "WHand", text: "{W} arm in 2nd position." },
          { at: "head", text: "Body faces point {p2}, leaning slightly back; head turned to the {s}." },
        ],
      },
      { kind: "room", facing: 2, leg: 2 },
    ],
  },
  {
    slug: "efface-derriere",
    name: "Effacé derrière",
    kind: "pose",
    pronunciation: "eh-fah-SAY deh-RYEHR",
    translation: "shaded, behind",
    summary: "The legs are open to the audience with the working leg pointed behind; the body leans slightly forward, with a hint of flight.",
    category: "croise-efface",
    level: "beginner",
    goals: ["full-class"],
    terms: ["efface", "derriere"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(8, "tendu-back", "5th-front", "2nd", "3rd", { head: "S", lean: 8 }),
        notes: [
          { at: "WToe", text: "{W} leg extended behind, toes pointed, towards point {p4}." },
          { at: "SAnkle", text: "Standing on the {s} leg." },
          { at: "SHand", text: "{S} arm in 3rd position." },
          { at: "WHand", text: "{W} arm in 2nd position." },
          { at: "head", text: "Body faces point {p8}, leaning slightly forward; head turned to the {s}." },
        ],
      },
      { kind: "room", facing: 8, leg: 4 },
    ],
  },

  // ── V. Poses of the body ────────────────────────────────────────────────
  {
    slug: "ecarte-devant",
    name: "Écarté devant",
    kind: "pose",
    pronunciation: "ay-kar-TAY duh-VAHN",
    translation: "separated, in front",
    summary: "The body turned to a front corner with the working leg opened to the side, towards the other front corner.",
    category: "poses",
    level: "intermediate",
    goals: ["extensions"],
    terms: ["ecarte"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(8, side(90), "5th-back", "3rd", "2nd", { head: "W" }),
        notes: [
          { at: "WToe", text: "{W} leg open to the side, towards point {p2}." },
          { at: "SAnkle", text: "Standing on the {s} leg." },
          { at: "WHand", text: "{W} arm in 3rd position: the arm and leg on the same side are lifted." },
          { at: "SHand", text: "{S} arm in 2nd position." },
          { at: "head", text: "Body faces point {p8}, the whole pose in one plane; head turned towards the raised arm." },
        ],
      },
      { kind: "room", facing: 8, leg: 2 },
    ],
  },
  {
    slug: "ecarte-derriere",
    name: "Écarté derrière",
    kind: "pose",
    pronunciation: "ay-kar-TAY deh-RYEHR",
    translation: "separated, behind",
    summary: "The body turned to a front corner with the working leg opened to the side, towards a back corner.",
    category: "poses",
    level: "intermediate",
    goals: ["extensions"],
    terms: ["ecarte"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(2, side(90), "5th-front", "3rd", "2nd", { head: "S" }),
        notes: [
          { at: "WToe", text: "{W} leg open to the side, towards point {p4}." },
          { at: "SAnkle", text: "Standing on the {s} leg." },
          { at: "WHand", text: "{W} arm in 3rd position." },
          { at: "SHand", text: "{S} arm in 2nd position." },
          { at: "head", text: "Body faces point {p2} and bends sideways towards the standing leg; head turned to the {s}." },
        ],
      },
      { kind: "room", facing: 2, leg: 4 },
    ],
  },
  {
    slug: "attitude-croisee",
    name: "Attitude croisée",
    kind: "pose",
    pronunciation: "ah-tee-TUED krwah-ZAY",
    summary: "A pose on one leg, the other lifted to 90° behind and bent at the knee, in croisé. The arm on the side of the lifted leg is raised, the other in 2nd.",
    category: "poses",
    level: "intermediate",
    goals: ["extensions", "balance"],
    terms: ["croise", "derriere"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(2, "attitude-back", "5th-front", "3rd", "2nd", { head: "S", lean: -6 }),
        notes: [
          { at: "WKnee", text: "{W} leg lifted behind to 90°, bent forcefully at the knee, turned out." },
          { at: "SAnkle", text: "Standing on the {s} leg; body croisé, facing point {p2}." },
          { at: "WHand", text: "{W} arm in 3rd position: the arm and leg on the same side are lifted." },
          { at: "SHand", text: "{S} arm in 2nd position." },
          { at: "neck", text: "Shoulders even, the back arched, the body bent back; head turned decidedly towards the shoulder." },
        ],
      },
      { kind: "room", facing: 2, leg: 6 },
    ],
  },
  {
    slug: "attitude-effacee",
    name: "Attitude effacée",
    kind: "pose",
    pronunciation: "ah-tee-TUED eh-fah-SAY",
    summary: "A pose on one leg, the other lifted to 90° behind and only half-bent, in effacé. The arm on the side of the lifted leg is raised, the other in 2nd.",
    category: "poses",
    level: "intermediate",
    goals: ["extensions", "balance"],
    terms: ["efface", "derriere"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(8, "attitude-back", "5th-front", "3rd", "2nd", { lean: 6 }),
        notes: [
          { at: "WKnee", text: "{W} leg lifted behind to 90°, only half-bent at the knee." },
          { at: "SAnkle", text: "Standing on the {s} leg; body effacé, facing point {p8}." },
          { at: "WHand", text: "{W} arm in 3rd position: the arm and leg on the same side are lifted." },
          { at: "SHand", text: "{S} arm in 2nd position." },
          { at: "neck", text: "The body is directed towards the standing foot, slightly forward." },
        ],
      },
      { kind: "room", facing: 8, leg: 4 },
    ],
  },
  {
    slug: "first-arabesque",
    name: "1st arabesque",
    kind: "pose",
    pronunciation: "ah-rah-BESK",
    summary: "On one leg, the other straight behind at 90° or more, the feet effacé and the whole figure in profile. The arm opposite the lifted leg is extended forward, the other to the side.",
    category: "poses",
    level: "beginner",
    goals: ["extensions", "balance"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(3, back(90), "5th-front", "side", "forward", { head: "arm-S", lean: 8 }),
        notes: [
          { at: "WToe", text: "{W} leg extended straight behind, no lower than 90°." },
          { at: "SAnkle", text: "Standing on the {s} leg; the feet effacé, the whole figure in profile to the audience (here facing point {p3})." },
          { at: "SHand", text: "{S} arm, opposite the lifted leg, extended forward, palm down." },
          { at: "WHand", text: "{W} arm taken out to the side." },
          { at: "head", text: "Head in profile to the audience." },
        ],
      },
      { kind: "room", facing: 3, leg: 7 },
    ],
  },
  {
    slug: "second-arabesque",
    name: "2nd arabesque",
    kind: "pose",
    pronunciation: "ah-rah-BESK",
    summary: "Body and legs as in 1st arabesque, but the arm on the side of the lifted leg is extended forward and the other goes back; the head turns to the audience.",
    category: "poses",
    level: "beginner",
    goals: ["extensions", "balance"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(3, back(90), "5th-front", "forward", "back", { head: "audience", lean: 8, twist: 15 }),
        notes: [
          { at: "WToe", text: "Body and legs as in 1st arabesque: {w} leg straight behind at 90°." },
          { at: "SAnkle", text: "Standing on the {s} leg, in profile (here facing point {p3})." },
          { at: "WHand", text: "{W} arm, on the side of the lifted leg, extended forward." },
          { at: "SHand", text: "{S} arm brought back far enough to be seen behind the body." },
          { at: "head", text: "Head turned towards the audience." },
        ],
      },
      { kind: "room", facing: 3, leg: 7 },
    ],
  },
  {
    slug: "third-arabesque",
    name: "3rd arabesque",
    kind: "pose",
    pronunciation: "ah-rah-BESK",
    summary: "Faces the audience with the leg croisé behind at 90° and the body bent forward. The arm on the side of the lifted leg is extended forward, the face turned towards it.",
    category: "poses",
    level: "intermediate",
    goals: ["extensions", "balance"],
    terms: ["croise"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(2, back(90), "5th-front", "forward", "side", { head: "arm-W", lean: 14 }),
        notes: [
          { at: "WToe", text: "{W} leg extended straight behind at 90°, towards point {p6}." },
          { at: "SAnkle", text: "Standing on the {s} leg; the arabesque faces the audience, croisé (facing point {p2}), the body bent forward." },
          { at: "WHand", text: "{W} arm, on the side of the lifted leg, extended forward." },
          { at: "SHand", text: "{S} arm taken out to the side." },
          { at: "head", text: "Face turned towards the forward hand." },
        ],
      },
      { kind: "room", facing: 2, leg: 6 },
    ],
  },
  {
    slug: "fourth-arabesque",
    name: "4th arabesque",
    kind: "pose",
    pronunciation: "ah-rah-BESK",
    summary: "Legs as in 3rd arabesque, but the arm opposite the lifted leg comes forward and the other shows behind the back; half turned away from the audience, head towards it.",
    category: "poses",
    level: "intermediate",
    goals: ["extensions", "balance"],
    terms: ["croise"],
    diagrams: [
      {
        kind: "figure",
        pose: pose(2, back(90), "5th-front", "back", "forward", { head: "audience", lean: 10, twist: 30 }),
        notes: [
          { at: "WToe", text: "{W} leg extended straight behind at 90°, towards point {p6}." },
          { at: "SAnkle", text: "Legs as in 3rd arabesque (croisé, facing point {p2}); the body is half turned away from the audience." },
          { at: "SHand", text: "{S} arm, opposite the lifted leg, brought forward." },
          { at: "WHand", text: "{W} arm shows behind the back." },
          { at: "head", text: "Head turned towards the audience, emphasising the direction with the glance." },
        ],
      },
      { kind: "room", facing: 2, leg: 6 },
    ],
  },

  // ── VI. Connecting and auxiliary movements ──────────────────────────────
  {
    slug: "pas-de-bourree",
    name: "Pas de bourrée",
    pronunciation: "pah duh boo-RAY",
    summary: "Small, quick changes of weight on demi-pointe, with or without a change of feet, finishing in demi-plié.",
    category: "connecting",
    level: "beginner",
    goals: ["petit-allegro", "feet"],
    terms: ["demi-pointe"],
    howTo: {
      start: "Demi-plié on the {s} leg, the {w} foot sur le cou-de-pied behind.",
      direction: "Step behind onto demi-pointe, step to the side onto the other foot on demi-pointe, then close into 5th in demi-plié.",
      mistakes: "Flat-footed steps; losing the cou-de-pied.",
    },
    phases: [
      ph("Demi-plié on the {s} leg, {w} foot sur le cou-de-pied behind", pose(1, "cdp-back", "5th-front", "2nd", "2nd", { plie: "demi" })),
      ph("Step back onto the {w} foot on demi-pointe", pose(1, "5th-back", "cdp-front", "2nd", "2nd", { releve: true })),
      ph("Step to the side onto the {s} foot on demi-pointe", pose(1, "2nd", "2nd", "2nd", "2nd", { releve: true })),
      ph("Close in 5th, {w} foot front, demi-plié", { ...FIFTH_PLIE }),
    ],
    variants: [
      { slug: "pas-de-bourree-with-change", name: "With change of feet", howTo: { direction: "The feet change: the foot that began behind finishes in front." } },
      { slug: "pas-de-bourree-without-change", name: "Without change of feet", howTo: { direction: "The feet finish in the same order they started." } },
      { slug: "pas-de-bourree-dessus-dessous", name: "Dessus–dessous", howTo: { direction: "Dessus begins with the front foot; dessous begins with the back foot." }, terms: ["dessus", "dessous"] },
      { slug: "pas-de-bourree-en-tournant", name: "En tournant", level: "intermediate", howTo: { direction: "The small steps complete a turn." }, terms: ["en-tournant"] },
    ],
  },
  {
    slug: "coupe",
    name: "Coupé",
    pronunciation: "koo-PAY",
    translation: "cut",
    summary: "A movement that makes the beginning of another step easier: one foot replaces the other, which is 'cut' away.",
    category: "connecting",
    level: "beginner",
    goals: ["petit-allegro"],
    terms: ["cou-de-pied-term"],
    howTo: {
      direction: "The {w} foot, from sur le cou-de-pied, drops into the place of the {s} foot, which lifts sur le cou-de-pied, ready for the next step.",
    },
    phases: [
      ph("{W} foot sur le cou-de-pied behind, demi-plié on the {s} leg", pose(1, "cdp-back", "5th-front", "2nd", "2nd", { plie: "demi" })),
      ph("{W} foot takes the weight; {s} foot lifts sur le cou-de-pied in front", pose(1, "5th-back", "cdp-front", "2nd", "2nd", { plie: "demi" })),
    ],
  },
  {
    slug: "passe",
    name: "Passé",
    pronunciation: "pah-SAY",
    translation: "passed",
    summary: "An auxiliary movement that passes the leg from one position into another, the foot travelling past the knee of the supporting leg.",
    category: "connecting",
    level: "beginner",
    goals: ["turns", "extensions"],
    howTo: {
      direction: "The {w} foot draws up the front of the {s} leg to the knee and passes behind it, then lowers or extends into the next position.",
      cues: "Keep the {w} knee open to the side as the foot passes.",
    },
    phases: [
      ph("5th position, {w} foot front", FIFTH_2ND),
      ph("{W} foot passes the {s} knee", pose(1, "retire", "5th-back", "2nd", "2nd")),
      ph("Lowers into 5th behind", pose(1, "5th-back", "5th-front", "2nd", "2nd")),
    ],
  },

  // ── VII. Jumps ──────────────────────────────────────────────────────────
  {
    slug: "temps-leve",
    name: "Temps levé",
    pronunciation: "tahn luh-VAY",
    translation: "raised time",
    summary: "The simplest jump: from demi-plié in 1st, 2nd or 5th position, straight up and back into the same position. It can also be done on one foot.",
    category: "jumps",
    level: "beginner",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 1st, 2nd or 5th position.",
      direction: "Push off the floor, legs and feet fully stretched in the air, keeping the position.",
      finish: "Land through the toes and heels into demi-plié.",
      mistakes: "Landing on flat feet; bent knees in the air.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump, legs stretched in 5th", IN_AIR(FIFTH_2ND)),
      ph("Land in 5th, demi-plié", FIFTH_PLIE),
    ],
    variants: [
      { slug: "temps-leve-two-feet", name: "From two feet" },
      {
        slug: "temps-leve-one-foot",
        name: "On one foot",
        howTo: { start: "Demi-plié on the {s} leg, the {w} foot sur le cou-de-pied.", direction: "Push off the {s} leg and land on it, the {w} foot keeping its place." },
        phases: [
          ph("Demi-plié on the {s} leg, {w} foot sur le cou-de-pied", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
          ph("Jump, keeping the pose", IN_AIR(pose(1, "cdp-front", "5th-back", "2nd", "2nd"), 22)),
          ph("Land on the {s} leg", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
        ],
      },
    ],
  },
  {
    slug: "sissonne-simple",
    name: "Sissonne simple",
    pronunciation: "see-SAWN SAMPL",
    summary: "A small jump from 5th position landing on one foot, the other foot sur le cou-de-pied.",
    category: "jumps",
    level: "beginner",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 5th.",
      finish: "Land on the {s} leg in demi-plié, the {w} foot sur le cou-de-pied.",
      mistakes: "Sickling the cou-de-pied foot.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump, legs stretched", IN_AIR(FIFTH_2ND)),
      ph("Land on the {s} leg, {w} foot sur le cou-de-pied", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
    ],
  },

  // Close to the ground
  {
    slug: "glissade",
    name: "Glissade",
    pronunciation: "glee-SAHD",
    translation: "glide",
    summary: "A jump directed along the floor rather than into the air: the working foot slides out, the weight passes over to it, and the other foot slides in to 5th.",
    category: "jumps-ground",
    level: "beginner",
    goals: ["petit-allegro", "feet"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 5th.",
      workingLeg: "Slides out along the floor and opens a little off it.",
      direction: "Push off the {s} leg, pass the weight onto the {w} foot through the toes, then slide the {s} foot in.",
      finish: "5th position in demi-plié.",
      cues: "Low and smooth; both feet stretch for an instant.",
      mistakes: "Hopping up instead of gliding along; finishing without a true 5th.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("{W} foot slides out to the side", pose(1, side(20), "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Weight passes onto the {w} foot, {s} foot stretched", pose(1, "5th-back", side(20), "2nd", "2nd", { plie: "demi" })),
      ph("{S} foot slides in to 5th, demi-plié", FIFTH_PLIE),
    ],
    variants: [
      { slug: "glissade-derriere", name: "Derrière", howTo: { direction: "Begins with the back foot, travels sideways, closes behind." }, terms: ["derriere"] },
      { slug: "glissade-devant", name: "Devant", howTo: { direction: "Begins with the front foot, travels sideways, closes in front." }, terms: ["devant"] },
      { slug: "glissade-dessus", name: "Dessus", howTo: { direction: "Begins with the back foot, closes in front." }, terms: ["dessus"] },
      { slug: "glissade-dessous", name: "Dessous", howTo: { direction: "Begins with the front foot, closes behind." }, terms: ["dessous"] },
      { slug: "glissade-en-avant", name: "En avant", howTo: { direction: "Travels forward." }, terms: ["en-avant"] },
      { slug: "glissade-en-arriere", name: "En arrière", howTo: { direction: "Travels backward." }, terms: ["en-arriere"] },
    ],
  },
  {
    slug: "pas-de-basque",
    name: "Pas de basque",
    pronunciation: "pah duh BAHSK",
    translation: "Basque step",
    summary: "A travelling jump along the floor: a half circle of the working leg, a transfer of weight onto it, and the other foot gliding through 1st into 4th.",
    category: "jumps-ground",
    level: "intermediate",
    goals: ["petit-allegro"],
    jumpSize: "petit",
    howTo: {
      direction: "The {w} leg draws a half circle from front to side, the weight passes onto it, then the {s} foot slides through 1st into 4th in front and the {w} foot closes.",
      mistakes: "Hurrying the half circle.",
    },
    phases: [
      ph("Demi-plié, {w} leg circles from front to side", pose(1, side(25), "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Weight passes onto the {w} leg", pose(1, "5th-back", side(20), "2nd", "2nd", { plie: "demi" })),
      ph("{S} foot slides through 1st into 4th in front", pose(1, "4th-back", "4th-front", "1st", "2nd", { plie: "demi" })),
    ],
  },

  // Both feet to both feet
  {
    slug: "changement-de-pieds",
    name: "Changement de pieds",
    pronunciation: "shahnzh-MAHN duh PYAY",
    translation: "change of feet",
    summary: "A jump from 5th position that changes the front foot in the air and lands in 5th.",
    category: "jumps-two-to-two",
    level: "beginner",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 5th, {w} foot front.",
      direction: "Jump straight up, legs stretched; the feet open slightly and change.",
      finish: "Land in demi-plié in 5th, {s} foot front.",
      mistakes: "Opening the legs wide; not finishing in a true 5th.",
    },
    phases: [
      ph("Demi-plié in 5th, {w} foot front", FIFTH_PLIE),
      ph("Jump, legs stretched", IN_AIR(FIFTH_2ND)),
      ph("Land in 5th, {s} foot front", FIFTH_BACK_PLIE),
    ],
    variants: [
      { slug: "petit-changement", name: "Petit changement", howTo: { direction: "A small jump that only just leaves the floor." } },
      { slug: "grand-changement", name: "Grand changement", level: "intermediate", howTo: { direction: "A high jump, holding 5th in the air before the change." } },
    ],
  },
  {
    slug: "echappe-saute",
    name: "Échappé",
    pronunciation: "ay-shah-PAY",
    translation: "escaped",
    summary: "From 5th, jump and open the legs to land in 2nd (or 4th), then jump again to close in 5th.",
    category: "jumps-two-to-two",
    level: "beginner",
    goals: ["jumps"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 5th.",
      direction: "Jump, then open the legs to land in 2nd in demi-plié. Jump again to return to 5th.",
      mistakes: "Opening the legs straight from the floor.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump", IN_AIR(FIFTH_2ND)),
      ph("Land in 2nd, demi-plié", pose(1, "2nd", "2nd", "2nd", "2nd", { plie: "demi" })),
      ph("Jump and close in 5th", FIFTH_BACK_PLIE),
    ],
    variants: [
      { slug: "petit-echappe", name: "Petit échappé" },
      { slug: "grand-echappe", name: "Grand échappé", level: "intermediate", howTo: { direction: "A high jump, the legs held in 5th in the air before opening." } },
    ],
  },
  {
    slug: "soubresaut",
    name: "Soubresaut",
    pronunciation: "soo-bruh-SOH",
    translation: "sudden bound",
    summary: "A jump from 5th that holds the legs pressed together in 5th in the air, landing in the same 5th.",
    category: "jumps-two-to-two",
    level: "intermediate",
    goals: ["jumps"],
    jumpSize: "medium",
    howTo: {
      start: "Demi-plié in 5th.",
      direction: "Jump with the legs pressed together in 5th; the back may arch slightly.",
      finish: "Land in the same 5th.",
      mistakes: "Legs separating in the air.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump, legs pressed in 5th, back slightly arched", { ...IN_AIR(FIFTH_2ND, 36), lean: -8 }),
      ph("Land in the same 5th", FIFTH_PLIE),
    ],
  },
  {
    slug: "assemble",
    name: "Assemblé",
    pronunciation: "ah-sahm-BLAY",
    translation: "assembled",
    summary: "The working leg brushes out to the side, the supporting leg pushes off, and the legs join in 5th in the air to land together.",
    category: "jumps-two-to-two",
    level: "beginner",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 5th, {w} foot behind.",
      workingLeg: "Brushes out through the floor to the side at 45°.",
      standingLeg: "Pushes off right after the brush and joins the working leg in 5th in the air.",
      finish: "Land on both feet in 5th, demi-plié.",
      cues: "Assemble the legs in the air, not on the floor.",
      mistakes: "Landing on one foot first.",
    },
    phases: [
      ph("Demi-plié in 5th, {w} foot behind", FIFTH_BACK_PLIE),
      ph("{W} leg brushes out to the side", pose(1, side(45), "5th-front", "2nd", "2nd", { plie: "demi" })),
      ph("Legs join in 5th in the air", IN_AIR(FIFTH_2ND)),
      ph("Land in 5th, {w} foot front", FIFTH_PLIE),
    ],
    variants: [
      { slug: "assemble-dessus", name: "Dessus", howTo: { direction: "The back foot brushes to the side and closes in front." }, terms: ["dessus", "a-la-seconde"] },
      { slug: "assemble-dessous", name: "Dessous", howTo: { direction: "The front foot brushes to the side and closes behind." }, terms: ["dessous", "a-la-seconde"] },
      { slug: "assemble-battu", name: "Battu", level: "intermediate", howTo: { direction: "The legs beat in the air before closing in 5th." }, terms: ["battu"] },
    ],
  },
  {
    slug: "sissonne-fermee",
    name: "Sissonne fermée",
    pronunciation: "see-SAWN fehr-MAY",
    translation: "closed sissonne",
    summary: "A travelling jump from both feet: the legs open in the air, you land on one foot and the other closes straight into 5th.",
    category: "jumps-two-to-two",
    level: "intermediate",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "medium",
    howTo: {
      start: "Demi-plié in 5th.",
      direction: "Push off both feet, travelling; the legs open in the air.",
      finish: "Land on the {s} foot and slide the {w} foot in through the floor to 5th, demi-plié.",
      cues: "The closing foot brushes the floor as one movement with the landing.",
      mistakes: "A pause between landing and closing.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Push off, legs open", IN_AIR(pose(1, side(45), "5th-back", "2nd", "2nd"))),
      ph("Land on the {s} foot", pose(1, side(35), "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Close the {w} foot into 5th", FIFTH_PLIE),
    ],
  },
  {
    slug: "sissonne-tombee",
    name: "Sissonne tombée",
    pronunciation: "see-SAWN tawm-BAY",
    translation: "falling sissonne",
    summary: "A sissonne that lands on one foot and falls onto the other into 4th position.",
    category: "jumps-two-to-two",
    level: "intermediate",
    goals: ["jumps"],
    jumpSize: "petit",
    howTo: {
      finish: "Land on the {s} foot and immediately fall forward onto the {w} foot into 4th in demi-plié.",
      mistakes: "Landing heavily before the fall.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump", IN_AIR(FIFTH_2ND)),
      ph("Land on the {s} foot, {w} foot sur le cou-de-pied", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Fall onto the {w} foot into 4th", pose(8, "4th-front", "4th-back", "1st", "2nd", { plie: "demi" })),
    ],
  },
  {
    slug: "pas-de-chat",
    name: "Pas de chat",
    pronunciation: "pah duh SHAH",
    translation: "step of the cat",
    summary: "A light sideways jump: each foot is drawn up in turn, and the jump lands in 5th.",
    category: "jumps-two-to-two",
    level: "beginner",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "medium",
    howTo: {
      start: "Demi-plié in 5th, {w} foot behind.",
      direction: "The {w} foot is drawn up, you push off, and the {s} foot follows while you are in the air, travelling sideways.",
      finish: "Land on the {w} foot, then close the {s} foot in front in 5th.",
      mistakes: "Landing on both feet at once.",
    },
    phases: [
      ph("Demi-plié in 5th, {w} foot behind", FIFTH_BACK_PLIE),
      ph("{W} foot drawn up", pose(1, "retire", "5th-front", "2nd", "2nd", { plie: "demi" })),
      ph("In the air, the {s} foot follows", pose(1, "retire", "retire", "2nd", "2nd", { air: 36 })),
      ph("Land and close in 5th, {s} foot front", FIFTH_BACK_PLIE),
    ],
  },
  {
    slug: "failli",
    name: "Failli",
    pronunciation: "fah-YEE",
    translation: "giving way",
    summary: "A small jump from 5th: the back leg opens behind in the air, and after landing it slides through 1st into 4th in front.",
    category: "jumps-two-to-two",
    level: "intermediate",
    goals: ["petit-allegro"],
    jumpSize: "petit",
    howTo: {
      direction: "Jump from 5th; the {s} leg opens behind. Land on the {w} leg and slide the {s} foot through 1st into 4th in front.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump, {s} leg opens behind", IN_AIR(pose(8, "5th-front", back(35), "2nd", "2nd"), 24)),
      ph("Land on the {w} leg, {s} leg behind", pose(8, "5th-front", back(25), "2nd", "2nd", { plie: "demi" })),
      ph("{S} foot slides through 1st into 4th in front", pose(8, "4th-back", "4th-front", "1st", "2nd", { plie: "demi" })),
    ],
  },
  {
    slug: "chasse",
    name: "Chassé",
    pronunciation: "shah-SAY",
    translation: "chased",
    summary: "A travelling jump in which one foot chases the other: the legs meet in 5th in the air.",
    category: "jumps-two-to-two",
    level: "beginner",
    goals: ["petit-allegro"],
    jumpSize: "petit",
    howTo: {
      direction: "Slide the {w} foot out into 4th; spring so the legs meet in 5th in the air; land and slide out again.",
      mistakes: "Legs separating in the air.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("{W} foot slides out into 4th", pose(2, "4th-front", "4th-back", "1st", "2nd", { plie: "demi" })),
      ph("Spring, legs meet in 5th in the air", IN_AIR(pose(2, "5th-front", "5th-back", "1st", "2nd"), 28)),
      ph("Land and slide out again", pose(2, "4th-front", "4th-back", "1st", "2nd", { plie: "demi" })),
    ],
  },
  {
    slug: "cabriole-fermee",
    name: "Cabriole fermée",
    pronunciation: "kah-bree-OHL fehr-MAY",
    translation: "closed caper",
    summary: "The working leg is thrown up, the supporting leg pushes off and beats against it from underneath; you land on the take-off leg and close into 5th.",
    category: "jumps-two-to-two",
    level: "advanced",
    goals: ["jumps"],
    jumpSize: "grand",
    terms: ["battu"],
    howTo: {
      direction: "Throw the {w} leg forward, push off the {s} leg and beat it up against the {w} leg, land on the {s} leg, then close the {w} leg into 5th.",
      cues: "The beat lifts the working leg higher, not the other way round.",
      mistakes: "Bringing the working leg down to meet the beat.",
    },
    phases: [
      ph("Demi-plié, {w} leg thrown forward", pose(2, front(45), "5th-back", "2nd", "3rd", { plie: "demi" })),
      ph("{S} leg beats up under the {w} leg", pose(2, front(50), front(40), "2nd", "3rd", { air: 36 })),
      ph("Land on the {s} leg", pose(2, front(45), "5th-back", "2nd", "3rd", { plie: "demi" })),
      ph("Close in 5th", { ...FIFTH_PLIE, facing: 2 }),
    ],
  },

  // Both feet to one foot
  {
    slug: "sissonne-ouverte",
    name: "Sissonne ouverte",
    pronunciation: "see-SAWN oo-VEHRT",
    translation: "open sissonne",
    summary: "A jump from both feet that lands on one foot, the other leg left open in the air.",
    category: "jumps-two-to-one",
    level: "beginner",
    goals: ["jumps"],
    jumpSize: "medium",
    howTo: {
      start: "Demi-plié in 5th.",
      direction: "Push off both feet; in the air the {w} leg opens to 45° or 90°.",
      finish: "Land on the {s} foot in demi-plié, the {w} leg held open.",
      mistakes: "Opening the leg late, after landing.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Push off; the {w} leg opens", IN_AIR(pose(1, side(60), "5th-back", "2nd", "2nd"))),
      ph("Land on the {s} foot, {w} leg open", pose(1, side(60), "5th-back", "2nd", "2nd", { plie: "demi" })),
    ],
    variants: [
      { slug: "sissonne-ouverte-arabesque", name: "En arabesque", terms: ["derriere"], phases: [ph("Demi-plié in 5th", { ...FIFTH_PLIE, facing: 8 }), ph("Push off; the {w} leg opens behind", IN_AIR(pose(3, back(80), "5th-front", "side", "forward"))), ph("Land on the {s} foot in 1st arabesque", pose(3, back(80), "5th-front", "side", "forward", { plie: "demi" }))] },
      { slug: "sissonne-ouverte-seconde", name: "À la seconde", terms: ["a-la-seconde"] },
    ],
  },
  {
    slug: "ballonne",
    name: "Ballonné",
    pronunciation: "bah-law-NAY",
    translation: "ball-like",
    summary: "From both feet, a jump in which the working leg opens to 45° and folds in sur le cou-de-pied as you land on the other foot.",
    category: "jumps-two-to-one",
    level: "intermediate",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      direction: "Jump from 5th as the {w} leg opens to 45°; land on the {s} leg as the {w} foot comes in sur le cou-de-pied.",
      mistakes: "Bending the knee of the working leg while it is open.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Jump, {w} leg opens to 45°", IN_AIR(pose(1, side(45), "5th-back", "2nd", "2nd"))),
      ph("Land on the {s} leg, {w} foot sur le cou-de-pied", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
    ],
  },
  {
    slug: "jete",
    name: "Jeté",
    pronunciation: "zhuh-TAY",
    translation: "thrown",
    summary: "From 5th, the working leg is thrown out and you jump onto it, the other foot finishing sur le cou-de-pied.",
    category: "jumps-two-to-one",
    level: "beginner",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      start: "Demi-plié in 5th, {w} foot behind.",
      direction: "The {w} leg brushes out to the side at 45°; push off the {s} leg and land on the {w} leg.",
      finish: "Demi-plié on the {w} leg, the {s} foot sur le cou-de-pied behind.",
      mistakes: "Letting the leg drop before the jump.",
    },
    phases: [
      ph("Demi-plié in 5th, {w} foot behind", FIFTH_BACK_PLIE),
      ph("{W} leg thrown out to the side", pose(1, side(45), "5th-front", "2nd", "2nd", { plie: "demi" })),
      ph("Push off, legs stretched", IN_AIR(pose(1, side(35), side(15), "2nd", "2nd"))),
      ph("Land on the {w} leg, {s} foot sur le cou-de-pied behind", pose(1, "5th-back", "cdp-back", "2nd", "2nd", { plie: "demi" })),
    ],
  },
  {
    slug: "grand-jete",
    name: "Grand jeté",
    pronunciation: "grahn zhuh-TAY",
    translation: "big thrown",
    summary: "A big jump from one foot to the other, the legs reaching wide in the air. Vaganova classes it with the jumps from both feet to one foot when done from 5th.",
    category: "jumps-two-to-one",
    level: "intermediate",
    goals: ["jumps", "flexibility"],
    jumpSize: "grand",
    terms: ["en-avant"],
    howTo: {
      direction: "Throw the {w} leg forward through grand battement and push off the {s} leg, travelling.",
      finish: "Land on the {w} leg in demi-plié, the {s} leg extended in arabesque.",
      mistakes: "Jumping straight up instead of travelling; landing on a straight knee.",
    },
    phases: [
      ph("Demi-plié", pose(3, "5th-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("{W} leg thrown forward, push off", pose(3, front(90), "5th-back", "side", "forward", { plie: "demi" })),
      ph("Legs open wide in the air", IN_AIR(pose(3, front(85), back(80), "side", "forward"), 40)),
      ph("Land on the {w} leg in arabesque", pose(3, "5th-front", back(80), "forward", "side", { plie: "demi", lean: 8 })),
    ],
  },
  {
    slug: "emboite",
    name: "Emboîté",
    pronunciation: "ahm-bwah-TAY",
    translation: "fitted together",
    summary: "Small jumps from foot to foot, the free foot arriving sur le cou-de-pied in front (or behind) each time.",
    category: "jumps-two-to-one",
    level: "intermediate",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    howTo: {
      direction: "Each jump changes onto the other foot as the free foot comes in sur le cou-de-pied.",
      mistakes: "Lifting the knees forward instead of keeping turn-out.",
    },
    phases: [
      ph("Demi-plié on the {s} leg, {w} foot sur le cou-de-pied in front", pose(1, "cdp-front", "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Jump", IN_AIR(pose(1, "cdp-front", "5th-back", "2nd", "2nd"), 22)),
      ph("Land on the {w} leg, {s} foot sur le cou-de-pied in front", pose(1, "5th-back", "cdp-front", "2nd", "2nd", { plie: "demi" })),
    ],
  },

  // One foot to the other
  {
    slug: "jete-entrelace",
    name: "Jeté entrelacé",
    pronunciation: "zhuh-TAY ahn-truh-lah-SAY",
    translation: "interlaced throw",
    summary: "A turning jump: one leg is thrown up, you turn in the air as the legs change, and land on the thrown leg in arabesque.",
    category: "jumps-one-to-other",
    level: "advanced",
    goals: ["jumps", "turns"],
    jumpSize: "grand",
    terms: ["en-tournant"],
    howTo: {
      direction: "Throw the {w} leg up through grand battement, turn in the air and change the legs.",
      finish: "Land on the {w} leg in demi-plié, the {s} leg in arabesque.",
      mistakes: "Turning before leaving the floor.",
    },
    phases: [
      ph("Step onto the {s} leg, {w} leg thrown up", pose(7, front(90), "5th-back", "3rd", "3rd", { plie: "demi" })),
      ph("Turning in the air, the legs change", IN_AIR(pose(1, back(70), front(70), "3rd", "3rd"), 40)),
      ph("Land on the {w} leg in arabesque", pose(3, "5th-front", back(80), "forward", "side", { plie: "demi", lean: 8 })),
    ],
  },

  // ── VIII. Beats ─────────────────────────────────────────────────────────
  {
    slug: "royale",
    name: "Royale",
    pronunciation: "rwah-YAHL",
    translation: "royal",
    summary: "A changement with a beat: the legs beat in front before they change.",
    category: "beats",
    level: "intermediate",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    terms: ["battu"],
    howTo: {
      direction: "Jump from 5th, open the legs slightly, beat the {w} leg in front of the {s} leg, then change and land in 5th.",
      mistakes: "Beating with bent knees.",
    },
    phases: [
      ph("Demi-plié in 5th, {w} foot front", FIFTH_PLIE),
      ph("Jump, the {w} leg beats in front", IN_AIR(FIFTH_2ND, 32)),
      ph("Change and land in 5th, {s} foot front", FIFTH_BACK_PLIE),
    ],
  },
  {
    slug: "entrechat-quatre",
    name: "Entrechat quatre",
    pronunciation: "ahn-truh-SHAH KAHTR",
    translation: "interweaving, four",
    summary: "A jump from 5th in which the legs open and cross in the air, landing in the same 5th.",
    category: "beats",
    level: "intermediate",
    goals: ["jumps", "petit-allegro"],
    jumpSize: "petit",
    terms: ["battu"],
    howTo: {
      direction: "Jump from 5th, open slightly, beat with the {w} leg behind, open again, and land with the {w} foot in front.",
      cues: "The beats come from the thighs, legs fully stretched.",
      mistakes: "Beating only with the feet.",
    },
    phases: [
      ph("Demi-plié in 5th, {w} foot front", FIFTH_PLIE),
      ph("Jump, legs open slightly", IN_AIR(pose(1, "1st", "1st", "2nd", "2nd"), 30)),
      ph("{W} leg beats behind", IN_AIR(pose(1, "5th-back", "5th-front", "2nd", "2nd"), 34)),
      ph("Land in 5th, {w} foot front", FIFTH_PLIE),
    ],
  },

  // ── X. Turns ────────────────────────────────────────────────────────────
  {
    slug: "pirouette",
    name: "Tours (pirouettes)",
    pronunciation: "TOOR / peer-WET",
    translation: "turns",
    summary: "Turns on one leg on demi-pointe, from a preparation in 5th or 4th position, en dehors or en dedans.",
    category: "turns",
    level: "intermediate",
    goals: ["turns", "balance"],
    terms: ["demi-pointe"],
    howTo: {
      standingLeg: "Pushes up to high demi-pointe and stays pulled up through the turn.",
      workingLeg: "Arrives at the knee of the supporting leg as you rise.",
      arms: "Open for the preparation, then close in 1st for the turn; the arms give the force.",
      head: "Spot the front: the head leaves last and arrives first.",
      finish: "Close in 5th or 4th, in demi-plié.",
      mistakes: "Leaning into the turn; throwing the arms.",
    },
    phases: [
      ph("Demi-plié in 5th", FIFTH_PLIE),
      ph("Relevé, {w} foot to the knee, arms in 1st: turn", pose(1, "retire", "5th-back", "1st", "1st", { releve: true })),
      ph("Close in 5th, demi-plié", FIFTH_BACK_PLIE),
    ],
    variants: [
      { slug: "pirouette-en-dehors-5th", name: "En dehors from 5th", howTo: { start: "5th position, demi-plié.", direction: "Turning outward, towards the {w} side." }, terms: ["en-dehors"], diagrams: [{ kind: "turn", direction: "en dehors" }] },
      {
        slug: "pirouette-en-dehors-4th",
        name: "En dehors from 4th",
        howTo: { start: "4th position, demi-plié, weight between the feet.", direction: "The back leg comes to the knee; turn outward." },
        terms: ["en-dehors"],
        phases: [
          ph("Demi-plié in 4th", pose(8, "4th-back", "4th-front", "2nd", "1st", { plie: "demi" })),
          ph("Relevé on the {s} leg, {w} foot to the knee: turn en dehors", pose(1, "retire", "5th-back", "1st", "1st", { releve: true })),
          ph("Close in 5th or 4th", FIFTH_BACK_PLIE),
        ],
        diagrams: [{ kind: "turn", direction: "en dehors" }],
      },
      {
        slug: "pirouette-en-dedans-4th",
        name: "En dedans from 4th",
        howTo: { start: "4th position, front leg in demi-plié, back leg straight.", standingLeg: "The front leg pushes up to relevé.", workingLeg: "The back leg opens and comes to the knee as you turn.", direction: "Turning inward, towards the standing leg." },
        terms: ["en-dedans"],
        phases: [
          ph("4th position, front leg in demi-plié", pose(2, "4th-back", "4th-front", "2nd", "1st", { plie: "demi" })),
          ph("{W} leg opens to 2nd", pose(1, side(45), "5th-back", "2nd", "2nd", { plie: "demi" })),
          ph("Relevé, {w} foot to the knee: turn en dedans", pose(1, "retire", "5th-back", "1st", "1st", { releve: true })),
          ph("Close in 5th", FIFTH_BACK_PLIE),
        ],
        diagrams: [{ kind: "turn", direction: "en dedans" }],
      },
    ],
  },
  {
    slug: "chaines",
    name: "Tours chaînés",
    pronunciation: "sheh-NAY",
    translation: "chained turns",
    summary: "A chain of quick half turns on both feet on demi-pointe, travelling in a straight line or a circle.",
    category: "turns",
    level: "intermediate",
    goals: ["turns"],
    terms: ["demi-pointe"],
    howTo: {
      start: "On demi-pointe in 1st position, travelling towards a corner.",
      direction: "Each step completes a half turn; the legs stay close together and straight.",
      head: "Spot the corner you are travelling to.",
      mistakes: "Feet too far apart; dropping the heels between turns.",
    },
    phases: [
      ph("Demi-pointe in 1st, arms open", pose(1, "1st", "1st", "2nd", "2nd", { releve: true })),
      ph("Half turn, arms close", pose(5, "1st", "1st", "1st", "1st", { releve: true })),
      ph("Half turn, facing front again", pose(1, "1st", "1st", "1st", "1st", { releve: true })),
    ],
  },
  {
    slug: "soutenu-en-tournant",
    name: "Soutenu en tournant",
    pronunciation: "soot-NUE ahn toor-NAHN",
    translation: "sustained, turning",
    summary: "A turn on both feet: the extended leg draws into a tight 5th on demi-pointe and you turn, changing the front foot.",
    category: "turns",
    level: "beginner",
    goals: ["turns"],
    terms: ["en-tournant", "demi-pointe"],
    howTo: {
      start: "Demi-plié on the {s} leg, the {w} leg extended to the side.",
      direction: "Draw the {w} leg in to a tight 5th in front on demi-pointe and turn, changing the front foot.",
      mistakes: "A loose 5th; sitting down in the turn.",
    },
    phases: [
      ph("Demi-plié on the {s} leg, {w} leg extended to the side", pose(1, "tendu-side", "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Draw into 5th on demi-pointe and turn", pose(1, "5th-front", "5th-back", "1st", "1st", { releve: true })),
      ph("Finish in 5th, {s} foot front", pose(1, "5th-back", "5th-front", "2nd", "2nd", { releve: true })),
    ],
  },

  // ── XI. Other kinds of turns ────────────────────────────────────────────
  {
    slug: "fouette-en-tournant",
    name: "Fouetté en tournant at 45°",
    pronunciation: "fweh-TAY ahn toor-NAHN",
    translation: "whipped, turning",
    summary: "Repeated turns on one leg: the working leg opens to 45° and whips in to the knee to drive each turn.",
    category: "other-turns",
    level: "advanced",
    goals: ["turns", "stamina"],
    terms: ["en-tournant", "en-dehors"],
    howTo: {
      standingLeg: "Lowers into demi-plié as the working leg opens, rises to demi-pointe as it whips in.",
      workingLeg: "Opens to 2nd at 45°, then whips in to the knee for the turn.",
      cues: "Find the plié each time; spot sharply.",
      mistakes: "Travelling off the spot; dropping the working leg below 45°.",
    },
    phases: [
      ph("Demi-plié on the {s} leg, {w} leg open in 2nd at 45°", pose(1, side(45), "5th-back", "2nd", "2nd", { plie: "demi" })),
      ph("Relevé, {w} foot whips in to the knee: turn", pose(1, "retire", "5th-back", "1st", "1st", { releve: true })),
    ],
    diagrams: [{ kind: "turn", direction: "en dehors" }],
  },
];

export const seedRelationships: SeedRelationship[] = [
  // Built from
  { from: "demi-plie", to: "first-position", type: "built_from", note: "plié is learned first in 1st position" },
  { from: "grand-plie", to: "demi-plie", type: "built_from" },
  { from: "battement-tendu", to: "fifth-position", type: "built_from" },
  { from: "battement-frappe", to: "cou-de-pied", type: "built_from" },
  { from: "petit-battement", to: "cou-de-pied", type: "built_from" },
  { from: "battement-fondu", to: "cou-de-pied", type: "built_from" },
  { from: "battement-fondu", to: "demi-plie", type: "built_from", note: "the supporting leg" },
  { from: "battement-developpe", to: "passe", type: "built_from", note: "the foot draws up to the knee" },
  { from: "rond-de-jambe-par-terre", to: "battement-tendu", type: "built_from" },
  { from: "pas-de-bourree", to: "cou-de-pied", type: "built_from" },
  { from: "coupe", to: "cou-de-pied", type: "built_from" },
  { from: "glissade", to: "battement-tendu-jete", type: "built_from", note: "the foot slides out like a low tendu jeté" },
  { from: "assemble", to: "battement-tendu-jete", type: "built_from", note: "the brush out" },
  { from: "jete", to: "battement-tendu-jete", type: "built_from" },
  { from: "changement-de-pieds", to: "fifth-position", type: "built_from" },
  { from: "temps-leve", to: "demi-plie", type: "built_from" },
  { from: "pas-de-chat", to: "passe", type: "built_from", note: "each foot is drawn up" },
  { from: "ballonne", to: "cou-de-pied", type: "built_from" },
  { from: "grand-jete", to: "grand-battement-jete", type: "built_from" },
  { from: "grand-jete", to: "first-arabesque", type: "built_from", note: "the landing" },
  { from: "jete-entrelace", to: "grand-battement-jete", type: "built_from" },
  { from: "jete-entrelace", to: "first-arabesque", type: "built_from", note: "the landing" },
  { from: "pirouette", to: "passe", type: "built_from", note: "the foot at the knee" },
  { from: "fouette-en-tournant", to: "battement-fondu", type: "built_from", note: "plié as the leg opens" },
  { from: "sissonne-ouverte-arabesque", to: "first-arabesque", type: "built_from", note: "the landing" },
  { from: "attitude-croisee", to: "croise-derriere", type: "built_from" },
  { from: "attitude-effacee", to: "efface-derriere", type: "built_from" },
  { from: "third-arabesque", to: "croise-derriere", type: "built_from", note: "the legs are croisé" },
  { from: "fourth-arabesque", to: "croise-derriere", type: "built_from", note: "the legs are croisé" },

  // Variation of
  { from: "second-arabesque", to: "first-arabesque", type: "variation_of", note: "same legs, other arm forward" },
  { from: "fourth-arabesque", to: "third-arabesque", type: "variation_of", note: "same legs, other arm forward" },
  { from: "royale", to: "changement-de-pieds", type: "variation_of", note: "with a beat" },
  { from: "entrechat-quatre", to: "changement-de-pieds", type: "variation_of", note: "beaten, landing in the same 5th" },
  { from: "grand-jete", to: "jete", type: "variation_of", note: "bigger and travelling" },
  { from: "jete-entrelace", to: "grand-jete", type: "variation_of", note: "turning" },
  { from: "sissonne-fermee", to: "sissonne-ouverte", type: "variation_of", note: "closing into 5th" },
  { from: "sissonne-tombee", to: "sissonne-ouverte", type: "variation_of", note: "falling into 4th" },
  { from: "sissonne-simple", to: "sissonne-ouverte", type: "variation_of", note: "landing sur le cou-de-pied" },
  { from: "soubresaut", to: "temps-leve", type: "variation_of", note: "from 5th, legs pressed together" },
  { from: "battement-tendu-jete", to: "battement-tendu", type: "variation_of", note: "thrown off the floor to 45°" },
  { from: "grand-battement-jete", to: "battement-tendu-jete", type: "variation_of", note: "thrown to 90°" },

  // Learn first
  { from: "demi-plie", to: "grand-plie", type: "learn_first" },
  { from: "temps-leve", to: "changement-de-pieds", type: "learn_first" },
  { from: "changement-de-pieds", to: "echappe-saute", type: "learn_first" },
  { from: "changement-de-pieds", to: "royale", type: "learn_first" },
  { from: "royale", to: "entrechat-quatre", type: "learn_first" },
  { from: "battement-tendu", to: "battement-tendu-jete", type: "learn_first" },
  { from: "battement-tendu-jete", to: "assemble", type: "learn_first" },
  { from: "assemble", to: "glissade", type: "learn_first", note: "after assemblé come glissade, jeté, pas de basque" },
  { from: "assemble", to: "jete", type: "learn_first" },
  { from: "assemble", to: "assemble-battu", type: "learn_first" },
  { from: "jete", to: "grand-jete", type: "learn_first" },
  { from: "grand-jete", to: "jete-entrelace", type: "learn_first" },
  { from: "pirouette-en-dehors-5th", to: "pirouette-en-dedans-4th", type: "learn_first" },
  { from: "pirouette", to: "fouette-en-tournant", type: "learn_first" },
  { from: "sissonne-ouverte", to: "sissonne-fermee", type: "learn_first" },
  { from: "grand-jete", to: "cabriole-fermee", type: "learn_first" },
  { from: "rond-de-jambe-par-terre", to: "rond-de-jambe-en-lair", type: "learn_first" },
  { from: "first-arabesque", to: "second-arabesque", type: "learn_first" },
  { from: "croise-devant", to: "croise-derriere", type: "learn_first" },
  { from: "efface-devant", to: "efface-derriere", type: "learn_first" },

  // Often paired with (optional combinations)
  { from: "glissade", to: "assemble", type: "paired_with" },
  { from: "glissade", to: "jete", type: "paired_with" },
  { from: "glissade", to: "grand-jete", type: "paired_with", note: "as a run-up" },
  { from: "pas-de-bourree", to: "pirouette", type: "paired_with", note: "as a preparation" },
  { from: "chasse", to: "grand-jete", type: "paired_with", note: "as a run-up" },
  { from: "failli", to: "assemble", type: "paired_with" },
  { from: "sissonne-fermee", to: "changement-de-pieds", type: "paired_with" },
  { from: "coupe", to: "jete", type: "paired_with" },
];
