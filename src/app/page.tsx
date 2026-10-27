import Link from "next/link";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { getGlossaryStats } from "@/lib/glossary";

export default async function Home() {
  const stats = await getGlossaryStats();

  return (
    <main className="relative -mt-[88px] min-h-svh overflow-hidden pt-[88px]">
      <HeroBackdrop />

      <section className="relative mx-auto flex min-h-[calc(100svh-88px)] max-w-7xl flex-col justify-between px-6 pb-10 md:px-10">
        <div className="pt-[8vh]">
          <h1 className="font-serif text-[clamp(6rem,19vw,17rem)] leading-[0.85] tracking-[-0.03em] text-cream">
            tendu
          </h1>
          <p className="mt-6 max-w-md font-serif text-xl text-cream/90 md:text-2xl">
            A Vaganova glossary of ballet steps, organised by how they move and how they connect.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/glossary"
              className="rounded-full bg-cream px-6 py-3 font-serif text-lg text-sage-900 transition hover:bg-glow"
            >
              Explore the glossary →
            </Link>
          </div>
        </div>

        <div className="glass mt-16 w-full max-w-md p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cream/70">In the glossary</p>
          <div className="mt-4 grid grid-cols-3 gap-4 border-b border-cream/15 pb-5">
            {[
              ["Steps", stats.steps],
              ["Variants", stats.variants],
              ["Terms", stats.terms],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-serif text-4xl">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-cream/65">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {stats.sections.map((s) => (
              <Link key={s.slug} href={`/glossary/category/${s.slug}`} className="pill transition hover:bg-cream/10">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
