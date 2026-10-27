import Image from "next/image";
import hero from "@/assets/hero.jpg";

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

/** A fine line tracing a tendu: the foot brushes out along the floor to a glowing point and back. */
export function TenduLine() {
  const path = "M 20 92 C 80 96, 150 96, 210 88 C 240 84, 262 74, 280 58";
  return (
    <svg viewBox="0 48 300 58" className="h-auto w-full" fill="none" aria-hidden>
      <line x1="10" y1="98" x2="290" y2="98" stroke="#f3ead3" strokeOpacity="0.25" />
      <path
        d={path}
        stroke="#fbf1d6"
        strokeWidth="1.2"
        className="line-draw"
        style={{ ["--len" as string]: 300 }}
      />
      <circle r="4" fill="#fbf1d6" className="dot-travel" style={{ offsetPath: `path("${path}")` }} />
      <circle r="11" fill="#fbf1d6" opacity="0.3" className="dot-travel" style={{ offsetPath: `path("${path}")` }} />
    </svg>
  );
}
