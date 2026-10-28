import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassForm } from "@/components/class-form";
import { ClassResult } from "@/components/class-result";
import { buildClass, parseChoices } from "@/lib/class-builder";
import { getClassCatalog } from "@/lib/glossary";

export const metadata: Metadata = { title: "Build my class" };

/** The choices and the class they build both live in the URL, so a class can be bookmarked or shared. */
async function ClassBuilder({ searchParams }: { searchParams: PageProps<"/class">["searchParams"] }) {
  const choices = parseChoices(await searchParams);
  const catalog = await getClassCatalog();
  return (
    <>
      <ClassForm key={choices ? JSON.stringify(choices) : "new"} catalog={catalog.map((s) => ({ ...s, pose: null }))} initial={choices} />
      {choices && <ClassResult sections={buildClass(catalog, choices)} choices={choices} />}
    </>
  );
}

export default function ClassPage(props: PageProps<"/class">) {
  return (
    <main className="relative z-10 mx-auto max-w-5xl space-y-10 px-6 pb-20 md:px-10">
      <header>
        <h1 className="font-serif text-6xl tracking-tight md:text-7xl">Build my class</h1>
        <p className="mt-3 max-w-xl text-cream/75">
          A class in the order of a Vaganova lesson, assembled from the glossary: barre, poses and adagio, turns, then allegro.
        </p>
      </header>
      <Suspense fallback={<div className="glass h-96 animate-pulse" />}>
        <ClassBuilder searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
