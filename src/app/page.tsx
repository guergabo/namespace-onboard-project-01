import Link from "next/link";
import { HeroBackdrop, TenduLoop } from "@/components/hero-backdrop";
import { getGlossaryStats } from "@/lib/glossary";

export default async function Home() {
  const stats = await getGlossaryStats();

  return (
    <main className="relative -mt-[88px] min-h-svh overflow-hidden pt-[88px]">
      <HeroBackdrop />

      <section className="relative mx-auto flex min-h-[calc(100svh-88px)] max-w-7xl flex-col justify-between px-6 pb-10 md:px-10">
        <div className="pt-[3vh]">
          <h1 className="font-serif text-[clamp(6rem,18vw,15rem)] font-medium italic leading-[0.9] tracking-[-0.02em] text-cream">
            tendu
          </h1>
          <p className="mt-4 max-w-lg font-serif text-xl text-cream/90 md:text-2xl">
            A Vaganova glossary of ballet steps, organised by how they move and how they connect.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="glass w-full max-w-lg p-6">
            <p className="eyebrow text-cream/75">In the glossary</p>
            <div className="mt-3 flex items-center gap-5">
              <div className="w-28 shrink-0">
                <TenduLoop />
              </div>
              <p className="font-serif text-lg italic leading-snug text-cream/85">
                Battement tendu: devant, à la seconde, derrière.
              </p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-4 border-t border-cream/20 pt-4">
              {[
                ["Steps", stats.steps],
                ["Variants", stats.variants],
                ["Terms", stats.terms],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="eyebrow text-cream/65">{label}</p>
                  <p className="mt-1 font-serif text-3xl">{value}</p>
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
          <Link
            href="/glossary"
            className="rounded-full bg-cream px-8 py-4 font-serif text-xl text-sage-900 shadow-[0_10px_40px_rgb(47_45_27/0.35)] transition hover:bg-glow"
          >
            Explore the glossary →
          </Link>
        </div>
      </section>
    </main>
  );
}
