import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/glossary-ui";
import { StepPage } from "@/components/step-page";
import { getStep, getStepSlugs } from "@/lib/glossary";

export async function generateStaticParams() {
  return getStepSlugs();
}

export async function generateMetadata({ params }: PageProps<"/glossary/[slug]">): Promise<Metadata> {
  const detail = await getStep((await params).slug);
  return { title: detail?.step.name ?? "Glossary", description: detail?.step.summary };
}

export default function Page({ params }: PageProps<"/glossary/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ slug }) => (
        <StepPage slug={slug} />
      ))}
    </Suspense>
  );
}
