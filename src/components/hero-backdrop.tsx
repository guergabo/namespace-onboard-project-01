import Image from "next/image";
import hero from "@/assets/hero.jpg";
import type { Pose } from "@/lib/pose";
import { Figure } from "./diagrams";

/**
 * The home-page backdrop: a soft gouache painting of a dancer that drifts very slowly,
 * with a band of mist moving across it and a darker wash on the left so the title reads.
 * Motion stops when the user prefers reduced motion.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={hero}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="hero-drift object-cover object-[70%_center]"
      />
      <div className="mist absolute inset-y-0 left-[-10%] w-[70%] bg-[radial-gradient(closest-side,rgb(243_234_211/0.18),transparent)] blur-2xl" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(68_66_41/0.7)_0%,rgb(68_66_41/0.35)_45%,transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgb(47_45_27/0.55),transparent)]" />
    </div>
  );
}

const FIFTH: Pose = { facing: 2, legs: { W: "5th-front", S: "5th-back" }, arms: { W: "2nd", S: "2nd" } };
const FIFTH_BACK: Pose = { ...FIFTH, legs: { W: "5th-back", S: "5th-front" } };
const tendu = (W: Pose["legs"]["W"], S: Pose["legs"]["S"]): Pose => ({ ...FIFTH, legs: { W, S } });

/** Battement tendu en croix: front, side, back, closing in 5th between each. One frame shows at a time. */
const TENDU_FRAMES: { pose: Pose; out: boolean }[] = [
  { pose: FIFTH, out: false },
  { pose: tendu("tendu-front", "5th-back"), out: true },
  { pose: FIFTH, out: false },
  { pose: tendu("tendu-side", "5th-back"), out: true },
  { pose: FIFTH_BACK, out: false },
  { pose: tendu("tendu-back", "5th-front"), out: true },
];

export function TenduLoop() {
  return (
    <div className="relative mx-auto aspect-[230/265] w-full max-w-[150px]" aria-label="A dancer doing battement tendu to the front, side and back">
      {TENDU_FRAMES.map((f, i) => (
        <div key={i} className="tendu-frame absolute inset-0" style={{ animationDelay: `${i * 1.2}s` }}>
          <Figure pose={f.pose} side="R" size="sm" notes={f.out ? [{ at: "WToe", text: "" }] : []} />
        </div>
      ))}
    </div>
  );
}
