import { categoryColor, categoryMeta } from "@/lib/categories";

/** Small uppercase label in the category's colour (pairs with the card stripe). */
export function CategoryTag({ category, label }: { category: string; label?: string }) {
  const text = label ?? categoryMeta[category as keyof typeof categoryMeta]?.label ?? category;
  return (
    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: categoryColor(category) }}>
      {text}
    </span>
  );
}
