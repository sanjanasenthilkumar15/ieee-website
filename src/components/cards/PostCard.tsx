import Image from "next/image";
import Link from "next/link";
import { CrestMotif } from "@/components/ui/CrestMotif";
import type { Post } from "@/lib/content/types";
import { formatDate } from "@/lib/format";
import { postTypes } from "@/lib/options";

export const postTypeLabel = (t: string) => postTypes.find((p) => p.value === t)?.title.replace(/ \(.*\)/, "") ?? t;

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card-lift relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="relative aspect-[16/9] overflow-hidden bg-ieee-blue-light">
        {post.coverImage ? (
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="photo-grade object-cover"
          />
        ) : (
          <CrestMotif className="absolute -right-8 -bottom-10 h-56 w-56 text-ieee-blue opacity-15" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-wider text-rmkec-green uppercase">{postTypeLabel(post.type)}</p>
        <h3 className="mt-2 text-lg leading-snug font-bold">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 hover:text-ieee-blue">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>}
        <p className="mt-auto pt-4 text-xs text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.author && <> · {post.author}</>}
        </p>
      </div>
    </article>
  );
}
