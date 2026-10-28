"use client";

import { useEffect, useReducer, useState } from "react";
import { createPortal } from "react-dom";
import { SECTION_COLORS, SECTION_NAMES, clock, type SectionKey } from "@/lib/class-builder";
import type { Pose, Side } from "@/lib/pose";
import { Figure } from "./diagrams";

export type PlayItem = { slug: string; name: string; prescription: string; seconds: number; sided: boolean; poses: Pose[] };
export type PlaySection = { key: SectionKey; title: string; seconds: number; items: PlayItem[] };

/** How long each phase of a step is shown: a steady, gentle pace, slower for adagio. */
const PHASE_MS: Record<SectionKey, number> = { barre: 1500, adagio: 3000, turns: 1500, allegro: 1000 };
/** How long "Change sides" stays up. */
const CUE_MS = 3000;

/**
 * The class's sections in proportion. Without `elapsed` it is a static legend with the minutes;
 * with it, a progress bar that fills as the class plays.
 */
export function Timeline({ sections, elapsed }: { sections: { key: SectionKey; seconds: number }[]; elapsed?: number }) {
  const parts = sections.map((s, i) => ({ ...s, start: sections.slice(0, i).reduce((sum, p) => sum + p.seconds, 0) }));
  if (elapsed === undefined) {
    return (
      <div className="flex h-8 overflow-hidden rounded-full border border-cream/25 text-[13px] text-sage-900">
        {parts.map((s) => (
          <div
            key={s.key}
            style={{ flexGrow: s.seconds }}
            className={`flex basis-0 items-center justify-center truncate px-2 ${SECTION_COLORS[s.key]}`}
            title={`${SECTION_NAMES[s.key]} · ${s.seconds / 60} min`}
          >
            {SECTION_NAMES[s.key]} {s.seconds / 60}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-1">
      {parts.map((s) => {
        const fill = Math.min(1, Math.max(0, (elapsed - s.start) / s.seconds));
        return (
          <div key={s.key} style={{ flexGrow: s.seconds }} className="basis-0 space-y-1.5">
            <p className="truncate text-center text-[13px] text-cream/75">{SECTION_NAMES[s.key]}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-cream/15">
              <div className={`h-full ${SECTION_COLORS[s.key]}`} style={{ width: `${fill * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Media-player icons, drawn so they keep their size and weight in every font. */
const ICONS = {
  back: "M7 6h2v12H7zM20 6v12l-9-6z",
  play: "M8 5v14l11-7z",
  pause: "M7 5h4v14H7zM13 5h4v14h-4z",
  skip: "M15 6h2v12h-2zM4 6v12l9-6z",
};
function Icon({ name, className = "h-6 w-6" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

type State = { index: number; ms: number; playing: boolean };
type Action = { type: "tick"; dt: number } | { type: "toggle" | "next" | "prev" | "restart" } | { type: "side"; side: Side };

/** Class mode: one step at a time with a countdown. Sided steps switch to the left halfway through. */
export function ClassPlayer({ title, sections }: { title: string; sections: PlaySection[] }) {
  const items = sections.flatMap((s) =>
    s.items.map((item, i) => ({ ...item, section: s.key, sectionTitle: s.title, position: i + 1, count: s.items.length })),
  );
  const starts = items.map((_, i) => items.slice(0, i).reduce((sum, it) => sum + it.seconds, 0));
  const total = starts[items.length - 1] + items[items.length - 1].seconds;
  const duration = (i: number) => items[i].seconds * 1000;

  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer((s: State, a: Action): State => {
    const done = s.index >= items.length;
    switch (a.type) {
      case "tick": {
        if (!s.playing || done) return s;
        const ms = s.ms + a.dt;
        if (ms < duration(s.index)) return { ...s, ms };
        const index = s.index + 1;
        return { index, ms: 0, playing: index < items.length };
      }
      case "toggle":
        return done ? s : { ...s, playing: !s.playing };
      case "next":
        return done ? s : { ...s, index: s.index + 1, ms: 0, playing: s.playing && s.index + 1 < items.length };
      case "prev":
        // Like a music player: back to the start of the step, or to the step before if already there.
        return s.ms > 3000 && !done ? { ...s, ms: 0 } : { ...s, index: Math.max(0, s.index - 1), ms: 0 };
      case "side":
        return done ? s : { ...s, ms: a.side === "R" ? 0 : duration(s.index) / 2 };
      case "restart":
        return { index: 0, ms: 0, playing: true };
    }
  }, { index: 0, ms: 0, playing: false });

  useEffect(() => {
    if (!state.playing) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      dispatch({ type: "tick", dt: now - last });
      last = now;
    }, 100);
    return () => clearInterval(id);
  }, [state.playing]);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      if (state.playing) dispatch({ type: "toggle" });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "toggle" });
      } else if (e.key === "ArrowRight") dispatch({ type: "next" });
      else if (e.key === "ArrowLeft") dispatch({ type: "prev" });
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, state.playing]);

  const start = () => {
    setOpen(true);
    if (state.index >= items.length) dispatch({ type: "restart" });
    else if (!state.playing) dispatch({ type: "toggle" });
  };
  const end = () => {
    setOpen(false);
    if (state.playing) dispatch({ type: "toggle" });
  };

  const button = (
    <button type="button" onClick={start} className="rounded-full bg-cream px-5 py-2 text-[15px] text-sage-900 shadow-lg transition hover:bg-glow">
      <span aria-hidden="true">▶ </span>
      {state.index > 0 && state.index < items.length ? "Resume class" : "Start class"}
    </button>
  );
  if (!open) return button;

  const done = state.index >= items.length;
  const item = items[Math.min(state.index, items.length - 1)];
  const half = item.seconds * 500;
  const side: Side = item.sided && state.ms >= half ? "L" : "R";
  const turns = item.section === "turns";
  const sideLabel = turns ? (side === "R" ? "Turning to the right" : "Turning to the left") : side === "R" ? "Right side" : "Left side";
  const cue = item.sided && state.ms >= half && state.ms < half + CUE_MS;
  const phase = item.poses.length ? Math.floor(state.ms / PHASE_MS[item.section]) % item.poses.length : 0;
  const left = Math.max(0, item.seconds - state.ms / 1000);
  const elapsed = done ? total : starts[state.index] + state.ms / 1000;
  const next = items[state.index + 1];
  const R = 54;
  const C = 2 * Math.PI * R;
  const control = "flex flex-col items-center gap-1 text-xs text-cream/70";
  const round = "flex h-14 w-14 items-center justify-center rounded-full border border-cream/30 text-lg text-cream transition hover:bg-cream/10";

  return (
    <>
      {button}
      {/* In <body>, above the site's own layers; it is only ever opened in the browser. */}
      {createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Class: ${title}`} className="fixed inset-0 z-50 overflow-y-auto bg-sage-800/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-5 py-6 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <p className="font-serif text-xl text-cream/85">{title}</p>
              <button type="button" onClick={end} className="pill shrink-0 whitespace-nowrap transition hover:bg-cream/10">
                End class ✕
              </button>
            </div>

            <div className="flex items-end gap-4 tabular-nums">
              <span className="pb-px text-sm text-cream/75">{clock(elapsed)}</span>
              <div className="flex-1">
                <Timeline sections={sections} elapsed={elapsed} />
              </div>
              <span className="pb-px text-sm text-cream/75">{clock(total)}</span>
            </div>

            {done ? (
              <div className="glass flex flex-col items-center gap-5 px-10 py-20 text-center">
                <h2 className="font-serif text-5xl">Class complete</h2>
                <p className="text-cream/75">{clock(total)} of class. Well danced.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => dispatch({ type: "restart" })} className="pill transition hover:bg-cream/10">
                    Start again
                  </button>
                  <button type="button" onClick={end} className="rounded-full bg-cream px-5 py-1.5 text-sage-900">
                    Back to the class
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                <div className="glass grid items-center gap-6 p-6 md:grid-cols-2 md:p-8">
                  <div className="relative mx-auto w-full max-w-[220px] md:max-w-sm">
                    {cue && (
                      <p
                        role="status"
                        className="phase-in absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-5 py-1.5 font-serif text-lg text-sage-900 shadow-lg"
                      >
                        Change sides
                      </p>
                    )}
                    {item.poses.length > 0 && (
                      <div key={`${state.index}-${phase}-${side}`} className="phase-in">
                        <Figure pose={item.poses[phase]} side={side} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 text-center md:text-left">
                    <p className="eyebrow text-cream/60">
                      {item.sectionTitle} · step {item.position} of {item.count}
                    </p>
                    <h2 className="font-serif text-4xl leading-tight md:text-5xl">{item.name}</h2>
                    <p className="text-cream/75">{item.prescription}</p>
                    {item.sided && <p className="font-serif text-xl text-gold">{sideLabel}</p>}
                    <div className="relative mx-auto h-28 w-28 md:mx-0 md:h-40 md:w-40">
                      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                        <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
                        <circle
                          cx="60"
                          cy="60"
                          r={R}
                          fill="none"
                          stroke="var(--color-gold)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={C}
                          strokeDashoffset={C * (1 - left / item.seconds)}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl tabular-nums md:text-4xl" aria-label={`${clock(Math.ceil(left))} left`}>
                        {clock(Math.ceil(left))}
                      </span>
                    </div>
                  </div>
                </div>

                <aside className="glass hidden flex-col gap-3 self-start p-5 md:flex">
                  <p className="eyebrow text-cream/60">Up next</p>
                  {next ? (
                    <>
                      <div className="mx-auto w-28">{next.poses[0] && <Figure pose={next.poses[0]} side="R" size="sm" />}</div>
                      <p className="font-serif text-lg leading-tight">{next.name}</p>
                      <p className="text-sm tabular-nums text-cream/70">{clock(next.seconds)}</p>
                    </>
                  ) : (
                    <p className="font-serif text-lg">The end of class</p>
                  )}
                </aside>
              </div>
            )}

            {!done && (
              <div className="flex flex-wrap items-end justify-center gap-5 pb-4">
                <div className={control}>
                  <button type="button" onClick={() => dispatch({ type: "prev" })} aria-label="Back" className={round}>
                    <Icon name="back" />
                  </button>
                  Back
                </div>
                <div className={control}>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "toggle" })}
                    aria-label={state.playing ? "Pause" : "Play"}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-cream text-2xl text-sage-900 shadow-lg transition hover:bg-glow"
                  >
                    <Icon name={state.playing ? "pause" : "play"} className="h-8 w-8" />
                  </button>
                  {state.playing ? "Pause" : "Play"}
                </div>
                <div className={control}>
                  <button type="button" onClick={() => dispatch({ type: "next" })} aria-label="Skip" className={round}>
                    <Icon name="skip" />
                  </button>
                  Skip
                </div>
                {item.sided && (
                  <div className={control}>
                    <div className="flex h-14 items-center rounded-full border border-cream/30 p-1">
                      {(["R", "L"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={side === s}
                          onClick={() => dispatch({ type: "side", side: s })}
                          className={`rounded-full px-4 py-2.5 text-sm transition ${side === s ? "bg-gold text-sage-900" : "text-cream/80 hover:bg-cream/10"}`}
                        >
                          {s === "R" ? "Right" : "Left"}
                        </button>
                      ))}
                    </div>
                    Side
                  </div>
                )}
              </div>
            )}
            <p aria-live="polite" className="sr-only">
              {done ? "Class complete" : `${item.name}${item.sided ? `, ${sideLabel}` : ""}`}
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
