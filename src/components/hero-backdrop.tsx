/**
 * The animated home-page backdrop: drifting colour fields plus a fine cream line
 * that traces a tendu (the foot brushing out along the floor and back) on a loop.
 * Pure CSS/SVG; motion stops when the user prefers reduced motion.
 */
const TENDU_PATH = "M 140 560 C 260 566, 380 566, 470 552 C 560 538, 640 520, 720 470";
const ARM_PATH = "M 300 250 C 380 120, 560 90, 700 170 C 760 205, 800 250, 830 300";

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="blob blob-a left-[-10%] top-[-10%] h-[55vh] w-[55vw] bg-[#8d9258]/70" />
      <div className="blob blob-b right-[-15%] top-[10%] h-[60vh] w-[50vw] bg-[#b59a78]/45" />
      <div className="blob blob-c bottom-[-20%] left-[20%] h-[55vh] w-[60vw] bg-[#3d4326]/80" />
      <div className="blob blob-a bottom-[5%] right-[5%] h-[30vh] w-[30vw] bg-[#d9b8a5]/25" />

      <svg
        viewBox="0 0 900 640"
        className="absolute right-[-4%] top-[8%] h-[85vh] w-auto max-w-none opacity-90"
        fill="none"
      >
        <line x1="60" y1="572" x2="860" y2="572" stroke="#f4ecd8" strokeOpacity="0.18" strokeWidth="1" />
        <path
          d={ARM_PATH}
          stroke="#f4ecd8"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="line-draw"
          style={{ ["--len" as string]: 760 }}
        />
        <path
          d={TENDU_PATH}
          stroke="#fff6df"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="line-draw"
          style={{ ["--len" as string]: 640 }}
        />
        <circle r="5" fill="#fff6df" className="dot-travel" style={{ offsetPath: `path("${TENDU_PATH}")` }}>
        </circle>
        <circle r="14" fill="#fff6df" opacity="0.25" className="dot-travel" style={{ offsetPath: `path("${TENDU_PATH}")` }} />
      </svg>
    </div>
  );
}
