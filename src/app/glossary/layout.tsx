import { CategoryTree } from "@/components/glossary-ui";
import { getCategoryTree } from "@/lib/glossary";

export default async function GlossaryLayout({ children }: LayoutProps<"/glossary">) {
  const tree = await getCategoryTree();
  return (
    <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-[260px_1fr] md:px-10">
      {/* Small screens: the tree folds away so content comes first. */}
      <details className="glass p-4 md:hidden">
        <summary className="cursor-pointer px-2 text-xs uppercase tracking-[0.2em] text-cream/70">
          Browse categories
        </summary>
        <div className="mt-3">
          <CategoryTree nodes={tree} />
        </div>
      </details>
      <aside className="glass hidden h-fit p-4 md:sticky md:top-6 md:block">
        <p className="px-2 pb-3 text-xs uppercase tracking-[0.2em] text-cream/60">Glossary</p>
        <CategoryTree nodes={tree} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
