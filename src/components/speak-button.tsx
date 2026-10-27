"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Says a French term aloud with the browser's built-in speech, when available. */
export function SpeakButton({ text }: { text: string }) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => "speechSynthesis" in window,
    () => false,
  );
  if (!supported) return null;
  return (
    <button
      type="button"
      aria-label={`Pronounce ${text}`}
      onClick={() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "fr-FR";
        u.rate = 0.85;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      }}
      className="grid h-9 w-9 place-items-center rounded-full border border-cream/30 text-cream/80 transition hover:bg-cream/10"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" strokeLinecap="round" />
      </svg>
    </button>
  );
}
