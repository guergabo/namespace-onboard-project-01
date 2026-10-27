import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, StepGrid, PageSkeleton } from "@/components/glossary-ui";
import { getCategoryPage, getCategorySlugs } from "@/lib/glossary";

export async function generateStaticParams() {
  return getCategorySlugs();
}

export async function generateMetadata({ params }: PageProps<"/glossary/category/[slug]">): Promise<Metadata> {
  const page = await getCategoryPage((await params).slug);
  return { title: page?.category.name ?? "Glossary" };
}

export default function CategoryPage({ params }: PageProps<"/glossary/category/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: { params: PageProps<"/glossary/category/[slug]">["params"] }) {
  const page = await getCategoryPage((await params).slug);
  if (!page) notFound();
  const { path, category, groups } = page;

  return (
    <main className="space-y-10">
      <header>
        <Breadcrumb
          items={[
            { href: "/glossary", label: "Glossary" },
            ...path.map((c, i) => ({ href: i < path.length - 1 ? `/glossary/category/${c.slug}` : undefined, label: c.name })),
          ]}
        />
        <h1 className="mt-4 font-serif text-5xl tracking-tight first-letter:uppercase md:text-6xl">{category.name}</h1>
        {category.description && <p className="mt-3 max-w-xl text-cream/75">{category.description}</p>}
      </header>
      {groups.map((group) => (
        <section key={group.slug}>
          {group.label && <h2 className="mb-4 font-serif text-3xl">{group.label}</h2>}
          <StepGrid steps={group.steps} />
        </section>
      ))}
    </main>
  );
}
