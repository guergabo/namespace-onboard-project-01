import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/glossary-ui";
import { StepPage } from "@/components/step-page";
import { getStep, getVariantParams } from "@/lib/glossary";

export async function generateStaticParams() {
  return getVariantParams();
}

export async function generateMetadata({ params }: PageProps<"/glossary/[slug]/[variant]">): Promise<Metadata> {
  const { slug, variant } = await params;
  const detail = await getStep(slug);
  const v = detail?.variants.find((x) => x.slug === variant);
  return { title: detail && v ? `${detail.step.name} · ${v.name}` : "Glossary" };
}

export default function Page({ params }: PageProps<"/glossary/[slug]/[variant]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ slug, variant }) => (
        <StepPage slug={slug} variantSlug={variant} />
      ))}
    </Suspense>
  );
}
