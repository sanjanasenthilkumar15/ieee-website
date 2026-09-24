import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, User } from "lucide-react";
import { postTypeLabel } from "@/components/cards/PostCard";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { RichText } from "@/components/ui/RichText";
import { getPostBySlug, getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      publishedTime: post.date,
      images: post.coverImage ? [{ url: post.coverImage.url }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        eyebrow={postTypeLabel(post.type)}
        title={post.title}
        crumbs={[{ label: "Blog", href: "/blog" }, { label: postTypeLabel(post.type) }]}
      />
      <article className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-line pb-5 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {post.author}
                </span>
              )}
              {post.relatedEvent && (
                <Link href={`/events/${post.relatedEvent.slug}`} className="font-semibold text-ieee-blue hover:underline">
                  Event: {post.relatedEvent.title}
                </Link>
              )}
            </p>

            {post.coverImage && (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="photo-grade object-cover"
                />
              </div>
            )}

            {post.excerpt && <p className="mt-8 text-xl leading-relaxed text-ink">{post.excerpt}</p>}
            <RichText value={post.body} />

            {post.attachmentUrl && (
              <a
                href={`${post.attachmentUrl}?dl=`}
                className="mt-8 flex items-center gap-4 rounded-lg border border-line bg-surface p-4 hover:border-ieee-blue"
              >
                <Download className="h-6 w-6 text-ieee-blue" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-ink">Download attachment</span>
                  <span className="text-sm text-muted">{post.attachmentName ?? "File"}</span>
                </span>
              </a>
            )}

            <Link href="/blog" className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-ieee-blue hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All posts
            </Link>
          </div>
        </Container>
      </article>
    </>
  );
}
